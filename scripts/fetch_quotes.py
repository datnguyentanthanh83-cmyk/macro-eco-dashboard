#!/usr/bin/env python3
"""Fetch delayed quotes from Investing.com (server-side) + FX mid. Writes quotes.json."""
from __future__ import annotations
import json, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

OUT = Path(__file__).resolve().parents[1] / "quotes.json"
UA = {"User-Agent": "Mozilla/5.0 MacroEcoBot", "Accept": "application/json"}

# Investing.com pair IDs (unofficial chart API)
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

def investing_last(pair_id: int):
    url = (
        f"https://api.investing.com/api/financialdata/{pair_id}/historical/chart/"
        f"?period=P1D&interval=PT5M&pointscount=60"
    )
    data = get_json(url)
    rows = data.get("data") or []
    if not rows:
        raise ValueError("empty")
    first, last = rows[0], rows[-1]
    # row: [ts_ms, open, high, low, close, ...]
    o, c = float(first[1]), float(last[4])
    chg_pct = ((c - o) / o * 100.0) if o else None
    chg_abs = c - o
    return {
        "price": c,
        "open": o,
        "chgPct": chg_pct,
        "chgAbs": chg_abs,
        "ts": int(last[0]),
        "source": "investing",
        "pairId": pair_id,
    }

def fx_mids():
    data = get_json("https://open.er-api.com/v6/latest/USD")
    rates = data.get("rates") or {}
    out = {}
    if "VND" in rates:
        out["usdvnd"] = {"price": float(rates["VND"]), "chgPct": None, "source": "er-api"}
    if "EUR" in rates and rates["EUR"]:
        out["eurusd"] = {"price": 1.0 / float(rates["EUR"]), "chgPct": None, "source": "er-api"}
    if "JPY" in rates:
        out["usdjpy"] = {"price": float(rates["JPY"]), "chgPct": None, "source": "er-api"}
    return out

def main():
    quotes = {}
    errors = []
    for key, pid in PAIRS.items():
        try:
            quotes[key] = investing_last(pid)
            time.sleep(0.05)
        except Exception as e:
            errors.append(f"{key}:{e}")
    # Prefer Investing FX when present; fill gaps from er-api
    try:
        for k, v in fx_mids().items():
            if k not in quotes:
                quotes[k] = v
            elif k == "usdvnd":
                quotes[k] = v  # Investing has no VND pair here
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
        "provider": "Investing.com chart API (delayed) + er-api FX",
        "quotes": quotes,
        "errors": errors,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
    print(f"wrote {OUT} keys={len(quotes)} errors={len(errors)}")
    if errors:
        print("errors:", "; ".join(errors[:8]))

if __name__ == "__main__":
    main()
