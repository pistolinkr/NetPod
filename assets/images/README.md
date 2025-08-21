# 🎨 NetPod 이미지 및 로고 폴더

이 폴더는 NetPod 웹 애플리케이션의 이미지와 로고를 저장하는 곳입니다.

## 📋 권장 파일 목록

### 필수 이미지
- `logo.png` - NetPod 메인 로고 (200x200px, 투명 배경)
- `favicon.ico` - 브라우저 탭 아이콘 (32x32px)

### 선택 이미지
- `banner.png` - 헤더 배너 (1200x300px)
- `icon-192.png` - PWA 아이콘 (192x192px)
- `icon-512.png` - PWA 아이콘 (512x512px)

## 🎯 이미지 사양

### 로고 (logo.png)
- **크기**: 200x200 픽셀
- **형식**: PNG (투명 배경 권장)
- **스타일**: 흑백 테마에 맞는 디자인
- **용도**: 헤더, 푸터, 로딩 화면

### 파비콘 (favicon.ico)
- **크기**: 32x32 픽셀
- **형식**: ICO (여러 크기 포함 권장)
- **스타일**: 간단하고 명확한 디자인
- **용도**: 브라우저 탭, 북마크

### 배너 (banner.png)
- **크기**: 1200x300 픽셀
- **형식**: PNG
- **스타일**: NetPod 브랜드 이미지
- **용도**: 헤더 배경, 소셜 미디어

## 🔧 사용 방법

### HTML에서 사용
```html
<img src="assets/images/logo.png" alt="NetPod Logo">
```

### CSS에서 사용
```css
.logo {
    background-image: url('assets/images/logo.png');
    background-size: contain;
    background-repeat: no-repeat;
}
```

### 파비콘 설정
```html
<link rel="icon" type="image/x-icon" href="assets/images/favicon.ico">
```

## 📝 참고사항

- 모든 이미지는 NetPod의 흑백 테마와 일치해야 합니다
- 투명 배경을 사용하여 다양한 배경에서 잘 보이도록 합니다
- 고해상도 디스플레이를 고려하여 2배 크기로 제작하는 것을 권장합니다
- 파일 크기는 웹 성능을 위해 최적화해야 합니다
