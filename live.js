/* Near-real-time quotes (public sources, typically delayed). Not investment advice. */
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
    var s = (n >= 0 ? '+' : '') + Number(n).toFixed(2) + '%';
    return s;
  }
  function clsPct(n) {
    if (n == null || isNaN(n) || Math.abs(n) < 0.0001) return 'flat';
    return n > 0 ? 'up' : 'down';
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
      // Browser CORS fallback
      var proxies = [
        'https://api.allorigins.win/raw?url=' + encodeURIComponent(url),
        'https://corsproxy.io/?' + encodeURIComponent(url)
      ];
      var lastErr = e1;
      for (var i = 0; i < proxies.length; i++) {
        try {
          return await fetchJson(proxies[i]);
        } catch (e2) { lastErr = e2; }
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
    return { price: price, prev: prev, chgPct: chgPct, symbol: m.symbol };
  }

  function setLive(key, priceText, subHtml) {
    $all('[data-live="' + key + '"]').forEach(function (el) {
      var v = el.querySelector('.value, .live-value');
      var s = el.querySelector('.sub, .live-sub');
      if (v) v.textContent = priceText;
      if (s && subHtml != null) s.innerHTML = subHtml;
      el.classList.add('is-live');
    });
  }

  function setStatus(text, ok) {
    var el = $('#live-status');
    if (!el) return;
    el.textContent = text;
    el.className = 'live-status' + (ok ? ' ok' : ' bad');
  }

  async function refresh() {
    setStatus('Đang cập nhật…', true);
    var errors = [];
    try {
      var pack = await Promise.allSettled([
        yahoo('DX-Y.NYB'),
        yahoo('^TNX'),
        yahoo('2YY=F'),
        yahoo('^VNINDEX.VN'),
        fetchJson('https://open.er-api.com/v6/latest/USD')
      ]);

      var dxy = pack[0].status === 'fulfilled' ? parseYahoo(pack[0].value) : null;
      var tnx = pack[1].status === 'fulfilled' ? parseYahoo(pack[1].value) : null;
      var y2 = pack[2].status === 'fulfilled' ? parseYahoo(pack[2].value) : null;
      var vn = pack[3].status === 'fulfilled' ? parseYahoo(pack[3].value) : null;
      var fx = pack[4].status === 'fulfilled' ? pack[4].value : null;

      if (dxy && dxy.price != null) {
        setLive('dxy', fmtNum(dxy.price, 2),
          'Live · ngày: <b class="' + clsPct(dxy.chgPct) + '">' + fmtPct(dxy.chgPct) + '</b> · delayed');
        var el = $('#live-dxy'); if (el) { el.querySelector('.live-value').textContent = fmtNum(dxy.price, 2);
          el.querySelector('.live-chg').innerHTML = '<b class="' + clsPct(dxy.chgPct) + '">' + fmtPct(dxy.chgPct) + '</b>'; }
      } else errors.push('DXY');

      if (tnx && tnx.price != null) {
        setLive('ust10y', '~' + fmtNum(tnx.price, 2) + '%',
          'Live · ngày: <b class="' + clsPct(tnx.chgPct) + '">' + fmtPct(tnx.chgPct) + '</b> · delayed');
        var el10 = $('#live-ust10y'); if (el10) { el10.querySelector('.live-value').textContent = fmtNum(tnx.price, 3) + '%';
          el10.querySelector('.live-chg').innerHTML = '<b class="' + clsPct(tnx.chgPct) + '">' + fmtPct(tnx.chgPct) + '</b>'; }
      } else errors.push('UST10Y');

      if (y2 && y2.price != null) {
        var el2 = $('#live-ust2y'); if (el2) { el2.querySelector('.live-value').textContent = fmtNum(y2.price, 3) + '%';
          el2.querySelector('.live-chg').innerHTML = '<b class="' + clsPct(y2.chgPct) + '">' + fmtPct(y2.chgPct) + '</b>'; }
      } else errors.push('UST2Y');

      if (vn && vn.price != null) {
        setLive('vnindex', fmtNum(vn.price, 2),
          'Live · ngày: <b class="' + clsPct(vn.chgPct) + '">' + fmtPct(vn.chgPct) + '</b> · delayed');
        var elv = $('#live-vn'); if (elv) { elv.querySelector('.live-value').textContent = fmtNum(vn.price, 2);
          elv.querySelector('.live-chg').innerHTML = '<b class="' + clsPct(vn.chgPct) + '">' + fmtPct(vn.chgPct) + '</b>'; }
      } else errors.push('VNINDEX');

      if (fx && fx.rates) {
        var vnd = fx.rates.VND, eur = fx.rates.EUR, jpy = fx.rates.JPY;
        var eurusd = eur ? (1 / eur) : null;
        var usdjpy = jpy || null;
        var elV = $('#live-usdvnd'); if (elV && vnd) elV.querySelector('.live-value').textContent = fmtNum(vnd, 0);
        var elE = $('#live-eurusd'); if (elE && eurusd) elE.querySelector('.live-value').textContent = fmtNum(eurusd, 4);
        var elJ = $('#live-usdjpy'); if (elJ && usdjpy) elJ.querySelector('.live-value').textContent = fmtNum(usdjpy, 2);
        // also patch FX card rows if present
        $all('[data-live-fx]').forEach(function (row) {
          var k = row.getAttribute('data-live-fx');
          var val = null;
          if (k === 'usdvnd') val = vnd != null ? fmtNum(vnd, 0) : null;
          if (k === 'eurusd') val = eurusd != null ? fmtNum(eurusd, 4) : null;
          if (k === 'usdjpy') val = usdjpy != null ? fmtNum(usdjpy, 2) : null;
          if (val) {
            var name = row.querySelector('.name');
            if (name) {
              var base = name.getAttribute('data-base') || name.textContent.split('·')[0].trim();
              name.setAttribute('data-base', base);
              name.textContent = base + ' · ' + val;
            }
          }
        });
      } else errors.push('FX');

      var now = new Date();
      var ict = now.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (errors.length) setStatus('Live một phần · ' + ict + ' ICT · lỗi: ' + errors.join(', ') + ' · delayed', false);
      else setStatus('Live · cập nhật ' + ict + ' ICT · poll 45s · nguồn công khai (delayed)', true);
    } catch (e) {
      setStatus('Live tạm lỗi — giữ snapshot sáng. Thử lại sau.', false);
      console.warn('live refresh failed', e);
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
