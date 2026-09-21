/* Near-real-time quotes (public, delayed). Skip fetch when session is closed. Not investment advice. */
(function () {
  var INTERVAL_MS = 45000;
  var yahooBase = 'https://query1.finance.yahoo.com/v8/finance/chart/';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function fmtNum(n, d) {
    if (n == null || isNaN(n)) return '—';
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function fmtPct(n) {
    if (n == null || isNaN(n)) return '';
    return (n >= 0 ? '+' : '') + Number(n).toFixed(2) + '%';
  }
  function fmtBp(n) {
    if (n == null || isNaN(n)) return '';
    var bp = Math.round(n * 100);
    return (bp >= 0 ? '+' : '') + bp + 'bp';
  }
  function clsPct(n) {
    if (n == null || isNaN(n) || Math.abs(n) < 0.0001) return 'flat';
    return n > 0 ? 'up' : 'down';
  }

  /* Session calendars — approx public hours. Closed = no network fetch (keep snapshot). */
  var SESSIONS = {
    vnindex: { tz: 'Asia/Ho_Chi_Minh', days: [1,2,3,4,5], windows: [[9*60, 11*60+30], [13*60, 15*60]] },
    spx:     { tz: 'America/New_York', days: [1,2,3,4,5], windows: [[9*60+30, 16*60]] },
    ndx:     { tz: 'America/New_York', days: [1,2,3,4,5], windows: [[9*60+30, 16*60]] },
    dji:     { tz: 'America/New_York', days: [1,2,3,4,5], windows: [[9*60+30, 16*60]] },
    rut:     { tz: 'America/New_York', days: [1,2,3,4,5], windows: [[9*60+30, 16*60]] },
    /* futures / FX-ish: weekday almost round-the-clock in NY; skip Sat–Sun */
    dxy:     { tz: 'America/New_York', days: [1,2,3,4,5], windows: [[0, 24*60]] },
    ust10y:  { tz: 'America/New_York', days: [1,2,3,4,5], windows: [[0, 24*60]] },
    ust2y:   { tz: 'America/New_York', days: [1,2,3,4,5], windows: [[0, 24*60]] },
    wti:     { tz: 'America/New_York', days: [1,2,3,4,5], windows: [[0, 24*60]] },
    brent:   { tz: 'America/New_York', days: [1,2,3,4,5], windows: [[0, 24*60]] },
    gold:    { tz: 'America/New_York', days: [1,2,3,4,5], windows: [[0, 24*60]] },
    gbpusd:  { tz: 'America/New_York', days: [1,2,3,4,5], windows: [[0, 24*60]] },
    audusd:  { tz: 'America/New_York', days: [1,2,3,4,5], windows: [[0, 24*60]] },
    fx:      { tz: 'America/New_York', days: [1,2,3,4,5], windows: [[0, 24*60]] }
  };

  function partsInTz(date, tz) {
    var fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    });
    var map = {};
    fmt.formatToParts(date).forEach(function (p) { if (p.type !== 'literal') map[p.type] = p.value; });
    var wd = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 }[map.weekday];
    var hour = parseInt(map.hour, 10);
    if (hour === 24) hour = 0; // some engines
    var minute = parseInt(map.minute, 10);
    return { day: wd, mins: hour * 60 + minute };
  }

  function isSessionOpen(key, date) {
    var s = SESSIONS[key];
    if (!s) return true;
    var p = partsInTz(date || new Date(), s.tz);
    if (s.days.indexOf(p.day) < 0) return false;
    for (var i = 0; i < s.windows.length; i++) {
      var a = s.windows[i][0], b = s.windows[i][1];
      if (p.mins >= a && p.mins < b) return true;
    }
    return false;
  }

  function markClosed(key) {
    $all('[data-live-row="' + key + '"]').forEach(function (row) {
      row.classList.add('is-closed');
      row.classList.remove('is-live');
    });
    $all('[data-live-level="' + key + '"]').forEach(function (el) {
      el.classList.add('is-closed');
      el.classList.remove('is-live');
    });
    var boardMap = { dxy: '#live-dxy', ust10y: '#live-ust10y', ust2y: '#live-ust2y', vnindex: '#live-vn',
      eurusd: '#live-eurusd', usdjpy: '#live-usdjpy', usdvnd: '#live-usdvnd' };
    var id = boardMap[key];
    if (id) {
      var el = $(id);
      if (el) {
        el.classList.add('is-closed');
        var c = el.querySelector('.live-chg');
        if (c && !c.getAttribute('data-closed-label')) {
          c.setAttribute('data-closed-label', '1');
          c.textContent = 'đóng cửa · snapshot';
        }
      }
    }
  }

  async function fetchJson(url) {
    var r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }

  async function yahoo(symbol) {
    var url = yahooBase + encodeURIComponent(symbol) + '?interval=1m&range=1d';
    try {
      return await fetchJson(url);
    } catch (e1) {
      var proxies = [
        'https://api.allorigins.win/raw?url=' + encodeURIComponent(url),
        'https://corsproxy.io/?' + encodeURIComponent(url)
      ];
      var lastErr = e1;
      for (var i = 0; i < proxies.length; i++) {
        try { return await fetchJson(proxies[i]); }
        catch (e2) { lastErr = e2; }
      }
      throw lastErr;
    }
  }

  function parseYahoo(data) {
    var res = data && data.chart && data.chart.result && data.chart.result[0];
    if (!res || !res.meta) return null;
    var m = res.meta;
    var price = m.regularMarketPrice;
    var prev = m.chartPreviousClose != null ? m.chartPreviousClose : m.previousClose;
    var chgPct = m.regularMarketChangePercent;
    if ((chgPct == null || isNaN(chgPct)) && price != null && prev) {
      chgPct = ((price - prev) / prev) * 100;
    }
    var chgAbs = (price != null && prev != null) ? (price - prev) : null;
    return { price: price, prev: prev, chgPct: chgPct, chgAbs: chgAbs, symbol: m.symbol };
  }

  function setBoard(id, priceText, chgHtml) {
    var el = $(id);
    if (!el) return;
    el.classList.remove('is-closed');
    var v = el.querySelector('.live-value');
    var c = el.querySelector('.live-chg');
    if (v) v.textContent = priceText;
    if (c) {
      c.removeAttribute('data-closed-label');
      if (chgHtml != null) c.innerHTML = chgHtml;
    }
  }

  function setLevel(key, text, small) {
    $all('[data-live-level="' + key + '"]').forEach(function (el) {
      el.classList.add('is-live');
      el.classList.remove('is-closed');
      var sm = el.querySelector('small');
      var keep = sm ? sm.outerHTML : (small ? '<small>' + small + '</small>' : '');
      el.innerHTML = text + keep;
    });
  }

  function setRow(key, nameText, dayText, dayClass) {
    $all('[data-live-row="' + key + '"]').forEach(function (row) {
      row.classList.add('is-live');
      row.classList.remove('is-closed');
      var name = row.querySelector('.name');
      if (name && nameText) {
        var base = name.getAttribute('data-base');
        if (!base) {
          base = name.textContent.split('·')[0].trim();
          name.setAttribute('data-base', base);
        }
        name.textContent = base + ' · ' + nameText;
      }
      if (dayText != null) {
        var cells = row.querySelectorAll('span');
        if (cells.length >= 2) {
          var day = cells[1];
          day.className = 'change live-day ' + (dayClass || 'flat');
          day.textContent = dayText;
        }
      }
    });
  }

  function setStatus(text, ok) {
    var el = $('#live-status');
    if (!el) return;
    el.textContent = text;
    el.className = 'live-status' + (ok ? ' ok' : ' bad');
  }

  var SYMBOLS = {
    dxy: 'DX-Y.NYB',
    ust10y: '^TNX',
    ust2y: '2YY=F',
    vnindex: '^VNINDEX.VN',
    wti: 'CL=F',
    brent: 'BZ=F',
    gold: 'GC=F',
    spx: '^GSPC',
    ndx: '^IXIC',
    dji: '^DJI',
    rut: '^RUT',
    gbpusd: 'GBPUSD=X',
    audusd: 'AUDUSD=X'
  };

  async function refresh() {
    var now = new Date();
    var openKeys = [];
    var closedKeys = [];
    Object.keys(SYMBOLS).forEach(function (k) {
      if (isSessionOpen(k, now)) openKeys.push(k);
      else closedKeys.push(k);
    });
    closedKeys.forEach(markClosed);

    var fxOpen = isSessionOpen('fx', now);
    if (!openKeys.length && !fxOpen) {
      setStatus('Ngoài phiên · giữ snapshot (không poll) · ICT ' +
        now.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' }), true);
      return;
    }

    setStatus('Đang cập nhật phiên đang mở…', true);
    var errors = [];
    var jobs = openKeys.map(function (k) { return yahoo(SYMBOLS[k]); });
    var fxIdx = -1;
    if (fxOpen) {
      fxIdx = jobs.length;
      jobs.push(fetchJson('https://open.er-api.com/v6/latest/USD'));
    }

    var pack = await Promise.allSettled(jobs);
    var quotes = {};
    openKeys.forEach(function (k, i) {
      if (pack[i].status === 'fulfilled') {
        var q = parseYahoo(pack[i].value);
        if (q && q.price != null) quotes[k] = q;
        else errors.push(k.toUpperCase());
      } else errors.push(k.toUpperCase());
    });

    if (quotes.dxy) {
      setBoard('#live-dxy', fmtNum(quotes.dxy.price, 2),
        '<b class="' + clsPct(quotes.dxy.chgPct) + '">' + fmtPct(quotes.dxy.chgPct) + '</b>');
      setRow('dxy', fmtNum(quotes.dxy.price, 2), fmtPct(quotes.dxy.chgPct), clsPct(quotes.dxy.chgPct));
      setLevel('dxy', fmtNum(quotes.dxy.price, 2));
    }
    if (quotes.ust10y) {
      setBoard('#live-ust10y', fmtNum(quotes.ust10y.price, 3) + '%',
        '<b class="' + clsPct(quotes.ust10y.chgAbs) + '">' + fmtBp(quotes.ust10y.chgAbs) + '</b>');
      setRow('ust10y', fmtNum(quotes.ust10y.price, 3) + '%', fmtBp(quotes.ust10y.chgAbs), clsPct(quotes.ust10y.chgAbs));
      setLevel('ust10y', fmtNum(quotes.ust10y.price, 2) + '%', '10Y live');
    }
    if (quotes.ust2y) {
      setBoard('#live-ust2y', fmtNum(quotes.ust2y.price, 3) + '%',
        '<b class="' + clsPct(quotes.ust2y.chgAbs) + '">' + fmtBp(quotes.ust2y.chgAbs) + '</b>');
      setRow('ust2y', fmtNum(quotes.ust2y.price, 3) + '%', fmtBp(quotes.ust2y.chgAbs), clsPct(quotes.ust2y.chgAbs));
    }
    if (quotes.ust2y && quotes.ust10y) {
      var spread = quotes.ust10y.price - quotes.ust2y.price;
      setRow('ust2s10s', (spread >= 0 ? '+' : '') + Math.round(spread * 100) + 'bp', '—', 'flat');
    } else if (closedKeys.indexOf('ust2y') >= 0 || closedKeys.indexOf('ust10y') >= 0) {
      markClosed('ust2s10s');
    }
    if (quotes.vnindex) {
      setBoard('#live-vn', fmtNum(quotes.vnindex.price, 2),
        '<b class="' + clsPct(quotes.vnindex.chgPct) + '">' + fmtPct(quotes.vnindex.chgPct) + '</b>');
      setRow('vnindex', fmtNum(quotes.vnindex.price, 2), fmtPct(quotes.vnindex.chgPct), clsPct(quotes.vnindex.chgPct));
      setLevel('vnindex', fmtNum(quotes.vnindex.price, 2));
    }
    [['wti', 2, '$'], ['brent', 2, '$'], ['gold', 0, '$']].forEach(function (x) {
      var k = x[0], d = x[1], pre = x[2];
      if (!quotes[k]) return;
      var q = quotes[k];
      setRow(k, pre + fmtNum(q.price, d), fmtPct(q.chgPct), clsPct(q.chgPct));
      if (k === 'wti') setLevel('wti', pre + fmtNum(q.price, d), 'WTI live');
    });
    [['spx', 0], ['ndx', 0], ['dji', 0], ['rut', 0]].forEach(function (x) {
      var k = x[0], d = x[1];
      if (!quotes[k]) return;
      var q = quotes[k];
      setRow(k, fmtNum(q.price, d), fmtPct(q.chgPct), clsPct(q.chgPct));
      if (k === 'spx') setLevel('spx', fmtNum(q.price, 0), 'S&P 500');
    });
    [['gbpusd', 4], ['audusd', 4]].forEach(function (x) {
      var k = x[0], d = x[1];
      if (!quotes[k]) return;
      var q = quotes[k];
      setRow(k, fmtNum(q.price, d), fmtPct(q.chgPct), clsPct(q.chgPct));
    });

    if (fxOpen && fxIdx >= 0) {
      var fxPack = pack[fxIdx];
      if (fxPack.status === 'fulfilled' && fxPack.value && fxPack.value.rates) {
        var rates = fxPack.value.rates;
        var vnd = rates.VND, eur = rates.EUR, jpy = rates.JPY;
        var eurusd = eur ? (1 / eur) : null;
        var usdjpy = jpy || null;
        setBoard('#live-usdvnd', vnd != null ? fmtNum(vnd, 0) : '—', 'FX mid');
        setBoard('#live-eurusd', eurusd != null ? fmtNum(eurusd, 4) : '—', 'FX mid');
        setBoard('#live-usdjpy', usdjpy != null ? fmtNum(usdjpy, 2) : '—', 'FX mid');
        if (eurusd != null) {
          setRow('eurusd', fmtNum(eurusd, 4), null, null);
          setLevel('eurusd', fmtNum(eurusd, 4), 'EUR/USD mid');
        }
        if (usdjpy != null) setRow('usdjpy', fmtNum(usdjpy, 2), null, null);
        if (vnd != null) setRow('usdvnd', fmtNum(vnd, 0), null, null);
      } else errors.push('FX');
    } else {
      markClosed('eurusd'); markClosed('usdjpy'); markClosed('usdvnd');
    }

    var ict = now.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    var closedNote = closedKeys.length ? (' · đóng: ' + closedKeys.slice(0, 4).join(',') + (closedKeys.length > 4 ? '…' : '')) : '';
    if (errors.length) setStatus('Live một phần · ' + ict + ' ICT · thiếu: ' + errors.slice(0, 5).join(',') + closedNote + ' · delayed', false);
    else setStatus('Live phiên mở · ' + ict + ' ICT · poll 45s' + closedNote + ' · delayed', true);
  }

  function boot() {
    if (!$('#live-board')) return;
    refresh();
    setInterval(refresh, INTERVAL_MS);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 0);
})();
