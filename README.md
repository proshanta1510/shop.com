# দুর্গাপুর এন্টারপ্রাইজ — দোকান ম্যানেজমেন্ট

ফাইল: `index.html` (পেজ) · `style.css` (ডিজাইন) · `app.js` (সব লজিক) · `firebase-config.js` (আপনার Firebase তথ্য) · `firebase-sync.js` (Firebase সংযোগ) · `database.rules.json` (সিকিউরিটি রুলস)

## ক) GitHub Pages এ চালু করা
1. GitHub এ **New repository** (Public) → **Add file → Upload files** → সব ফাইল আপলোড → **Commit**।
2. **Settings → Pages** → *Deploy from a branch* → `main` / `(root)` → **Save**।
3. লিংক: `https://ইউজারনেম.github.io/রিপো-নাম/`

> `firebase-config.js` ফাঁকা থাকলে অ্যাপ লোকাল মোডে চলে (ডাটা শুধু ওই ব্রাউজারে)।

## খ) Firebase Realtime Database সংযোগ (সব ডিভাইসে একই ডাটা)
1. **console.firebase.google.com** → **Add project** (Analytics বন্ধ রাখতে পারেন)।
2. **Build → Realtime Database → Create database** → Location: **Singapore (asia-southeast1)** → *Start in locked mode*।
3. **Build → Authentication → Get started → Sign-in method**:
   - **Email/Password** → Enable
   - **Anonymous** → Enable (গ্রাহকের অনলাইন অর্ডারের জন্য)
4. **Authentication → Users → Add user**: স্টাফ/মালিকের ইমেইল ও পাসওয়ার্ড বানান (যত ডিভাইস/স্টাফ, চাইলে একই অ্যাকাউন্টও চলবে)।
5. **Realtime Database → Rules** ট্যাবে `database.rules.json` এর পুরো লেখা পেস্ট করে **Publish**।
6. **Project settings (⚙) → General → Your apps → `</>` (Web)** → অ্যাপ রেজিস্টার করুন → যে `firebaseConfig` দেখাবে তার `apiKey, authDomain, databaseURL, projectId, appId` কপি করে **`firebase-config.js`** এ বসান। (`databaseURL` Realtime Database পেজের উপরে লেখা থাকে।)
7. **Authentication → Settings → Authorized domains** এ `ইউজারনেম.github.io` যোগ করুন।
8. আপডেট করা ফাইল GitHub এ আবার আপলোড করুন।

### প্রথমবার ব্যবহার
- অ্যাপ খুলে উপরের বারে **☁ ক্লাউড লগইন** চাপুন → ধাপ ৪ এর ইমেইল/পাসওয়ার্ড দিন (প্রতি ডিভাইসে একবার)।
- তারপর অ্যাপের নিজের লগইন (`admin / admin123`)।
- স্ট্যাটাসে **☁ সিঙ্ক চালু** দেখালে হয়ে গেছে। **প্রথম ডিভাইসের পুরনো ডাটা নিজে ক্লাউডে উঠে যাবে**, তাই আগে **সেটিংস → ব্যাকআপ** নিয়ে রাখুন।
- অন্য ডিভাইসে একই লিংক খুলে একই ধাপ করলে সেখানে সব ডাটা নেমে আসবে।

### গ্রাহকের অনলাইন অর্ডার
- গ্রাহক `…/index.html#order` লিংকে ঢুকে পণ্য বেছে অর্ডার দিলে তা সরাসরি Firebase এ যায় এবং অ্যাডমিন প্যানেলের **অনলাইন অর্ডার** এ নিজে চলে আসে।
- গ্রাহক শুধু পণ্যের তালিকা (catalog) পড়তে ও নিজের অর্ডার লিখতে পারে, দোকানের কোনো হিসাব দেখতে বা বদলাতে পারে না।

## মনে রাখবেন
- Firebase `apiKey` গোপন নয়, কিন্তু **Rules ঠিক থাকলে** অন্য কেউ ডাটা পড়তে পারবে না। Rules পাবলিশ করতে ভুলবেন না।
- স্টাফের পাসওয়ার্ডসহ সব ডাটা ক্লাউডে থাকে; শুধু Firebase লগইনকারীরা পড়তে পারে। তাই অচেনা কাউকে Firebase অ্যাকাউন্ট দেবেন না।
- Firebase বিনামূল্যের (Spark) প্ল্যানে ১ GB স্টোরেজ ও মাসে ১০ GB ডাউনলোড মেলে। ছোট দোকানের জন্য যথেষ্ট; পণ্যের ছবি ছোট রাখুন।
- বারকোড/QR ও ফন্টের জন্য ইন্টারনেট লাগে।
- ডাটা ব্যাকআপ নিয়মিত নিন (সেটিংস → ব্যাকআপ)।
