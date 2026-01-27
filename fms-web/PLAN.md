# 화면닫기 버튼 및 종료 확인 팝업 구현 계획

## 현재 상태 분석

### 이미 구현된 컴포넌트
1. **Header.tsx** - 화면닫기 버튼 포함
   - `onClose` prop: 클릭 시 호출되는 콜백
   - `showCloseButton` prop: 버튼 표시 여부 (기본값: true)
   - onClose가 없으면 router.back() 호출

2. **CloseConfirmModal.tsx** - 종료 확인 모달
   - `isOpen`, `onClose`, `onConfirm` props
   - 커스텀 title, message 지원

### 현재 문제점
- 57개 페이지에서 CloseConfirmModal을 import하고 있으나
- 일부 페이지는 Header에 onClose prop을 전달하지 않음
- 일부 페이지는 뒤로가기(popstate) 이벤트를 처리하지 않음

## 구현 계획

### Phase 1: 목록 페이지 수정 (List Pages)
Header에 onClose 연결 및 CloseConfirmModal 활성화

수정 대상 페이지 (목록 화면):
1. `logis/booking/sea/page.tsx`
2. `logis/booking/air/page.tsx`
3. `logis/quote/sea/page.tsx`
4. `logis/quote/air/page.tsx`
5. `logis/quote/request/page.tsx`
6. `logis/quote/request/list/page.tsx`
7. `logis/sr/sea/page.tsx`
8. `logis/sn/sea/page.tsx`
9. `logis/schedule/sea/page.tsx`
10. `logis/schedule/air/page.tsx`
11. `logis/ams/sea/page.tsx`
12. `logis/customs/sea/page.tsx`
13. `logis/manifest/sea/page.tsx`
14. `logis/import-bl/sea/page.tsx`
15. `logis/import-bl/air/page.tsx`
16. 기타 목록 페이지들

### Phase 2: 상세 페이지 수정 (Detail Pages - [id])
동일한 패턴 적용

수정 대상 페이지:
1. `logis/quote/sea/[id]/page.tsx`
2. `logis/quote/air/[id]/page.tsx`
3. `logis/schedule/sea/[id]/page.tsx`
4. `logis/schedule/air/[id]/page.tsx`
5. `logis/quote/request/[id]/page.tsx`
6. `logis/import-bl/air/[id]/page.tsx`

### Phase 3: 기타 페이지 수정
나머지 페이지들에 동일 패턴 적용

수정 대상:
- transport, warehouse, export, cargo, cost, document 등

## 구현 패턴

각 페이지에 다음 코드 추가:

```tsx
// 1. 상태 추가
const [showCloseModal, setShowCloseModal] = useState(false);

// 2. 핸들러 함수 추가
const handleCloseClick = () => {
  setShowCloseModal(true);
};

const handleConfirmClose = () => {
  setShowCloseModal(false);
  router.back();
};

// 3. Header에 onClose prop 전달
<Header
  title="페이지 제목"
  subtitle="경로"
  onClose={handleCloseClick}
/>

// 4. CloseConfirmModal 렌더링
<CloseConfirmModal
  isOpen={showCloseModal}
  onClose={() => setShowCloseModal(false)}
  onConfirm={handleConfirmClose}
/>
```

## 수정해야 할 총 페이지 수
- 목록 페이지: 약 25개
- 상세 페이지: 약 10개
- 기타 페이지: 약 15개
- **총합: 약 50개 페이지**

## 예상 결과
- 모든 페이지 헤더에 "화면닫기" 버튼 표시
- 화면닫기 클릭 시 확인 팝업 표시
- 브라우저 뒤로가기 시 확인 팝업 표시

## 우선순위
1. 목록 페이지 (가장 많이 사용)
2. 등록/수정 페이지 (이미 대부분 구현됨)
3. 상세 페이지
4. 기타 페이지
