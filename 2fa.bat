@echo off
REM =============================================
REM TOTP-Web: Dateien erstellen, Commit + Push
REM =============================================

cd C:\Users\KayLeh\Documents\totp-web

REM -------- style.css --------
(
echo :root{--bg:#0f1720;--card:#0b1220;--text:#e6eef8;--muted:#98a3b3;--accent:#7dd3fc;--danger:#ff7b7b;--radius:10px;}
echo *{box-sizing:border-box}
echo html,body{height:100%%;margin:0;font-family:Inter,system-ui;color:var(--text);background:linear-gradient(180deg,#071021,#071924);}
echo .container{max-width:920px;margin:32px auto;padding:16px}
echo h1{margin:0 0 12px 0;font-weight:600}
echo .card{background:linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01));padding:16px;border-radius:var(--radius);margin:12px 0;box-shadow:0 6px 18px rgba(0,0,0,0.5)}
echo .small{font-size:13px;opacity:0.9}
echo .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
echo input[type="password"],input[type="text"]{background:transparent;border:1px solid rgba(255,255,255,0.06);padding:10px 12px;border-radius:8px;color:var(--text);min-width:220px;}
echo button{padding:9px 12px;border-radius:8px;border:0;cursor:pointer;font-weight:600}
echo button.primary{background:linear-gradient(90deg,#60a5fa,#7dd3fc);color:#021226}
echo button.muted{background:rgba(255,255,255,0.03);color:var(--text)}
echo button.danger{background:linear-gradient(90deg,#ff7b7b,#ffb4a2);color:#2b0f0f}
echo .mutetxt{color:var(--muted);font-size:13px;margin-top:8px}
echo .list{margin-top:12px;display:flex;flex-direction:column;gap:8px}
echo .acc{display:flex;align-items:center;justify-content:space-between;padding:10px;border-radius:8px;background:rgba(255,255,255,0.015);font-family:monospace}
) > style.css

REM -------- app.js --------
(
echo // app.js - Client-side TOTP Manager
echo console.log("TOTP Web App loaded. Implementiere hier die Funktionen für Accounts und TOTP Codes.");
) > app.js

REM -------- README.md --------
(
echo # TOTP Web (Client-side)
echo
echo Client-side TOTP Web App. Alles lokal, kein Server benötigt.
echo
echo ## Dateien
echo - index.html
echo - style.css
echo - app.js
echo - README.md
echo - LICENSE
) > README.md

REM -------- LICENSE --------
(
echo MIT License
echo
echo Copyright (c) 2025 KayLeh
echo
echo Permission is hereby granted, free of charge, to any person obtaining a copy
echo of this software and associated documentation files (the "Software"), to deal
echo in the Software without restriction, including without limitation the rights
echo to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
echo copies of the Software, and to permit persons to whom the Software is
echo furnished to do so, subject to the following conditions:
echo
echo THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
echo IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
echo FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
echo AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
echo LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
echo OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
echo THE SOFTWARE.
) > LICENSE

REM -------- Git Commit + Push --------
git add .
git commit -m "Add missing files: style.css, app.js, README.md, LICENSE"
git push -u origin main

echo.
echo =============================================
echo Alle Dateien wurden erstellt und zu GitHub gepusht.
echo Prüfe dein Repository: https://github.com/Kaliminu5511/totp-web
echo =============================================
pause
