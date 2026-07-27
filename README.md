# Coinupbtc — Portfolio Site

| | |
|---|---|
| **What it is** | A single-page pseudonymous landing site for Coinupbtc. |
| **What it’s for** | The one link to hand out: GitHub, X, art made on my own hardware, public builds — no real name. |
| **How to use it** | Open https://coinupbtc.com/ — or `./setup.sh` for a local preview. |

Identity on this site is the handle **Coinupbtc** only. Live at **https://coinupbtc.com/** (GitHub Pages).

## Try it

```bash
git clone https://github.com/Coinupbtc/Coinupbtc.github.io.git
cd Coinupbtc.github.io
./setup.sh
# → http://127.0.0.1:8765/
```

Or open `index.html` in a browser (no build step).

## Contact policy

Pseudonymous: no real name, employer, school, phone, or street address.
Inbound: [GitHub](https://github.com/Coinupbtc) · [X @coinupbtc](https://x.com/coinupbtc) · [coinupbtc@gmail.com](mailto:coinupbtc@gmail.com).

## Stack

One HTML + one CSS file. Fraunces + IBM Plex Mono via Google Fonts. No trackers, no cookies, no analytics.
The hero motif is pure CSS (two interfering ring sets — no image, no JS).

## Art

`assets/art/` holds WebP exports of stills generated locally on the DGX Spark (ComfyUI).
Curation is **explicit and by-id** in the export script — never glob the ComfyUI output folder into
this repo. It contains prompt tests, memes, and third-party characters that must not be published.

## Custom domain

`CNAME` file → `coinupbtc.com`. At Porkbun, point apex A records to GitHub Pages IPs and `www` CNAME to `Coinupbtc.github.io`.

## License

MIT — see `LICENSE`.
