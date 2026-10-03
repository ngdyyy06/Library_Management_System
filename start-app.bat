@echo off
setlocal

title Library Management System

cd /d "%~dp0"

echo ========================================
echo      LIBRARY MANAGEMENT SYSTEM
echo ========================================
echo.

echo [1/2] Preparing application...
echo.

call library-management-backend\mvnw.cmd -f library-management-backend\pom.xml compile -q

if errorlevel 1 (
    echo.
    echo ERROR: Backend compilation failed.
    echo.
    pause
    exit /b 1
)

echo Backend compiled successfully.
echo.

echo [2/2] Starting application...
echo.

call library-management-backend\mvnw.cmd ^
    -f library-management-backend\pom.xml ^
    org.codehaus.mojo:exec-maven-plugin:3.5.0:java ^
    -Dexec.mainClass=com.library.management.LibraryManagementLauncher ^
    -Dexec.classpathScope=runtime

echo.
echo ========================================
echo      APPLICATION CLOSED
echo ========================================
echo.

endlocal