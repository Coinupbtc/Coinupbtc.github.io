# Porkbun DNS for coinupbtc.com → GitHub Pages

In Porkbun → Domains → coinupbtc.com → DNS:

## Delete (or replace) parking
Remove existing **A** records pointing at `207.207.210.*` (Porkbun park).

## Apex (coinupbtc.com) — four A records
| Type | Host | Answer | TTL |
|------|------|--------|-----|
| A | (blank / @) | 185.199.108.153 | 600 |
| A | (blank / @) | 185.199.109.153 | 600 |
| A | (blank / @) | 185.199.110.153 | 600 |
| A | (blank / @) | 185.199.111.153 | 600 |

Optional IPv6 (AAAA), same hosts:
`2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`

## www
| Type | Host | Answer | TTL |
|------|------|--------|-----|
| CNAME | www | Coinupbtc.github.io | 600 |

## Leave mail alone for now
Keep existing MX / TXT (Porkbun forward) unless you change email later.

## After DNS propagates
1. Visit https://coinupbtc.com/ — should show the editorial portfolio.
2. In GitHub → repo Settings → Pages → check domain shows verified / HTTPS enforceable.
3. Turn on **Enforce HTTPS** when GitHub offers it.

## coinupbtc.xyz (optional)
Same four A records + `www` CNAME, **or** URL forward `.xyz` → `https://coinupbtc.com` in Porkbun.

Repo already has `CNAME` = `coinupbtc.com`.
