@REM SPDX-License-Identifier: AGPL-3.0-only
@ECHO off

SETLOCAL

IF NOT EXIST openapi-generator-cli-7.2.0.jar (
  echo "Downloading openapi-generator-cli.jar from Maven Central..."
  powershell -Command "Invoke-WebRequest -OutFile openapi-generator-cli-7.2.0.jar https://repo1.maven.org/maven2/org/openapitools/openapi-generator-cli/7.2.0/openapi-generator-cli-7.2.0.jar"
)

set JAVA_HOME="C:\Program Files\Java\jdk-21"

%JAVA_HOME%\bin\java -jar openapi-generator-cli-7.2.0.jar generate ^
    -i ../diag-server.yml ^
    -g python-flask ^
    -o . ^
    -c config.yaml ^
    --ignore-file-override=.openapi-generator-ignore

REM Add license headers to auto-generated files

SET "SPDX=AGPL-3.0-only"
ECHO Adding SPDX license identifier '%SPDX%' to all auto-generated files

POWERSHELL -NoProfile -ExecutionPolicy Bypass ^
  -Command ^
  "$sp='%SPDX%';" ^
  "$nl=[Environment]::NewLine;" ^
  "Get-ChildItem -LiteralPath . -Recurse -File -Filter *.py | ForEach-Object {" ^
  "  $p=$_.FullName; $raw=[IO.File]::ReadAllText($p);" ^
  "  if ($raw -match '(?m)^\s*#\s*SPDX-License-Identifier:\s*.+$') { return }" ^
  "  $lines=$raw -split '\r?\n',-1; $i=0;" ^
  "  if ($lines.Count -gt 0 -and $lines[0] -match '^#!') { $i=1 }" ^
  "  if ($lines.Count -gt $i -and $lines[$i] -match '^(#\s*-\*-\s*coding:.*-\*-|#\s*coding\s*:\s*\S+)') { $i++ }" ^
  "  $hdr=@(); if ($i -gt 0) { $hdr += $lines[0..($i-1)] }" ^
  "  $hdr += ('# SPDX-License-Identifier: ' + $sp);" ^
  "  $rest=($lines[$i..($lines.Count-1)] 2>$null) -join $nl;" ^
  "  $out=($hdr -join $nl)+$nl+$rest;" ^
  "  [IO.File]::WriteAllText($p,$out,(New-Object Text.UTF8Encoding($false)))" ^
  "}"

ECHO Done
ENDLOCAL