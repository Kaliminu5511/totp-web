// owner.js
// Owner PIN setup + login with PBKDF2 verifier + lockout/backoff
// Requires HTML elements with IDs used in UI (ownerBtn, ownerPanel, ownerSetup, ownerLogin, ownerContent, ownerPinNew, ownerSetBtn, ownerPinInput, ownerUnlock, viewVault, resetVault, closeOwner)

(() => {
  // Config: tuning parameters
  const KDF = { name: 'PBKDF2', hash: 'SHA-256' };
  const ITERATIONS = 200000;      // expensive enough to slow brute force (adjust if too slow on old devices)
  const KEY_LEN = 256;            // bits for derived key
  const VERIFIER_TEXT = 'projektmira-owner-verifier-v1';
  const MAX_ATTEMPTS = 5;
  const INITIAL_LOCK_MINUTES = 5; // lock time after MAX_ATTEMPTS (will double)

  // Utilities
  const b64 = (u)=> btoa(String.fromCharCode(...new Uint8Array(u)));
  const fromB64 = (s)=> Uint8Array.from(atob(s), c=>c.charCodeAt(0));
  const utf8 = (s)=> new TextEncoder().encode(s);

  // DOM refs (expect to exist)
  const ownerBtn = document.getElementById('ownerBtn');
  const ownerPanel = document.getElementById('ownerPanel');
  const closeOwner = document.getElementById('closeOwner');
  const ownerSetup = document.getElementById('ownerSetup');
  const ownerLogin = document.getElementById('ownerLogin');
  const ownerContent = document.getElementById('ownerContent');
  const ownerPinNew = document.getElementById('ownerPinNew');
  const ownerSetBtn = document.getElementById('ownerSetBtn');
  const ownerPinInput = document.getElementById('ownerPinInput');
  const ownerUnlock = document.getElementById('ownerUnlock');
  const viewVaultBtn = document.getElementById('viewVault');
  const resetVaultBtn = document.getElementById('resetVault');

  // localStorage key
  const META_KEY = 'owner_meta_v1';

  // Helper: read meta
  function readMeta(){
    try {
      const raw = localStorage.getItem(META_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e){ return null; }
  }

  // Helper: write meta
  function writeMeta(obj){
    localStorage.setItem(META_KEY, JSON.stringify(obj));
  }

  // Create random salt
  function randomSalt(len = 16){
    return crypto.getRandomValues(new Uint8Array(len));
  }

  // Derive key (returns CryptoKey)
  async function deriveKeyFromPin(pin, salt, iterations = ITERATIONS){
    const baseKey = await crypto.subtle.importKey('raw', utf8(pin), KDF, false, ['deriveBits','deriveKey']);
    // derive a raw key (bits)
    const derived = await crypto.subtle.deriveBits({
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: KDF.hash
    }, baseKey, KEY_LEN);
    // import as AES-GCM key or HMAC key for verifier (we'll import for HMAC)
    return new Uint8Array(derived);
  }

  // Make verifier: HMAC-SHA256 over VERIFIER_TEXT using derived bytes
  async function makeVerifier(derivedBytes){
    // import as HMAC key
    const key = await crypto.subtle.importKey('raw', derivedBytes, {name:'HMAC', hash:'SHA-256'}, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, utf8(VERIFIER_TEXT));
    return new Uint8Array(sig); // return raw bytes
  }

  // Set owner PIN (create meta). PIN stored only via verifier + salt + iterations
  async function setOwnerPin(pin){
    if(typeof pin !== 'string' || pin.length < 4) throw new Error('PIN too short');
    const salt = randomSalt(16);
    const derived = await deriveKeyFromPin(pin, salt, ITERATIONS);
    const verifier = await makeVerifier(derived);
    const meta = {
      salt: b64(salt),
      verifier: b64(verifier),
      iterations: ITERATIONS,
      createdAt: Date.now(),
      attempts: 0,
      lockUntil: 0,
      lockMinutes: INITIAL_LOCK_MINUTES
    };
    writeMeta(meta);
    // wipe sensitive variables (best-effort)
    zeroize(derived);
    zeroize(verifier);
    return true;
  }

  // Check PIN, returns true/false and updates attempts/lockout
  async function checkOwnerPin(pin){
    const meta = readMeta();
    if(!meta) return false;
    // check lock
    if(meta.lockUntil && Date.now() < meta.lockUntil) return { ok:false, reason:'locked', lockUntil: meta.lockUntil };

    try {
      const salt = fromB64(meta.salt);
      const derived = await deriveKeyFromPin(pin, salt, meta.iterations || ITERATIONS);
      const verifier = await makeVerifier(derived);
      const ok = b64(verifier) === meta.verifier;
      // wipe
      zeroize(derived);
      zeroize(verifier);

      if(ok){
        // reset attempts
        meta.attempts = 0;
        meta.lockUntil = 0;
        meta.lockMinutes = meta.lockMinutes || INITIAL_LOCK_MINUTES;
        writeMeta(meta);
        return { ok:true };
      } else {
        // increment attempts
        meta.attempts = (meta.attempts || 0) + 1;
        if(meta.attempts >= MAX_ATTEMPTS){
          // set lock
          const minutes = meta.lockMinutes || INITIAL_LOCK_MINUTES;
          meta.lockUntil = Date.now() + minutes * 60 * 1000;
          // exponential backoff: double next lock time
          meta.lockMinutes = Math.min(24*60, (meta.lockMinutes || INITIAL_LOCK_MINUTES) * 2);
          meta.attempts = 0; // reset attempts after lock
        }
        writeMeta(meta);
        return { ok:false, reason:'invalid', attempts: meta.attempts, lockUntil: meta.lockUntil || 0 };
      }
    } catch(e){
      return { ok:false, reason:'error' };
    }
  }

  // Reset owner meta (destructive) — only call after confirmation
  function resetOwnerMeta(){
    localStorage.removeItem(META_KEY);
  }

  // Utility to zeroize Uint8Array
  function zeroize(arr){
    if(!arr) return;
    for(let i=0;i<arr.length;i++) arr[i]=0;
  }

  // UI wiring
  function showPanel(){
    ownerPanel.style.display = 'flex';
    const meta = readMeta();
    if(!meta){
      ownerSetup.style.display = 'block';
      ownerLogin.style.display = 'none';
      ownerContent.style.display = 'none';
    } else {
      // check lock state
      if(meta.lockUntil && Date.now() < meta.lockUntil){
        ownerSetup.style.display = 'none';
        ownerLogin.style.display = 'block';
        ownerContent.style.display = 'none';
        ownerPinInput.value = '';
        ownerPinInput.placeholder = 'Gesperrt bis ' + new Date(meta.lockUntil).toLocaleString();
        ownerUnlock.disabled = true;
      }else{
        ownerSetup.style.display = 'none';
        ownerLogin.style.display = 'block';
        ownerContent.style.display = 'none';
        ownerPinInput.value = '';
        ownerPinInput.placeholder = 'PIN eingeben';
        ownerUnlock.disabled = false;
      }
    }
  }

  function hidePanel(){
    ownerPanel.style.display = 'none';
  }

  // Event handlers
  ownerBtn && ownerBtn.addEventListener('click', showPanel);
  closeOwner && closeOwner.addEventListener('click', hidePanel);

  ownerSetBtn && ownerSetBtn.addEventListener('click', async ()=>{
    const pin = (ownerPinNew && ownerPinNew.value || '').trim();
    if(!pin || pin.length < 4) { alert('PIN mindestens 4 Zeichen.'); return; }
    try {
      await setOwnerPin(pin);
      alert('PIN gesetzt. Öffne Owner-Control erneut und melde dich an.');
      ownerPinNew.value = '';
      showPanel();
    } catch(e){
      console.error(e); alert('Fehler beim Setzen des PIN.');
    }
  });

  ownerUnlock && ownerUnlock.addEventListener('click', async ()=>{
    const pin = (ownerPinInput && ownerPinInput.value || '').trim();
    if(!pin){ alert('Bitte PIN eingeben'); return; }
    try {
      const res = await checkOwnerPin(pin);
      if(res.ok){
        // owner unlocked
        ownerLogin.style.display = 'none';
        ownerContent.style.display = 'block';
        // call a hook so host app can reveal vault functions
        try { if(typeof window.ownerUnlocked === 'function') window.ownerUnlocked(); } catch(_) {}
      } else if(res.reason === 'locked'){
        alert('Account gesperrt bis ' + new Date(res.lockUntil).toLocaleString());
        showPanel();
      } else {
        alert('Falscher PIN. Versuch ' + (res.attempts || 0) + '/' + MAX_ATTEMPTS);
        showPanel();
      }
    } catch(e){
      console.error(e); alert('Fehler beim Prüfen des PIN.');
    }
  });

  // View vault button — placeholder. Only allowed after ownerContent shown.
  viewVaultBtn && viewVaultBtn.addEventListener('click', ()=>{
    // Host app should implement window.ownerViewVault() to securely show encrypted vault contents.
    if(typeof window.ownerViewVault === 'function'){
      window.ownerViewVault();
    } else {
      alert('ownerViewVault() nicht implementiert. (Bitte in app.js ergänzen)');
    }
  });

  resetVaultBtn && resetVaultBtn.addEventListener('click', ()=>{
    if(!confirm('Sicher: Vault & Owner-PIN löschen? Dies ist unwiderruflich.')) return;
    resetOwnerMeta();
    // you might also want to clear vault storage keys here (app-specific)
    alert('Owner-Meta gelöscht. App neu starten.');
    location.reload();
  });

  // expose small API if needed
  window.ownerAuth = {
    isSet: ()=> !!readMeta(),
    setPin: setOwnerPin,
    checkPin: checkOwnerPin,
    reset: resetOwnerMeta
  };

})();
