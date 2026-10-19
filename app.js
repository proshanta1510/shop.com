// ===== DASHBOARD (বাকি অংশ ও ড্যাশবোর্ড পেজ) =====
const PA = { bank: '🏦 ব্যাংক', cash: '💵 নগদ (হাতে)', inc: '➕ অন্যান্য আয়', exp: '🧾 ব্যক্তিগত খরচ' }, pb = ac => S.pv.filter(e => e.ac == ac).reduce((a, e) => a + e.a, 0);
const pbx = () => `<div class="cd"><h3>🔒 ব্যক্তিগত বক্স <small>(দোকানের হিসাবের সাথে যুক্ত হয় না)</small></h3>${Object.entries(PA).map(([k, v]) => `<div class="r" style="align-items:center"><span style="flex:1">${v}: <b class="${pb(k) < 0 ? 'red' : ''}" style="font-size:16px">৳${f(pb(k))}</b></span><button onclick="pe_('${k}',1)">＋</button><button class="o" onclick="pe_('${k}',-1)">−</button></div>`).join('')}<button class="o" onclick="pst()" style="width:100%">📄 স্টেটমেন্ট / এডিট / ডিলিট</button></div>`;

function uwi(d) { 
    let sl = S.sl.filter(x => x.d == d), pu = S.pu.filter(x => x.d == d);
    let us = [...new Set([...sl.map(x => x.u), ...pu.map(x => x.u)])];
    if (!us.length) return `<div class="cd"><h3>👥 কর্মী ভিত্তিক বিক্রয় ও ক্রয় (${d})</h3><p>এই তারিখে কোনো রেকর্ড নেই।</p></div>`;
    
    return `<div class="cd"><h3>👥 কর্মী ভিত্তিক বিক্রয় ও ক্রয় (${d})</h3>` + tbl(['ইউজার', 'বিক্রয় পরিমাণ', 'মোট টাকা', 'ক্রয় পরিমাণ', 'মোট ক্রয়'], us.map(u => {
        let s_ = sl.filter(x => x.u == u), p_ = pu.filter(x => x.u == u);
        let st = s_.reduce((a, x) => a + x.tot, 0), pt = p_.reduce((a, x) => a + x.a, 0);
        return `<tr><td>${E(u)}</td><td>${s_.length}টি</td><td>৳${f(st)}</td><td>${p_.length}টি</td><td>৳${f(pt)}</td></tr>`;
    })) + `</div>`;
}

P.dash = () => {
    let d = td(), sl = S.sl.filter(x => x.d == d), st = sl.reduce((a, x) => a + x.tot, 0), ex = S.ex.filter(x => x.d == d).reduce((a, x) => a + x.a, 0);
    let pu = S.pu.filter(x => x.d == d).reduce((a, x) => a + x.a, 0), gp = sl.reduce((a, x) => a + x.items.reduce((b, y) => {
        let pr = S.pr.find(p => p.id == y.id);
        return b + y.q * (y.p - (pr ? pr.b : 0));
    }, 0), 0);
    
    return `<div class="g2"><div class="cd"><h3>📊 আজকের সারসংক্ষেপ (${d})</h3><div class="r"><input type="date" id="dd" value="${d}" onchange="go('dash')"></div><div class="g2"><div class="pi"><h3>৳${f(st)}</h3>${t('আজকের বিক্রয়')}</div><div class="pi"><h3>৳${f(gp)}</h3>${t('গ্রস লাভ')}</div><div class="pi"><h3>৳${f(pu)}</h3>${t('মোট ক্রয়')}</div><div class="pi"><h3>৳${f(ex)}</h3>${t('আজকের খরচ')}</div></div></div>${pbx()}</div>` + uwi(d);
};

P.dash_ = () => {
    let dd = $('#dd');
    if (dd) {
        dd.onchange = () => {
            let d = dd.value;
            $('#pg').innerHTML = `<div class="g2"><div class="cd"><h3>📊 সারসংক্ষেপ (${d})</h3><div class="r"><input type="date" id="dd" value="${d}"></div></div>${pbx()}</div>` + uwi(d);
            $('#dd').onchange = dd.onchange;
        };
    }
};

function pe_(ac, m) {
    fm(PA[ac] + (m > 1 ? ' যোগ' : ' খরচ/উত্তোলন'), [{k:'a', l:'পরিমাণ (৳)', t:'number'}, {k:'note', l:'বিবরণ'}], {}, o => {
        if (!o.a) return;
        S.pv.push({id: nid(), d: td(), tm: new Date().toLocaleTimeString(), ac, a: o.a * m, note: o.note || '', u: me.u});
        log(PA[ac] + ' ' + (m > 1 ? 'জমা' : 'উত্তোলন') + ' ৳' + o.a);
        sv();
        go('dash');
    });
}

function pst() {
    md(`<h3>🔒 ব্যক্তিগত বক্স স্টেটমেন্ট</h3>` + tbl(['তারিখ', 'অ্যাকাউন্ট', 'পরিমাণ', 'বিবরণ', 'অ্যাকশন'], S.pv.slice(-50).reverse().map(x => `<tr><td>${x.d}</td><td>${PA[x.ac] || x.ac}</td><td class="${x.a < 0 ? 'red' : 'ok'}">৳${f(x.a)}</td><td>${E(x.note)}</td><td><button class="d" onclick="dpv(${x.id})">🗑</button></td></tr>`)));
}

function dpv(id) {
    ask('এই এন্ট্রি ডিলিট করবেন?', () => {
        S.pv = S.pv.filter(x => x.id != id);
        log('ব্যক্তিগত বক্স এন্ট্রি ডিলিট');
        sv();
        mx();
        go('dash');
    });
}
