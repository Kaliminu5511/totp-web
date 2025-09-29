// --- Minimal TOTP Web App JS ---
// Funktioniert direkt mit index.html von deinem Repo

const STEP = 30;  // TOTP Intervall
const DIGITS = 6; // Länge des Codes

// Demo-Account (nur für Test)
const DEMO_SECRET = 'JBSWY3DPEHPK3PXP';
const DEMO_NAME = 'Demo Account';

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

function renderList() {
  const listEl = document.getElementById('list');
  listEl.innerHTML = '';
  vault.forEach(async (acc,i)=>{
    const {otp, secondsLeft} = await totpFromBase32(acc.secret);
    const div = document.createElement('div');
    div.className = 'row';
    div.innerHTML = `<strong>${acc.name}</strong>: <span class="code">${otp}</span> <span class="muted">${secondsLeft}s</span>`;
    listEl.appendChild(div);
  });
}

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

// --- Event Handlers ---
document.getElementById('unlock').addEventListener('click', async ()=>{
  const pw = document.getElementById('pw').value;
  if(!pw) { alert('Master-Passwort eingeben!'); return; }
  const loaded = await loadVault(pw);
  if(loaded === null) { vault = []; } // Neues Vault
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
  const pw = prompt('Master-Passwort zum Export:');
  if(!pw) return;
  await saveVault(pw);
  alert('Vault lokal verschlüsselt gespeichert (localStorage).');
});

document.getElementById('lock').addEventListener('click', ()=>{
  document.getElementById('auth').style.display='block';
  document.getElementById('main').style.display='none';
  document.getElementById('pw').value='';
});

// --- Demo Account anzeigen ---
vault.push({name:DEMO_NAME, secret:DEMO_SECRET});
renderList();

// --- Auto-Update alle 1 Sekunde ---
setInterval(renderList,1000);
