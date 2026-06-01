import { useEffect, useRef, useState } from 'react';
import './App.css'; // 분리된 CSS 파일 임포트

function App() {
    const mapRef = useRef(null);
    const roadviewRef = useRef(null);

    const [map, setMap] = useState(null);
    const [roadview, setRoadview] = useState(null);

    // 출발지, 경유지, 목적지 좌표 상태 관리
    const [startPlace, setStartPlace] = useState({ name: '', lat: '', lng: '' });
    const [viaPlace, setViaPlace] = useState({ name: '', lat: '', lng: '' });
    const [endPlace, setEndPlace] = useState({ name: '', lat: '', lng: '' });

    // 입력 필드 상태 관리
    const [startInput, setStartInput] = useState('');
    const [viaInput, setViaInput] = useState('');
    const [endInput, setEndInput] = useState('');

    // 이동수단 상태 관리 (기본값: 자동차 'car')
    const [transport, setTransport] = useState('car');

    // 1. 지도 및 로드뷰 초기화 (기본 지도 띄우기)
    useEffect(() => {
        const kakao = window.kakao;
        if (!kakao || !mapRef.current || !roadviewRef.current) return;

        // 기본 중심 좌표 설정 (서울시청)
        const centerLatLng = new kakao.maps.LatLng(37.566826, 126.9786567);

        // [기본 지도 띄우기] 지도 객체 생성 및 옵션 설정
        const initializedMap = new kakao.maps.Map(mapRef.current, {
            center: centerLatLng, // 지도의 중심좌표
            level: 3,             // 지도의 확대 레벨
        });
        setMap(initializedMap);

        // 초기 지도 떴을 때 중심점에 기본 마커 하나 꽂아두기
        new kakao.maps.Marker({
            map: initializedMap,
            position: centerLatLng
        });

        // 로드뷰 객체 생성
        const initializedRoadview = new kakao.maps.Roadview(roadviewRef.current);
        setRoadview(initializedRoadview);

        // 초기 위치 기준 로드뷰 파노라마 ID 조회 및 설정
        const roadviewClient = new kakao.maps.RoadviewClient();
        roadviewClient.getNearestPanoId(centerLatLng, 50, (panoId) => {
            if (panoId) {
                initializedRoadview.setPanoId(panoId, centerLatLng);
            }
        });
    }, []);

    // 2. 장소 검색 및 좌표/로드뷰 동기화 함수
    const searchLocation = (type) => {
        const kakao = window.kakao;
        if (!kakao || !map || !roadview) return;

        let keyword = '';
        if (type === 'start') keyword = startInput;
        if (type === 'via') keyword = viaInput;
        if (type === 'end') keyword = endInput;

        if (!keyword.trim()) return;

        const places = new kakao.maps.services.Places();
        places.keywordSearch(keyword, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
                const place = result[0];
                const coords = new kakao.maps.LatLng(place.y, place.x);

                // 검색된 장소로 지도 중심 이동 및 마커 생성
                map.setCenter(coords);
                new kakao.maps.Marker({ map, position: coords });

                // 로드뷰 위치 갱신
                const roadviewClient = new kakao.maps.RoadviewClient();
                roadviewClient.getNearestPanoId(coords, 50, (panoId) => {
                    if (panoId) {
                        roadview.setPanoId(panoId, coords);
                    }
                });

                // 규격화된 장소 데이터 구조 객체 생성 (이름, 위도, 경도)
                const targetPlace = { name: place.place_name, lat: place.y, lng: place.x };

                if (type === 'start') setStartPlace(targetPlace);
                if (type === 'via') setViaPlace(targetPlace);
                if (type === 'end') setEndPlace(targetPlace);
            } else {
                alert('검색 결과가 없습니다.');
            }
        });
    };

    // 3. 규칙 기반 길찾기 URL 생성 및 실행 함수
    const openNavigation = () => {
        if (!startPlace.lat || !endPlace.lat) {
            alert('출발지와 목적지는 필수 항목입니다.');
            return;
        }

        const startInfo = `${startPlace.name},${startPlace.lat},${startPlace.lng}`;
        const endInfo = `${endPlace.name},${endPlace.lat},${endPlace.lng}`;

        let naviUrl = '';

        // 대중교통('traffic')은 명세에 따라 경유지 지정 불가능하므로 예외 처리
        if (transport === 'traffic' || !viaPlace.lat) {
            naviUrl = `https://map.kakao.com/link/by/${transport}/${startInfo}/${endInfo}`;
        } else {
            const viaInfo = `${viaPlace.name},${viaPlace.lat},${viaPlace.lng}`;
            naviUrl = `https://map.kakao.com/link/by/${transport}/${startInfo}/${viaInfo}/${endInfo}`;
        }

        window.open(naviUrl, '_blank');
    };

    return (
        <div>
            <h1>카카오맵 멀티 라우팅 내비게이션</h1>

            {/* 옵션 설정 (이동수단 변경) */}
            <div>
                <label>이동 수단: </label>
                <select value={transport} onChange={(e) => setTransport(e.target.value)}>
                    <option value="car">자동차</option>
                    <option value="traffic">대중교통 (경유지 제외)</option>
                    <option value="walk">도보</option>
                    <option value="bicycle">자전거</option>
                </select>
            </div>

            {/* 위치 검색 입력란 */}
            <div>
                <div>
                    <input type="text" value={startInput} onChange={(e) => setStartInput(e.target.value)} placeholder="출발지 입력" />
                    <button onClick={() => searchLocation('start')}>출발지 지정</button>
                </div>

                <div>
                    <input type="text" value={viaInput} onChange={(e) => setViaInput(e.target.value)} placeholder="경유지 입력 (선택)" />
                    <button onClick={() => searchLocation('via')}>경유지 지정</button>
                </div>

                <div>
                    <input type="text" value={endInput} onChange={(e) => setEndInput(e.target.value)} placeholder="목적지 입력" />
                    <button onClick={() => searchLocation('end')}>목적지 지정</button>
                </div>
            </div>

            {/* 내비게이션 매핑 트리거 실행 버튼 */}
            <div>
                <button onClick={openNavigation}>지정한 조건으로 길찾기 실행</button>
            </div>

            {/* 데이터 매핑 검증 확인 영역 */}
            <div>
                <p>출발지: {startPlace.name || '미지정'}</p>
                <p>경유지: {viaPlace.name || '미지정'}</p>
                <p>목적지: {endPlace.name || '미지정'}</p>
            </div>

            {/* 지도 및 로드뷰 화면 레이아웃 (CSS 클래스 매핑) */}
            <div className="maps-wrapper">
                <div>
                    <h3>일반 지도</h3>
                    <div ref={mapRef} className="kakao-map-container"></div>
                </div>
                <div>
                    <h3>실시간 로드뷰</h3>
                    <div ref={roadviewRef} className="kakao-roadview-container"></div>
                </div>
            </div>
        </div>
    );
}

export default App;