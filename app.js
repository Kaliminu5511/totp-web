// --- Minimal OTP Web App JS V.5.2.0 ---
// Funktioniert direkt mit index.html von deinem Repo

const STEP = 30;  // TOTP Intervall
const DIGITS = 6; // Länge des Codes

// --- Base32 Decoder ---
function base32toBytes(base32) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  base32 = (base32 || '').toUpperCase().replace(/=+$/,'').replace(/[^A-Z2-7]/g,'');
  let bits = '';
  for (let i=0;i<base32.length;i++){
    bits += alphabet.indexOf(base32[i]).toString(2).padStart(5,'0');
  }
  const bytes = [];
  for (let i=0;i+8<=bits.length;i+=8) bytes.push(parseInt(bits.slice(i,i+8),2));
  return new Uint8Array(bytes);
}

// --- HOTP / TOTP using WebCrypto ---
async function hotp(keyBytes, counter) {
  const key = await crypto.subtle.importKey('raw', keyBytes, {name:'HMAC', hash:'SHA-1'}, false, ['sign']);
  const buf = new ArrayBuffer(8), view = new DataView(buf);
  view.setUint32(0, Math.floor(counter / 0x100000000), false);
  view.setUint32(4, counter >>> 0, false);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf));
  const offset = sig[sig.length - 1] & 0xf;
  const code = (((sig[offset] & 0x7f) << 24) |
                ((sig[offset+1] & 0xff) << 16) |
                ((sig[offset+2] & 0xff) << 8) |
                (sig[offset+3] & 0xff)) >>> 0;
  return code;
}

async function totpFromBase32(secret) {
  const kb = base32toBytes(secret);
  const counter = Math.floor(Date.now()/1000 / STEP);
  const n = await hotp(kb, counter);
  const otp = (n % (10**DIGITS)).toString().padStart(DIGITS,'0');
  const secondsLeft = STEP - (Math.floor(Date.now()/1000) % STEP);
  return {otp, secondsLeft};
}

// --- Vault Management ---
let vault = [];
let masterPw = null;

// --- Encryption / Decryption (AES-GCM) ---
async function deriveKey(pass, salt) {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:120000,hash:'SHA-256'}, base, {name:'AES-GCM',length:256}, false, ['encrypt','decrypt']);
}

async function saveVault(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const plain = new TextEncoder().encode(JSON.stringify(vault));
  const cipher = new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv}, key, plain));
  const out = btoa(String.fromCharCode(...salt,...iv,...cipher));
  localStorage.setItem('totp_vault', out);
}

async function loadVault(password) {
  const b = localStorage.getItem('totp_vault');
  if(!b) return null;
  const raw = Uint8Array.from(atob(b), c=>c.charCodeAt(0));
  const salt = raw.slice(0,16), iv = raw.slice(16,28), cipher = raw.slice(28);
  const key = await deriveKey(password, salt);
  try{
    const plain = await crypto.subtle.decrypt({name:'AES-GCM',iv}, key, cipher);
    vault = JSON.parse(new TextDecoder().decode(plain));
    return true;
  }catch(e){ return false; }
}

// --- Render TOTP Liste ---
async function renderList() {
  const listEl = document.getElementById('list');
  listEl.innerHTML = '';
  for(const acc of vault){
    const {otp, secondsLeft} = await totpFromBase32(acc.secret);
    const div = document.createElement('div');
    div.className = 'row';
    div.innerHTML = `<strong>${acc.name}</strong>: <span class="code">${otp}</span> <span class="muted">${secondsLeft}s</span>`;
    listEl.appendChild(div);
  }
}

// --- Auth Buttons ---
document.getElementById('unlock').addEventListener('click', async ()=>{
  const pw = document.getElementById('pw').value;
  if(!pw) { alert('Master-Passwort eingeben!'); return; }
  masterPw = pw;
  const loaded = await loadVault(masterPw);
  if(loaded === null){ vault = []; }
  document.getElementById('auth').style.display='none';
  document.getElementById('main').style.display='block';
  renderList();
});

document.getElementById('add').addEventListener('click', ()=>{
  const name = prompt('Account-Name');
  const secret = prompt('Base32 Secret');
  if(name && secret){ vault.push({name,secret}); renderList(); }
});

document.getElementById('export').addEventListener('click', async ()=>{
  if(!masterPw) { alert('Zuerst entsperren!'); return; }
  await saveVault(masterPw);
  alert('Vault lokal verschlüsselt gespeichert.');
});

document.getElementById('lock').addEventListener('click', ()=>{
  masterPw = null;
  document.getElementById('auth').style.display='block';
  document.getElementById('main').style.display='none';
  document.getElementById('pw').value='';
});

// --- Owner-Panel ---
const ownerBtn = document.getElementById("ownerBtn");
const ownerPanel = document.getElementById("ownerPanel");
const closeOwner = document.getElementById("closeOwner");
const ownerSetup = document.getElementById("ownerSetup");
const ownerLogin = document.getElementById("ownerLogin");
const ownerContent = document.getElementById("ownerContent");
const ownerPinNew = document.getElementById("ownerPinNew");
const ownerSetBtn = document.getElementById("ownerSetBtn");
const ownerPinInput = document.getElementById("ownerPinInput");
const ownerUnlock = document.getElementById("ownerUnlock");
const ownerVaultList = document.getElementById("ownerVaultList");
const ownerBack = document.getElementById("ownerBack");
const ownerResetPin = document.getElementById("ownerResetPin");
const resetVault = document.getElementById("resetVault");

let ownerPin = localStorage.getItem("ownerPin") || null;

ownerBtn.addEventListener("click", ()=>{
  if(!ownerPin){
    ownerSetup.style.display = "block";
    ownerLogin.style.display = "none";
  }else{
    ownerSetup.style.display = "none";
    ownerLogin.style.display = "block";
  }
  ownerContent.style.display = "none";
  ownerPanel.style.display = "flex";
});

closeOwner.addEventListener("click", ()=>{
  ownerPanel.style.display = "none";
});

// --- PIN Setup ---
ownerSetBtn.addEventListener("click", ()=>{
  const pin = ownerPinNew.value.trim();
  if(!pin) return alert("PIN eingeben!");
  localStorage.setItem("ownerPin", pin);
  ownerPin = pin;
  ownerSetup.style.display = "none";
  alert("PIN gespeichert!");
});

// --- PIN Login ---
ownerUnlock.addEventListener("click", ()=>{
  const pin = ownerPinInput.value.trim();
  if(pin === ownerPin){
    ownerLogin.style.display = "none";
    ownerContent.style.display = "block";
    renderOwnerVault();
  }else alert("Falscher PIN!");
});

// --- Owner Vault Render ---
function renderOwnerVault(){
  ownerVaultList.innerHTML = '';
  vault.forEach(acc=>{
    const div = document.createElement("div");
    div.className = "vault-entry";
    div.innerHTML = `<strong>${acc.name}</strong>: <span class="vault-secret">${acc.secret}</span>`;
    ownerVaultList.appendChild(div);
  });
}

ownerBack.addEventListener("click", ()=>{
  ownerContent.style.display = "none";
  ownerPanel.style.display = "none";
});

ownerResetPin.addEventListener("click", ()=>{
  if(confirm("PIN wirklich zurücksetzen?")){
    localStorage.removeItem("ownerPin");
    ownerPin = null;
    alert("PIN gelöscht!");
    ownerContent.style.display = "none";
  }
});

resetVault.addEventListener("click", ()=>{
  if(confirm("Vault wirklich löschen?")){
    vault = [];
    saveVault(masterPw);
    renderList();
    renderOwnerVault();
    alert("Vault gelöscht!");
  }
});

// --- Demo Account & Auto-Update ---
const DEMO_SECRET = 'JBSWY3DPEHPK3PXP';
const DEMO_NAME = 'Demo Account';
vault.push({name:DEMO_NAME, secret:DEMO_SECRET});
renderList();
setInterval(renderList, 1000);
