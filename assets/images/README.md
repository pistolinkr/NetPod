# 📁 NetPod 이미지 폴더 구조

이 폴더는 NetPod 웹 애플리케이션의 이미지와 로고를 저장하는 곳입니다.

## 📁 폴더 구조

```
assets/images/
├── logo/               # 반응형 로고 이미지
│   ├── 80x80/         # 데스크톱용 로고 (80x80px)
│   ├── 60x60/         # 태블릿용 로고 (60x60px)
│   └── 50x50/         # 모바일용 로고 (50x50px)
└── README.md           # 이 파일
```

## 🎯 로고 이미지 사양

### 반응형 로고 (logo.png)
각 폴더에 동일한 파일명 `logo.png`로 저장해야 합니다:

- **80x80/logo.png**: 데스크톱 화면용 (768px 이상)
- **60x60/logo.png**: 태블릿 화면용 (768px 이하)
- **50x50/logo.png**: 모바일 화면용 (480px 이하)

### 이미지 형식
- **파일 형식**: PNG (투명 배경 권장)
- **스타일**: NetPod 흑백 테마에 맞는 디자인
- **용도**: 헤더 로고, 반응형 디스플레이

## 🔧 사용 방법

### HTML에서 사용
```html
<!-- 3개 크기의 로고가 모두 포함되어 있음 -->
<img src="assets/images/logo/80x80/logo.png" class="logo-img logo-80">
<img src="assets/images/logo/60x60/logo.png" class="logo-img logo-60">
<img src="assets/images/logo/50x50/logo.png" class="logo-img logo-50">
```

### CSS에서 사용
```css
/* CSS 미디어 쿼리로 화면 크기별 로고 전환 */
.logo-80 { display: block; }    /* 기본 표시 */
.logo-60 { display: none; }     /* 기본 숨김 */
.logo-50 { display: none; }     /* 기본 숨김 */

@media (max-width: 768px) {
    .logo-80 { display: none; }
    .logo-60 { display: block; }
}

@media (max-width: 480px) {
    .logo-60 { display: none; }
    .logo-50 { display: block; }
}
```

## 📝 참고사항

- 모든 로고 이미지는 동일한 디자인이어야 합니다
- 투명 배경을 사용하여 다양한 배경에서 잘 보이도록 합니다
- 파일명은 반드시 `logo.png`로 통일해야 합니다
- CSS에서 자동으로 화면 크기에 맞는 로고를 표시합니다
