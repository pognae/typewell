# Typewell

검정 화면, 흰 글씨. 글쓰기에만 집중하는 미니멀 웹 에디터입니다.
로그인도, 설정도 없습니다. 열면 바로 쓰면 됩니다.

## 기능

- **순수 글쓰기 화면** — 검정 배경 + 흰 글씨, 읽고 쓰기 편한 Inter 글꼴
- **자동 저장** — 입력하는 내용이 브라우저에 자동 보관되어 새로고침해도 유지됩니다 (localStorage 사용, 서버 전송 없음)
- **마크다운 내보내기** — 다 쓰면 `.md` 파일로 저장. 첫 줄을 파일명으로 자동 사용
- **단어/글자 수 표시**
- **집중 모드** — 글을 쓰는 동안 상단 툴바가 은은하게 흐려집니다

## 단축키

| 단축키            | 동작                  |
| ----------------- | --------------------- |
| `Ctrl/Cmd` + `S`  | 마크다운으로 내보내기 |
| `Tab`             | 들여쓰기(공백 2칸)    |

## 로컬에서 실행

별도의 빌드나 의존성이 없습니다. 파일을 열기만 하면 됩니다.

```bash
# 그냥 index.html 을 브라우저로 열거나, 간단한 로컬 서버 사용
python -m http.server 8000
# http://localhost:8000 접속
```

## GitHub Pages 배포

이 저장소에는 GitHub Actions 워크플로우(`.github/workflows/deploy.yml`)가 포함되어 있어
`main` 브랜치에 푸시하면 자동으로 배포됩니다.

1. GitHub에 새 저장소를 만든 뒤 코드를 푸시합니다:

   ```bash
   git add .
   git commit -m "Initial commit: Typewell"
   git branch -M main
   git remote add origin https://github.com/<사용자명>/<저장소명>.git
   git push -u origin main
   ```

2. 저장소 **Settings → Pages → Build and deployment** 에서
   **Source** 를 **GitHub Actions** 로 설정합니다.

3. 푸시할 때마다 자동 배포되며, 주소는
   `https://<사용자명>.github.io/<저장소명>/` 입니다.

## 데이터에 대하여

작성한 글은 **사용자 브라우저에만** 저장됩니다. 외부로 전송되지 않으며,
브라우저 데이터를 지우면 함께 사라지니 중요한 글은 내보내기로 백업하세요.
