## 차트 동기화 규칙

한 페이지에 2개 이상의 차트(MacroChart)가 존재하면 반드시 `ChartSyncProvider`로 감싸야 합니다.

- **크로스헤어 동기화** (필수): 한 차트를 hover하면 같은 Provider 내 다른 차트들에도 같은 시점에 세로선 표시 (Datadog 스타일)
- **기간 동기화** (선택): 매크로 지표 페이지처럼 모든 차트가 같은 기간을 공유해야 할 때만 적용. 증시 흐름 페이지처럼 각 차트가 독립적인 기간을 가져야 하는 경우 각 컴포넌트에서 로컬 period state 사용
- **기간 선택 UI** (필수): 모든 차트 카드에 PeriodSelector를 표시하여 기간 변경 가능하도록 함
- 컴포넌트: `src/components/charts/ChartSyncContext.tsx`

## git 작업 계정

이 프로젝트에서 git 작업을 할 때는 **nobel6018** 계정을 반드시 사용해야 합니다.

- push 전에 `gh auth status`로 active account 확인
- 다른 계정이 active라면 `gh auth switch --user nobel6018` 실행 후 진행
