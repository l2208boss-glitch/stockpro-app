@echo off
chcp 65001 >nul
cd /d "%~dp0"

REM Garante que o Git PODE abrir a janela de login.
REM (Sem isto, se o .bat for iniciado por um processo que
REM  proibe prompts, ele herda a proibicao e falha.)
set "GIT_TERMINAL_PROMPT=1"
set "GCM_INTERACTIVE=auto"
set "GIT_ASKPASS="
set "SSH_ASKPASS="

echo.
echo  ============================================
echo   PUBLICAR STOCKPRO
echo  ============================================
echo.
echo  Enviando as mudancas para o GitHub...
echo.
echo  (Se abrir uma janela do navegador pedindo
echo   login do GitHub, faca o login. E so uma vez.)
echo.

git push origin main

echo.
if errorlevel 1 (
  echo  ------------------------------------------
  echo   NAO DEU CERTO.
  echo.
  echo   Se apareceu janela de login, faca o login
  echo   e clique neste arquivo de novo.
  echo  ------------------------------------------
) else (
  echo  ------------------------------------------
  echo   PUBLICADO COM SUCESSO!
  echo.
  echo   Espere 1 minuto e abra o site.
  echo   No celular/PC, de Ctrl+Shift+R para
  echo   pegar a versao nova.
  echo  ------------------------------------------
)

echo.
pause
