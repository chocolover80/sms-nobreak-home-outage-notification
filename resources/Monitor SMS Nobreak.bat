@echo off
setlocal enabledelayedexpansion

echo Agente monitorando o Nobreak. Aguarde...

:: Navegando até a pasta do agente de verificação do nobreak e executando o código.
cd /d C:\node\sms-nobreak-home-outage-notification

:: Criar pasta de logs se necessário
if not exist operational_logs (
    mkdir operational_logs
)

:: Obter data e hora
for /f "tokens=1-3 delims=/" %%a in ('echo %date%') do (
    set day=%%a
    set month=%%b
    set year=%%c
)
set hour=%time:~0,2%
set minute=%time:~3,2%
set second=%time:~6,2%
if "%hour:~0,1%"==" " set hour=0%hour:~1,1%

:: Criar timestamp e nome do log
set timestamp=%day%-%month%-%year%_%hour%-%minute%-%second%
set logFile=operational_logs\operational_log_%timestamp%.txt
set formattedTimestamp=%day%/%month%/%year%, %hour%:%minute%:%second%.

:: Escrever tudo (inclusive execução do node) no log de uma vez só
(
    echo Log criado em: %formattedTimestamp%
    echo.
    node index.js %logFile%
) >> %logFile%

echo O agente terminou a varredura! Verifique o log para saber detalhes.
echo Log salvo em %logFile%
exit

