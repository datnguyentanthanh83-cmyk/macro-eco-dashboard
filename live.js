/* Load same-origin quotes.json (Investing.com server-side). Not investment advice. */
(function () {
  var INTERVAL_MS = 20000;
  var QUOTES_URL = './quotes.json';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function fmtNum(n, d) {
    if (n == null || isNaN(n)) return '—';
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function fmtPct(n) {
    if (n == null || isNaN(n)) return '—';
    return (n >= 0 ? '+' : '') + Number(n).toFixed(2) + '%';
  }
  function fmtBp(n) {
    if (n == null || isNaN(n)) return '—';
    var bp = Math.round(Number(n) * 100);
    return (bp >= 0 ? '+' : '') + bp + 'bp';
  }
  function clsPct(n) {
    if (n == null || isNaN(n) || Math.abs(n) < 0.0001) return 'flat';
    return n > 0 ? 'up' : 'down';
  }
  function deriveChg(item) {
    if (!item) return { pct: null, abs: null };
    var pct = item.chgPct, abs = item.chgAbs;
    if ((pct == null || isNaN(pct)) && item.price != null && item.prevClose) {
      pct = ((item.price - item.prevClose) / item.prevClose) * 100;
      abs = item.price - item.prevClose;
    }
    return { pct: pct, abs: abs };
  }
  function chgHtml(text, cls, closed) {
    var label = '<b class="' + (cls || 'flat') + '">' + text + '</b>';
    if (closed) label += ' <span style="color:#7a8699;font-weight:700">· đóng</span>';
    return label;
  }

  var SESSIONS = {
    vnindex: { tz: 'Asia/Ho_Chi_Minh', days: [1,2,3,4,5], windows: [[9*60, 11*60+30], [13*60, 15*60]] },
    spx: { tz: 'America/New_York', days: [1,2,3,4,5], windows: [[9*60+30, 16*60]] },
    ndx: { tz: 'America/New_York', days: [1,2,3,4,5], windows: [[9*60+30, 16*60]] },
    dji: { tz: 'America/New_York', days: [1,2,3,4,5], windows: [[9*60+30, 16*60]] },
    rut: { tz: 'America/New_York', days: [1,2,3,4,5], windows: [[9*60+30, 16*60]] }
  };

  function partsInTz(date, tz) {
    var fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
    var map = {};
    fmt.formatToParts(date).forEach(function (p) { if (p.type !== 'literal') map[p.type] = p.value; });
    var wd = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 }[map.weekday];
    var hour = parseInt(map.hour, 10); if (hour === 24) hour = 0;
    return { day: wd, mins: hour * 60 + parseInt(map.minute, 10) };
  }
  function isSessionOpen(key, date) {
    var s = SESSIONS[key];
    if (!s) return true;
    var p = partsInTz(date || new Date(), s.tz);
    if (s.days.indexOf(p.day) < 0) return false;
    for (var i = 0; i < s.windows.length; i++) {
      if (p.mins >= s.windows[i][0] && p.mins < s.windows[i][1]) return true;
    }
    return false;
  }

  function setStatus(text, ok) {
    var el = $('#live-status');
    if (!el) return;
    el.textContent = text;
    el.className = 'live-status' + (ok ? ' ok' : ' bad');
  }
  function setBoard(id, priceText, html, closed) {
    var el = $(id);
    if (!el) return;
    el.classList.toggle('is-closed', !!closed);
    el.classList.toggle('is-live', !closed);
    var v = el.querySelector('.live-value');
    var c = el.querySelector('.live-chg');
    if (v && priceText != null) v.textContent = priceText;
    if (c && html != null) c.innerHTML = html;
  }
  function setLevel(key, text, small) {
    $all('[data-live-level="' + key + '"]').forEach(function (el) {
      el.classList.add('is-live');
      var sm = el.querySelector('small');
      var keep = sm ? sm.outerHTML : (small ? '<small>' + small + '</small>' : '');
      el.innerHTML = text + keep;
    });
  }
  function setRow(key, nameText, dayText, dayClass, closed) {
    $all('[data-live-row="' + key + '"]').forEach(function (row) {
      row.classList.toggle('is-closed', !!closed);
      row.classList.toggle('is-live', !closed);
      var name = row.querySelector('.name');
      if (name && nameText) {
        var base = name.getAttribute('data-base');
        if (!base) { base = name.textContent.split('·')[0].trim(); name.setAttribute('data-base', base); }
        name.textContent = base + ' · ' + nameText;
      }
      if (dayText != null) {
        var cells = row.querySelectorAll('span');
        if (cells.length >= 2) {
          cells[1].className = 'change live-day ' + (dayClass || 'flat');
          cells[1].textContent = dayText;
        }
      }
    });
  }

  function applyQuotes(payload) {
    var q = (payload && payload.quotes) || {};
    var now = new Date();

    function apply(key, fmtPrice, dayFmt) {
      var item = q[key];
      if (!item || item.price == null) return null;
      var closed = SESSIONS[key] ? !isSessionOpen(key, now) : false;
      var priceText = fmtPrice(item.price);
      var d = deriveChg(item);
      // mutate so dayFmt (bp) can use refreshed abs
      if (item.chgPct == null && d.pct != null) item.chgPct = d.pct;
      if (item.chgAbs == null && d.abs != null) item.chgAbs = d.abs;
      var dayText = dayFmt ? dayFmt(item) : fmtPct(d.pct);
      var dayCls = clsPct(d.pct != null ? d.pct : d.abs);
      setRow(key, priceText, dayText, dayCls, closed);
      return { priceText: priceText, dayText: dayText, dayCls: dayCls, closed: closed, item: item, chgPct: d.pct };
    }

    var dxy = apply('dxy', function (p) { return fmtNum(p, 2); });
    if (dxy) {
      setBoard('#live-dxy', dxy.priceText, chgHtml(dxy.dayText, dxy.dayCls, dxy.closed), dxy.closed);
      setLevel('dxy', dxy.priceText);
    }

    var u10 = apply('ust10y', function (p) { return fmtNum(p, 3) + '%'; }, function (it) { return fmtBp(it.chgAbs); });
    if (u10) {
      setBoard('#live-ust10y', u10.priceText, chgHtml(u10.dayText, u10.dayCls, u10.closed), u10.closed);
      setLevel('ust10y', fmtNum(u10.item.price, 2) + '%', '10Y vs prior');
    }
    var u2 = apply('ust2y', function (p) { return fmtNum(p, 3) + '%'; }, function (it) { return fmtBp(it.chgAbs); });
    if (u2) {
      setBoard('#live-ust2y', u2.priceText, chgHtml(u2.dayText, u2.dayCls, u2.closed), u2.closed);
    }
    if (q.ust2s10s && q.ust2s10s.price != null) {
      var sp = q.ust2s10s.price;
      setRow('ust2s10s', (sp >= 0 ? '+' : '') + Math.round(sp * 100) + 'bp', '—', 'flat', false);
    }

    var vn = apply('vnindex', function (p) { return fmtNum(p, 2); });
    if (vn) {
      // VN: luôn hiện % vs prior close (kể cả ngoài phiên) — không để trống
      var vnChg = (vn.dayText && vn.dayText !== '—') ? vn.dayText : fmtPct(vn.chgPct);
      setBoard('#live-vn', vn.priceText, chgHtml(vnChg, vn.dayCls, vn.closed), vn.closed);
      var vnEl = $('#live-vn');
      if (vnEl) {
        var k = vnEl.querySelector('.k');
        if (k) k.textContent = vn.closed ? 'VN-Index · đóng cửa' : 'VN-Index';
      }
      setLevel('vnindex', vn.priceText);
    } else {
      // fallback rõ ràng nếu thiếu quotes
      setBoard('#live-vn', '—', '<span style="color:#7a8699;font-weight:700">chưa có % đổi</span>', true);
    }

    [['wti', 2, '$'], ['brent', 2, '$'], ['gold', 0, '$']].forEach(function (x) {
      var r = apply(x[0], function (p) { return x[2] + fmtNum(p, x[1]); });
      if (r && x[0] === 'wti') setLevel('wti', r.priceText, 'WTI vs prior');
    });
    [['spx', 0], ['ndx', 0], ['dji', 0], ['rut', 0]].forEach(function (x) {
      var r = apply(x[0], function (p) { return fmtNum(p, x[1]); });
      if (r && x[0] === 'spx') setLevel('spx', r.priceText, 'S&P vs prior');
    });
    apply('gbpusd', function (p) { return fmtNum(p, 4); });
    apply('audusd', function (p) { return fmtNum(p, 4); });

    var e = apply('eurusd', function (p) { return fmtNum(p, 4); });
    if (e) {
      setBoard('#live-eurusd', e.priceText, chgHtml(e.dayText, e.dayCls, false), false);
      setLevel('eurusd', e.priceText, 'EUR/USD');
    }
    var j = apply('usdjpy', function (p) { return fmtNum(p, 2); });
    if (j) setBoard('#live-usdjpy', j.priceText, chgHtml(j.dayText, j.dayCls, false), false);

    var v = apply('usdvnd', function (p) { return fmtNum(p, 0); });
    if (v) {
      var vHtml = (v.item.chgPct == null)
        ? '<span style="color:#7a8699;font-weight:700">vs prior: —</span>'
        : chgHtml(v.dayText, v.dayCls, false);
      setBoard('#live-usdvnd', v.priceText, vHtml, false);
    }

    var head = $('#live-board .live-head h2');
    if (head) head.textContent = 'Near real-time · Investing.com · vs prior close';
  }

  var refreshing = false;
  async function refresh() {
    if (refreshing) return;
    refreshing = true;
    var t0 = Date.now();
    try {
      setStatus('Đang tải quotes…', true);
      var r = await fetch(QUOTES_URL + '?t=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var payload = await r.json();
      applyQuotes(payload);
      var ms = Date.now() - t0;
      setStatus('Investing · vs prior close · ' + (payload.asOf || '') + ' · ' + ms + 'ms', true);
    } catch (e) {
      setStatus('Chưa có quotes.json — giữ snapshot. (' + (e && e.message) + ')', false);
      console.warn(e);
    } finally {
      refreshing = false;
    }
  }

  function boot() {
    if (!$('#live-board')) return;
    refresh();
    setInterval(refresh, INTERVAL_MS);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 0);
})();
