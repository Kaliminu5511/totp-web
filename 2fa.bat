@echo off
REM Erstellt alle benötigten Dateien für TOTP Web Client

REM index.html
echo ^<!doctype html^> > index.html
echo ^<html lang="de"^> >> index.html
echo ^<head^> >> index.html
echo ^<meta charset="utf-8" /^> >> index.html
echo ^<meta name="viewport" content="width=device-width,initial-scale=1" /^> >> index.html
echo ^<title^>TOTP Web — Client-side^</title^> >> index.html
echo ^<link rel="stylesheet" href="style.css" /^> >> index.html
echo ^</head^> >> index.html
echo ^<body^> >> index.html
echo ^<main id="app" class="container"^> >> index.html
echo ^<h1^>🔐 TOTP Web (Client-Side)^</h1^> >> index.html
echo ^<section id="auth" class="card"^> >> index.html
echo ^<p^>Master-Passwort (wird nur lokal verwendet):^</p^> >> index.html
echo ^<div class="row"^> >> index.html
echo ^<input id="pw" type="password" placeholder="Master-Passwort" /^> >> index.html
echo ^<button id="unlock" class="primary"^>Entsperren / Neues Passwort^</button^> >> index.html
echo ^<button id="import" class="muted"^>Import (verschlüsselte Datei)^</button^> >> index.html
echo ^<input id="filein" type="file" style="display:none" /^> >> index.html
echo ^</div^> >> index.html
echo ^<p class="mutetxt"^>Wenn keine Daten vorhanden sind, legt Entsperren ein neues, leeres Vault an.^</p^> >> index.html
echo ^</section^> >> index.html
echo ^<section id="main" class="card" style="display:none"^> >> index.html
echo ^<div class="controls row"^> >> index.html
echo ^<button id="add" class="primary"^>Neuen Account^</button^> >> index.html
echo ^<button id="export" class="muted"^>Export (verschlüsselt)^</button^> >> index.html
echo ^<button id="lock" class="danger"^>Sperren^</button^> >> index.html
echo ^</div^> >> index.html
echo ^<div id="list" class="list"^>^</div^> >> index.html
echo ^<p class="mutetxt"^>Die verschlüsselte Sicherungsdatei wird im Browser-Storage abgelegt. ^<strong^>Teile niemals dein Master-Passwort.^</strong^>^</p^> >> index.html
echo ^</section^> >> index.html
echo ^<footer class="card small"^> >> index.html
echo ^<p^>Open Source — client-side only. Host via GitHub Pages / Netlify / Vercel mit HTTPS.^</p^> >> index.html
echo ^</footer^> >> index.html
echo ^</main^> >> index.html
echo ^<script src="app.js"^>^</script^> >> index.html
echo ^</body^> >> index.html
echo ^</html^> >> index.html

REM style.css
(
echo :root{--bg:#0f1720;--card:#0b1220;--text:#e6eef8;--muted:#98a3b3;--accent:#7dd3fc;--danger:#ff7b7b;--radius:10px;--mono:"ui-monospace","SFMono-Regular",Menlo,Monaco,"Roboto Mono","Courier New",monospace;}
echo *{box-sizing:border-box}
echo html,body{height:100%%;margin:0;background:linear-gradient(180deg,#071021 0%,#071924 100%%);font-family:Inter,system-ui,Segoe UI,Arial;color:var(--text)}
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
echo .acc{display:flex;align-items:center;justify-content:space-between;padding:10px;border-radius:8px;background:rgba(255,255,255,0.015);font-family:var(--mono)}
echo .acc .meta{display:flex;flex-direction:column;gap:4px}
echo .acc .name{font-weight:700}
echo .acc .code{font-size:20px;letter-spacing:2px}
echo .acc .actions{display:flex;gap:8px;align-items:center}
echo .smallbtn{padding:6px 8px;border-radius:6px;border:0;background:rgba(255,255,255,0.03);color:var(--text);cursor:pointer;font-weight:600}
echo .progress{height:10px;border-radius:8px;overflow:hidden;background:rgba(255,255,255,0.03);margin-left:12px;flex:1;display:flex;align-items:center}
echo .bar{height:100%%;transition:width 0.2s linear}
) > style.css

REM app.js
(
echo // app.js - Client-side TOTP Manager
echo // (kopiere den gesamten app.js Inhalt aus meiner Nachricht)
) > app.js

REM README.md
(
echo # TOTP Web (Client-side) - Open Source
echo
echo **Kurze Beschreibung:** statische Single-Page App, TOTP generieren, client-side only
echo
echo ## Dateien
echo - index.html
echo - style.css
echo - app.js
echo - README.md
echo - LICENSE
echo
echo ## Deployment
echo - GitHub Pages: Branch main, root folder
) > README.md

REM LICENSE
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

echo.
echo Dateien wurden erstellt. Du kannst nun:
echo git add .
echo git commit -m "Initial commit: TOTP Web Client"
