:: Example batch file - update the path below, place the batch file in your
:: system path, and you can run nn as a command
@echo.
@echo off

php -q console.php %*

echo.
exit /B %ERRORLEVEL%