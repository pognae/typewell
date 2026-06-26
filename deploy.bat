@echo off
chcp 65001 >nul
setlocal

cd /d "%~dp0"

echo ========================================
echo   Typewell 배포 시작
echo ========================================

rem 커밋 메시지: 인자로 주면 그걸 쓰고, 없으면 현재 시각으로 자동 생성
set "MSG=%*"
if "%MSG%"=="" set "MSG=update: %date% %time%"

echo.
echo [1/3] 변경사항 스테이징...
git add -A

rem 변경사항이 없으면 커밋 건너뛰기
git diff --cached --quiet
if %errorlevel%==0 (
  echo 변경된 내용이 없습니다. 커밋을 건너뜁니다.
) else (
  echo.
  echo [2/3] 커밋: %MSG%
  git commit -m "%MSG%"
)

echo.
echo [3/3] GitHub로 push (자동 배포 트리거)...
git push origin main
if %errorlevel% neq 0 (
  echo.
  echo [오류] push 실패. 위 메시지를 확인하세요.
  pause
  exit /b 1
)

echo.
echo ========================================
echo   배포 완료!
echo   진행 상태: https://github.com/pognae/typewell/actions
echo   사이트:    https://pognae.github.io/typewell/
echo ========================================
echo.
pause
