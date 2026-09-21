#!/usr/bin/env python3
"""Fetch delayed quotes from Investing.com + FX. Day change vs previous close."""
from __future__ import annotations
import json, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

OUT = Path(__file__).resolve().parents[1] / "quotes.json"
STATE = Path(__file__).resolve().parents[1] / "quotes-state.json"
UA = {"User-Agent": "Mozilla/5.0 MacroEcoBot", "Accept": "application/json"}

PAIRS = {
    "dxy": 8827,
    "ust10y": 23701,
    "ust2y": 23705,
    "vnindex": 41063,
    "wti": 8849,
    "brent": 8833,
    "gold": 8830,
    "spx": 166,
    "ndx": 14958,
    "dji": 169,
    "rut": 170,
    "gbpusd": 2,
    "audusd": 5,
    "eurusd": 1,
    "usdjpy": 3,
}

def get_json(url: str, timeout: float = 12.0):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())

def investing_quote(pair_id: int):
    # Last price from intraday
    intra = get_json(
        f"https://api.investing.com/api/financialdata/{pair_id}/historical/chart/"
        f"?period=P1D&interval=PT5M&pointscount=60"
    )
    rows = intra.get("data") or []
    if not rows:
        raise ValueError("empty intraday")
    price = float(rows[-1][4])
    ts = int(rows[-1][0])

    # Previous close from daily bars
    daily = get_json(
        f"https://api.investing.com/api/financialdata/{pair_id}/historical/chart/"
        f"?period=P1W&interval=P1D&pointscount=60"
    )
    drows = daily.get("data") or []
    prev = None
    if len(drows) >= 2:
        # If last daily bar is "today" (same calendar day as last intraday), prev = drows[-2]
        # else last daily is previous session close
        last_d_ts = int(drows[-1][0]) // 1000
        last_i_ts = ts // 1000
        # compare UTC dates
        d_last = datetime.fromtimestamp(last_d_ts, timezone.utc).date()
        d_intra = datetime.fromtimestamp(last_i_ts, timezone.utc).date()
        if d_last == d_intra and len(drows) >= 2:
            prev = float(drows[-2][4])
        else:
            prev = float(drows[-1][4])
    elif len(drows) == 1:
        prev = float(drows[0][1])  # open as fallback

    chg_abs = (price - prev) if prev is not None else None
    chg_pct = ((price - prev) / prev * 100.0) if prev else None
    return {
        "price": price,
        "prevClose": prev,
        "chgPct": chg_pct,
        "chgAbs": chg_abs,
        "ts": ts,
        "source": "investing",
        "pairId": pair_id,
    }

def fx_with_state(state: dict):
    data = get_json("https://open.er-api.com/v6/latest/USD")
    rates = data.get("rates") or {}
    out = {}
    vnd = float(rates["VND"]) if "VND" in rates else None
    if vnd is not None:
        prev = state.get("usdvnd")
        chg = ((vnd - prev) / prev * 100.0) if prev else None
        out["usdvnd"] = {
            "price": vnd,
            "prevClose": prev,
            "chgPct": chg,
            "chgAbs": (vnd - prev) if prev is not None else None,
            "source": "er-api",
        }
        state["usdvnd"] = vnd
    return out

def main():
    state = {}
    if STATE.exists():
        try:
            state = json.loads(STATE.read_text())
        except Exception:
            state = {}

    quotes = {}
    errors = []
    for key, pid in PAIRS.items():
        try:
            quotes[key] = investing_quote(pid)
            time.sleep(0.08)
        except Exception as e:
            errors.append(f"{key}:{e}")

    try:
        for k, v in fx_with_state(state).items():
            quotes[k] = v
    except Exception as e:
        errors.append(f"fx:{e}")

    if "ust2y" in quotes and "ust10y" in quotes:
        spread = quotes["ust10y"]["price"] - quotes["ust2y"]["price"]
        quotes["ust2s10s"] = {
            "price": spread,
            "chgPct": None,
            "chgAbs": None,
            "source": "derived",
        }

    ict = datetime.now(ZoneInfo("Asia/Ho_Chi_Minh"))
    payload = {
        "asOf": ict.strftime("%Y-%m-%d %H:%M:%S ICT"),
        "asOfUnix": int(time.time()),
        "provider": "Investing.com (vs prior close) + er-api FX",
        "quotes": quotes,
        "errors": errors,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
    STATE.write_text(json.dumps(state, indent=2) + "\n")
    print(f"wrote {OUT} keys={len(quotes)} errors={len(errors)}")
    for k in ("dxy", "ust10y", "eurusd", "usdjpy", "usdvnd", "vnindex", "wti"):
        q = quotes.get(k)
        if q:
            print(f"  {k}: {q.get('price')} chgPct={q.get('chgPct')} chgAbs={q.get('chgAbs')}")

if __name__ == "__main__":
    main()
