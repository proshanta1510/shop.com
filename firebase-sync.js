/* Firebase Realtime Database সংযোগ — app.js এর বিদ্যমান সিঙ্ক ইঞ্জিনকে চালায়।
   app.js বদলাতে হয় না: এই ফাইল window.claude নামে একটি অ্যাডাপ্টার দেয়। */
(function () {
  var C = window.FB_CONFIG;
  if (!C || !C.apiKey || !C.databaseURL || !window.firebase) return;   // কনফিগ নেই → লোকাল মোড
  firebase.initializeApp(C);
  var auth = firebase.auth(), db = firebase.database();
  var first = new Promise(function (res) { var un = auth.onAuthStateChanged(function (u) { un(); res(u); }); });
  var staff = function (u) { return !!u && !u.isAnonymous; };
  var PUBLIC = { catalog: 1, orders: 1 };
  var map = function (p) { return PUBLIC[p.split('/')[0]] ? p : 'shop/' + p; };
  var clean = function (d) { return JSON.parse(JSON.stringify(d === undefined ? null : d)); };
  var fix = function (path, v) {              // RTDB খালি তালিকা/অবজেক্ট রাখে না — ডিফল্ট ফিরিয়ে দিই
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
          var docs = {};
          var emit = function (type, s) {
            var d = { id: s.key, data: function () { return s.val(); } };
            if (type === 'removed') delete docs[s.key]; else docs[s.key] = d;
            cb({ docs: Object.keys(docs).map(function (k) { return docs[k]; }), docChanges: function () { return [{ type: type, doc: d }]; } });
          };
          var e = err || function () {};
          r.on('child_added', function (s) { emit('added', s); }, e);
          r.on('child_changed', function (s) { emit('modified', s); }, e);
          r.on('child_removed', function (s) { emit('removed', s); }, e);
        }
      };
    }
  };
  // গ্রাহক (বেনামি) শুধু catalog পড়তে ও নিজের অর্ডার লিখতে পারে; বাকি সব নিষ্ক্রিয়
  var noop = { set: function () { return Promise.resolve(); }, delete: function () { return Promise.resolve(); }, get: function () { return Promise.resolve({ data: function () { return null; } }); }, onSnapshot: function () {} };
  var limited = {
    doc: function (p) { return PUBLIC[p.split('/')[0]] ? adapter.doc(p) : noop; },
    collection: function () { return { onSnapshot: function () {} }; }
  };
  window.claude = {
    use: function (n) {
      return first.then(function (u) {
        if (n === 'db') {
          if (staff(u)) return adapter;
          if (!u && /#order/.test(location.hash)) return auth.signInAnonymously().then(function () { return limited; });
          if (u && u.isAnonymous) return limited;
          return null;                         // স্টাফ লগইন নেই → লোকাল মোড
        }
        if (n === 'user') return { id: function () { return Promise.resolve(auth.currentUser ? auth.currentUser.uid : ''); } };
        return null;
      });
    }
  };
  // ---- স্টাফের ক্লাউড লগইন/সাইন আউট বোতাম ----
  window.fbIn = function () {
    var e = document.getElementById('fbe').value.trim(), p = document.getElementById('fbp').value, m = document.getElementById('fbm');
    m.textContent = 'অপেক্ষা করুন…';
    auth.signInWithEmailAndPassword(e, p).then(function () { location.reload(); }, function (x) { m.textContent = '❌ লগইন হয়নি: ' + (x && x.code || x); });
  };
  window.fbOut = function () { auth.signOut().then(function () { location.reload(); }); };
  first.then(function (u) {
    if (/#order/.test(location.hash)) return;
    var hs = document.getElementById('hs'); if (!hs) return;
    var b = document.createElement('button'); b.className = 'hb'; b.id = 'fbb'; b.textContent = staff(u) ? '☁ সাইন আউট' : '☁ ক্লাউড লগইন';
    b.onclick = function () {
      if (staff(u)) return window.md('<h3>☁ ক্লাউড সংযুক্ত</h3><p>' + window.E(u.email || '') + '</p><button class="d" onclick="fbOut()">সাইন আউট</button>');
      window.md('<h3>☁ ক্লাউড (Firebase) লগইন</h3><small>Firebase এ বানানো স্টাফ ইমেইল/পাসওয়ার্ড দিন। একবার দিলে এই ডিভাইসে মনে থাকবে।</small><input id="fbe" placeholder="ইমেইল"><input id="fbp" type="password" placeholder="পাসওয়ার্ড"><button onclick="fbIn()">লগইন</button><div id="fbm" class="red" style="font-size:14px"></div>');
    };
    hs.parentNode.insertBefore(b, hs.nextSibling);
  });
})();
