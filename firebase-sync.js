/* Firebase Realtime Database সংযোগ + সেটআপ উইজার্ড + সংযোগ পরীক্ষা
   app.js বদলাতে হয় না: এই ফাইল window.claude নামে অ্যাডাপ্টার দেয়। কনফিগ না থাকলেও উইজার্ড কাজ করে। */
(function () {
  var KEY = 'fb_cfg';
  var $ = function (i) { return document.getElementById(i); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function loadCfg() {
    var C = window.FB_CONFIG || {};
    if (C.apiKey && C.databaseURL) return C;
    try { var l = JSON.parse(localStorage.getItem(KEY) || '{}'); if (l.apiKey && l.databaseURL) return l; } catch (e) {}
    return C;
  }
  var C = loadCfg(), conf = !!(C && C.apiKey && C.databaseURL), sdk = !!window.firebase, auth = null, db = null, first = null, initErr = '';
  var staff = function (u) { return !!u && !u.isAnonymous; };
  if (conf && sdk) {
    try {
      firebase.initializeApp(C); auth = firebase.auth(); db = firebase.database();
      first = new Promise(function (res) { var un = auth.onAuthStateChanged(function (u) { un(); res(u); }); });
    } catch (e) { initErr = e.message || String(e); auth = null; db = null; first = null; }
  }
  /* ---------- অ্যাডাপ্টার (app.js এর সিঙ্ক ইঞ্জিন এটাই ব্যবহার করে) ---------- */
  if (auth && db) {
    var PUBLIC = { catalog: 1, orders: 1 };
    var map = function (p) { return PUBLIC[p.split('/')[0]] ? p : 'shop/' + p; };
    var clean = function (d) { return JSON.parse(JSON.stringify(d === undefined ? null : d)); };
    var fix = function (path, v) {
      if (path === 'cfg/main' && v) { ['cl', 'nt', 'ncd'].forEach(function (k) { if (v[k] === undefined) v[k] = {}; }); if (v.eh === undefined) v.eh = []; }
      return v;
    };
    var adapter = {
      doc: function (path) {
        var r = db.ref(map(path));
        return {
          set: function (d) { return r.set(clean(d)); },
          delete: function () { return r.remove(); },
          get: function () { return r.get().then(function (s) { return { data: function () { return fix(path, s.val()); } }; }); },
          onSnapshot: function (cb, err) {
            var f = function (s) { cb({ data: function () { return fix(path, s.val()); } }); };
            r.on('value', f, err || function () {});
            return function () { r.off('value', f); };
          }
        };
      },
      collection: function (name) {
        var r = db.ref(map(name));
        return {
          onSnapshot: function (cb, err) {
            var docs = {}, e = err || function () {};
            var emit = function (type, s) {
              var d = { id: s.key, data: function () { return s.val(); } };
              if (type === 'removed') delete docs[s.key]; else docs[s.key] = d;
              cb({ docs: Object.keys(docs).map(function (k) { return docs[k]; }), docChanges: function () { return [{ type: type, doc: d }]; } });
            };
            r.on('child_added', function (s) { emit('added', s); }, e);
            r.on('child_changed', function (s) { emit('modified', s); }, e);
            r.on('child_removed', function (s) { emit('removed', s); }, e);
          }
        };
      }
    };
    var noop = { set: function () { return Promise.resolve(); }, delete: function () { return Promise.resolve(); }, get: function () { return Promise.resolve({ data: function () { return null; } }); }, onSnapshot: function () {} };
    var limited = { doc: function (p) { return PUBLIC[p.split('/')[0]] ? adapter.doc(p) : noop; }, collection: function () { return { onSnapshot: function () {} }; } };
    window.claude = {
      use: function (n) {
        return first.then(function (u) {
          if (n === 'db') {
            if (staff(u)) return adapter;
            if (!u && /#order/.test(location.hash)) return auth.signInAnonymously().then(function () { return limited; });
            if (u && u.isAnonymous) return limited;
            return null;
          }
          if (n === 'user') return { id: function () { return Promise.resolve(auth.currentUser ? auth.currentUser.uid : ''); } };
          return null;
        });
      }
    };
  }
  /* ---------- সেটআপ উইজার্ড ---------- */
  function parse(t) {
    var o = {};
    ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'].forEach(function (k) {
      var m = t.match(new RegExp(k + '\\s*[:=]\\s*["\']([^"\']+)["\']')); if (m) o[k] = m[1];
    });
    if (!o.databaseURL && o.projectId) o.databaseURL = 'https://' + o.projectId + '-default-rtdb.firebaseio.com';
    return o;
  }
  function setMsg(id, t, ok) { var e = $(id); if (e) { e.innerHTML = t; e.style.color = ok ? '#15803d' : '#dc2626'; } }
  var ERR = {
    'auth/wrong-password': 'পাসওয়ার্ড ভুল।', 'auth/invalid-credential': 'ইমেইল বা পাসওয়ার্ড ভুল (বা অ্যাকাউন্ট নেই — "অ্যাকাউন্ট তৈরি" চাপুন)।',
    'auth/user-not-found': 'এই ইমেইলের অ্যাকাউন্ট নেই — "অ্যাকাউন্ট তৈরি" চাপুন।', 'auth/invalid-email': 'ইমেইল ঠিক নয়।',
    'auth/email-already-in-use': 'এই ইমেইলে অ্যাকাউন্ট আছে — "লগইন" চাপুন।', 'auth/weak-password': 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের দিন।',
    'auth/operation-not-allowed': 'Firebase এ Email/Password চালু নেই: Authentication → Sign-in method → Email/Password → Enable।',
    'auth/network-request-failed': 'ইন্টারনেট সংযোগ নেই বা ব্লক হচ্ছে।', 'auth/invalid-api-key': 'apiKey ভুল — কনফিগ আবার কপি করুন।',
    'auth/too-many-requests': 'অনেকবার চেষ্টা হয়েছে, কিছুক্ষণ পর আবার করুন।', 'auth/unauthorized-domain': 'Authentication → Settings → Authorized domains এ এই ওয়েবসাইটের ডোমেইন যোগ করুন।'
  };
  function rulesText(email) {
    var em = email || 'আপনার-ইমেইল@gmail.com', c = "auth != null && (auth.token.email == '" + em + "')";
    return JSON.stringify({ rules: { shop: { '.read': c, '.write': c }, catalog: { '.read': true, '.write': c }, orders: { '.read': c, '$uid': { '.read': 'auth != null && auth.uid == $uid', '.write': 'auth != null && auth.uid == $uid', '.validate': "newData.hasChild('list')" } } } }, null, 2);
  }
  window.fbWiz = function () {
    var u = auth && auth.currentUser, st = !conf ? '❌ কনফিগ বসানো হয়নি' : !sdk ? '❌ Firebase লাইব্রেরি লোড হয়নি (ইন্টারনেট/ব্লকার চেক করুন)' : initErr ? '❌ ' + esc(initErr) : staff(u) ? '✅ সংযুক্ত: ' + esc(u.email || '') : '⚠ কনফিগ আছে, কিন্তু স্টাফ লগইন করা নেই';
    window.md('<h3>☁ ক্লাউড সেটআপ — সব ডিভাইসে একই ডাটা</h3><div class="tt" style="font-size:14px">অবস্থা: ' + st + '</div>' +
      '<b>ধাপ ১ — Firebase কনফিগ বসান</b><small>Firebase Console → ⚙ Project settings → Your apps → Web (&lt;/&gt;) → firebaseConfig এর পুরো লেখাটা কপি করে এখানে পেস্ট করুন:</small><textarea id="fbt" rows="5" style="width:100%" placeholder="const firebaseConfig = {\n  apiKey: &quot;...&quot;,\n  databaseURL: &quot;https://...&quot;,\n  ..."></textarea><button onclick="fbSave()">💾 কনফিগ সেভ করুন</button><div id="fbm1" style="font-size:14px"></div>' +
      '<hr><b>ধাপ ২ — স্টাফ ইমেইল দিয়ে লগইন</b><input id="fbe" placeholder="ইমেইল" autocomplete="off"><input id="fbp" type="password" placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"><div class="r"><button onclick="fbIn(0)">লগইন</button><button class="o" onclick="fbIn(1)">নতুন অ্যাকাউন্ট তৈরি (প্রথমবার)</button>' + (staff(u) ? '<button class="d" onclick="fbOut()">সাইন আউট</button>' : '') + '</div><div id="fbm2" style="font-size:14px"></div>' +
      '<hr><b>ধাপ ৩ — Rules (নিরাপত্তা)</b><small>Realtime Database → Rules এ নিচের লেখা পেস্ট করে Publish করুন (ইমেইল ধাপ ২ এ লিখলে নিজে বসে যায়):</small><textarea id="fbr" rows="8" style="width:100%" readonly onclick="this.select()">' + esc(rulesText(u && u.email)) + '</textarea>' +
      '<hr><b>ধাপ ৪ — পরীক্ষা</b><button onclick="fbDiag()">🔍 সংযোগ পরীক্ষা করুন</button><div id="fbd" style="font-size:14px;margin-top:6px"></div>');
  };
  window.fbSave = function () {
    var o = parse($('fbt').value || '');
    if (!o.apiKey || !o.databaseURL) return setMsg('fbm1', '❌ apiKey বা databaseURL পাওয়া যায়নি। Realtime Database তৈরি করেছেন তো? পুরো firebaseConfig আবার কপি করুন।');
    try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { return setMsg('fbm1', '❌ ব্রাউজারে সেভ করা যাচ্ছে না'); }
    var txt = 'window.FB_CONFIG = ' + JSON.stringify(o, null, 2) + ';';
    setMsg('fbm1', '✅ সেভ হয়েছে। পেজ রিলোড হচ্ছে…<br><small style="color:#475569">সব ডিভাইসে নিজে নিজে চালাতে চাইলে এই লেখা <b>firebase-config.js</b> ফাইলে বসিয়ে GitHub এ আপলোড করুন:</small><textarea rows="6" style="width:100%" readonly onclick="this.select()">' + esc(txt) + '</textarea>', true);
    setTimeout(function () { location.reload(); }, 4000);
  };
  window.fbIn = function (create) {
    if (!auth) return setMsg('fbm2', '❌ আগে ধাপ ১ করে কনফিগ সেভ করুন (লাইব্রেরি/কনফিগ প্রস্তুত নয়)।');
    var e = ($('fbe').value || '').trim(), p = $('fbp').value || '';
    if (!e || !p) return setMsg('fbm2', '❌ ইমেইল ও পাসওয়ার্ড দিন');
    setMsg('fbm2', 'অপেক্ষা করুন…', true);
    (create ? auth.createUserWithEmailAndPassword(e, p) : auth.signInWithEmailAndPassword(e, p)).then(function () {
      setMsg('fbm2', '✅ সফল। পেজ রিলোড হচ্ছে… (Rules এ এই ইমেইল যোগ করা না থাকলে ডাটা ঢুকবে না)', true); setTimeout(function () { location.reload(); }, 1200);
    }, function (x) { setMsg('fbm2', '❌ ' + (ERR[x && x.code] || (x && (x.code || x.message)) || 'ব্যর্থ')); });
  };
  window.fbOut = function () { if (auth) auth.signOut().then(function () { location.reload(); }); };
  window.fbDiag = async function () {
    var out = [], add = function (ok, t, h) { out.push((ok ? '✅ ' : '❌ ') + t + (!ok && h ? '<br><small style="color:#475569">→ ' + h + '</small>' : '')); };
    add(location.protocol !== 'file:', 'পেজ ওয়েব লিংক থেকে খোলা', 'ফাইল সরাসরি (file://) খুললে লগইন চলে না — GitHub Pages এর লিংক ব্যবহার করুন');
    add(sdk, 'Firebase লাইব্রেরি লোড হয়েছে', 'ইন্টারনেট চেক করুন, অ্যাডব্লকার/VPN বন্ধ করে দেখুন');
    add(conf, 'কনফিগ (apiKey + databaseURL) আছে', 'ধাপ ১ করুন');
    if (initErr) add(false, 'Firebase চালু হয়নি: ' + esc(initErr), 'databaseURL ঠিক আছে কি দেখুন');
    if (auth && db) {
      var u = auth.currentUser; add(staff(u), 'স্টাফ লগইন করা আছে' + (u && u.email ? ' (' + esc(u.email) + ')' : ''), 'ধাপ ২ এ লগইন করুন');
      if (staff(u)) {
        try {
          await db.ref('shop/_ping').set({ t: Date.now(), by: u.email || '' });
          var s = await db.ref('shop/_ping').get(); add(!!(s && s.val()), 'ডাটাবেসে লেখা ও পড়া কাজ করছে');
          await db.ref('shop/_ping').remove();
        } catch (e) {
          add(false, 'ডাটাবেসে লেখা/পড়া যাচ্ছে না (' + esc(e.code || e.message) + ')', (e.code === 'PERMISSION_DENIED' || /permission/i.test(e.message || '')) ? 'Rules এ আপনার ইমেইল সঠিকভাবে লিখে Publish করেছেন কি দেখুন (ধাপ ৩)' : 'databaseURL ঠিক আছে কি এবং Realtime Database তৈরি আছে কি দেখুন');
        }
      }
    }
    $('fbd').innerHTML = out.join('<br>');
  };
  /* ---------- বোতাম বসানো ---------- */
  function addButtons() {
    var lc = document.querySelector('.lc');
    if (lc && !$('fbw')) { var b0 = document.createElement('button'); b0.className = 'o'; b0.id = 'fbw'; b0.textContent = '☁ ক্লাউড সেটআপ / সংযোগ পরীক্ষা'; b0.onclick = function () { window.fbWiz(); }; lc.appendChild(b0); }
    if (/#order/.test(location.hash)) return;
    var hs = $('hs'); if (!hs) return;
    var put = function (t) { var b = document.createElement('button'); b.className = 'hb'; b.id = 'fbb'; b.textContent = t; b.onclick = function () { window.fbWiz(); }; hs.parentNode.insertBefore(b, hs.nextSibling); };
    if (first) first.then(function (u) { put(staff(u) ? '☁ ক্লাউড' : '☁ ক্লাউড লগইন'); }); else put('☁ ক্লাউড সেটআপ');
  }
  addButtons();
})();
