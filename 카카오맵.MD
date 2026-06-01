# React + Vite 카카오맵 사용 가이드라인

Kakao Developer 설정부터 React 컴포넌트 적용까지의 단계별 가이드입니다.

---

## 1. Kakao Developer 사전 준비
1. **앱 생성**
    * [Kakao Developers](https://developers.kakao.com/)에서 애플리케이션을 추가합니다.
2. **카카오맵 활성화**
    * 플랫폼 설정 등에서 필요한 기능을 활성화합니다.
3. **도메인 입력**
    * 애플리케이션 설정의 '웹' 플랫폼에 현재 개발 중인 도메인(예: `http://localhost:5173`)을 등록합니다.
4. **키 env나 appkey에 넣기**
    * 발급받은 JavaScript 키를 환경 변수에 등록합니다.

---

## 2. 환경 변수 및 파일 설정

### env 예시
프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 발급받은 키를 입력합니다.
Vite 프로젝트는 %VITE_...% 가 필수로 포함되어야 합니다.
```env
# .env 파일
VITE_KAKAO_API="발급 받은 APP KEY"
```

### index.html 예시
`<head>` 태그 내부에 카카오 지도 스크립트를 추가합니다.

```html
<head>
  ...
  <script
    type="text/javascript"
    src="//dapi.kakao.com/v2/maps/sdk.js?appkey=%VITE_KAKAO_API%"
  ></script>
</head>
```

---

## 3. React 코드 구현

### 지도 영역 코드 예시
```javascript
<div ref={mapRef} style={{ width: '500px', height: '400px' }}></div>
```

### 지도 띄우는 함수 예시
```javascript
useEffect(() => {
  const kakao = window.kakao;
  const container = mapRef.current; // 지도를 담을 영역의 DOM 참조

  // 지도를 생성할 때 필요한 기본 옵션
  const options = {
    center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표.
    level: 3, // 지도의 레벨(확대, 축소 정도)
  };

  new kakao.maps.Map(container, options); // 지도 생성 및 객체 리턴
}, []);
```

### 전체코드 예시
```javascript
import { useEffect, useRef } from 'react';

function App() {
    const mapRef = useRef(null);

    useEffect(() => {
        const kakao = window.kakao;
        const container = mapRef.current; // 지도를 담을 영역의 DOM 참조

        // 지도를 생성할 때 필요한 기본 옵션
        const options = {
            center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표.
            level: 3, //
        };

        new kakao.maps.Map(container, options); // 지도 생성 및 객체 리턴
    }, []);

    return (
        <>
            <h1>카카오맵</h1>
            <div ref={mapRef} style={{ width: '500px', height: '400px' }}></div>
        </>
    );
}

export default App;
```