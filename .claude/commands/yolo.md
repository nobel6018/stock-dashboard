현재 변경사항을 커밋 → PR 생성 → 머지까지 한 번에 처리합니다.

## 사전 체크

1. `gh auth status`로 현재 GitHub 계정 확인
2. **nobel6018** 계정이 아니면 즉시 중단하고 "GitHub 계정이 nobel6018이 아닙니다. 계정을 확인해 주세요." 안내

## 절차

1. `git status`와 `git diff`로 변경사항 확인
2. 변경된 파일만 staging하여 새 브랜치 생성
3. 적절한 커밋 메시지 작성 후 커밋
4. `git push -u origin <branch>`
5. `gh pr create`로 PR 생성
6. `gh pr merge --merge`로 즉시 머지
7. PR URL 출력
8. `git checkout main && git fetch origin main && git merge --ff-only origin/main`로 로컬 main 동기화

## 주의사항

- .env, credentials 등 민감 파일은 커밋하지 않음
- 커밋 메시지는 변경 내용을 정확히 반영하는 한국어로 작성
- Co-Authored-By 태그 포함
