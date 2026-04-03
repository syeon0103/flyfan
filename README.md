# 펜팔 (Fenpal) - K-pop 덕질 커뮤니티

Gemstone v7 Design System을 기반한 Next.js 14 + Tailwind CSS K-pop 팬 커뮤니티 플랫폼입니다.

## 프로젝트 구조

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with fonts
│   ├── globals.css              # Global styles
│   ├── page.tsx                 # Home/Explore page
│   ├── posts/
│   │   ├── [id]/page.tsx        # Post detail
│   │   ├── [id]/matching/page.tsx # Matching interaction
│   │   └── create/
│   │       ├── fan-meet/page.tsx
│   │       └── buddy/page.tsx
│   ├── profile/
│   │   ├── settings/page.tsx
│   │   ├── keyword-select/page.tsx
│   │   └── timeline/add/page.tsx
│   ├── saved/page.tsx           # Saved posts
│   └── report/page.tsx          # Report modal
└── components/
    ├── ui/                       # Base UI components
    │   ├── Button.tsx
    │   ├── Input.tsx
    │   ├── Textarea.tsx
    │   ├── Tag.tsx
    │   └── Modal.tsx
    ├── layout/                   # Layout components
    │   ├── TopAppBar.tsx
    │   └── BottomNavBar.tsx
    ├── posts/                    # Post-related components
    │   ├── RecruitmentCard.tsx
    │   └── IdolSlot.tsx
    └── profile/                  # Profile-related components
        └── TimelineItem.tsx
```

## 기술 스택

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Font**: Pretendard (Korean font)

## Design System (Gemstone v7)

### Colors
- **Primary**: `#000000` (Black)
- **Surface**: `#FFFFFF` (White)
- **Muted**: `#F5F5F5` (Light Gray)
- **Border**: `#E5E5E5`
- **Text Primary**: `#1A1A1A`
- **Text Secondary**: `#666666`
- **Text Muted**: `#999999`
- **Accent Pink**: `#FFB5C8`
- **Accent Purple**: `#C8B5FF`
- **Accent Mint**: `#B5FFD9`
- **Status Open**: `#22C55E` (Green)
- **Status Closed**: `#9CA3AF` (Gray)

### Border Radius
- `rounded-xs`: 4px
- `rounded-sm`: 8px
- `rounded-md`: 12px
- `rounded-lg`: 16px
- `rounded-xl`: 20px

### Shadows
- `shadow-subtle`: 0 2px 8px rgba(0,0,0,0.08)

## Features

### 홈 / 탐색 (Home/Explore)
- 덕메, 비계친 탭 네비게이션
- 검색 및 필터 기능
- 모집글 카드 목록
- FAB 버튼 (신규 글 작성)
- 하단 네비게이션 바

### 모집글 상세 (Post Detail)
- 상태 표시 (모집중/매칭완료)
- 프로필 카드
- 상세 정보 (날짜, 장소, 조건)
- 댓글 섹션
- 쪽지 보내기 및 즐겨찾기

### 덕메 모집글 작성 (Fan-meet Creation)
- 아티스트 선택
- 활동 지역, 날짜 설정
- 필수 조건 선택
- 자기소개 텍스트

### 비계친 모집글 작성 (Buddy Creation)
- 아이돌 멀티 선택
- 제목, 나이대, 활동 빈도 설정
- 자기소개
- 세이프존 태그 설정

### 프로필 설정 (Profile Settings)
- 덕질 페르소나 관리
- 기본 정보 (최애 멤버, MBTI)
- 키워드 설정
- 덕질 타임라인
- 세이프존 설정

### 저장된 게시글 (Saved Posts)
- 북마크한 게시글 목록
- 탭 필터 (전체, 덕메)

### 추가 페이지
- 키워드 선택 모달
- 신고 모달
- 타임라인 추가
- 매칭 상호작용

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 시작
npm start
```

## 프로젝트 설정 시 중요사항

- 모든 페이지는 한국어 콘텐츠 사용
- 모바일 우선 디자인 (390px 이상 권장)
- 반응형 레이아웃 (lg: 1280px)
- 고정 헤더 및 네비게이션 바
- 하단 네비게이션 바는 모든 페이지에서 사용 가능 (모달 제외)

## 라이선스

MIT
