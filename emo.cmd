@echo off
setlocal enabledelayedexpansion

rem Define the file extensions to include
set "extensions=.js .jsx .py"

rem Define the directory to exclude
set "excludeDir=node_modules"

rem Define the temporary file to store the list of files
set "fileList=files.txt"

rem Clear the temporary file
if exist %fileList% del %fileList%

rem Function to recursively find files with specified extensions
:findFiles
for /r %1 %%f in (*.*) do (
    if "%%~dpf" neq "%~dp0%excludeDir%" (
        for %%e in (%extensions%) do (
            if /i "%%~xf"==%%e echo %%~dpf"%%~nxf" >> %fileList%
        )
    )
)
exit /b

rem Call the findFiles function starting from the current directory
call :findFiles .

rem Initialize the total line count
set totalLines=0

rem Read the file list and count lines
for /f "delims=" %%f in (%fileList%) do (
    set /a lines=0
    for /f %%l in (%%f) do set /a lines+=1
    echo %%f: !lines! lines
    set /a totalLines+=lines
)

rem Print the total line count
echo Total lines of code: %totalLines%

rem Clean up the temporary file
del %fileList%

endlocal