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

One HTML file, one CSS file, one small JS file. Fraunces + IBM Plex Mono via Google Fonts.
No trackers, no cookies, no analytics, no build step, no framework.
The hero motif is pure CSS (two interfering ring sets — no image, no JS).

`js/site.js` handles three things and nothing else: scroll reveal, hover-to-play on the reel, and the
gallery lightbox (arrow keys, Escape, focus returned to the tile you opened). Every animation is
disabled under `prefers-reduced-motion`.

## Media

| Folder | What | Exported by |
|---|---|---|
| `assets/art/` | 19 stills, WebP, full + thumbnail | `scripts/export-art.py` |
| `assets/video/` | 4 clips, H.264 960px + WebP poster | `scripts/export-video.py` |

Everything was generated locally on the DGX Spark — no cloud API, no rented GPU.

**Curation is explicit and by-id, and that is the whole safety gate.** Never glob the ComfyUI output
folder into this repo: it holds prompt tests, garbled-text memes, real-person meme templates, and
third-party characters that must not be published. Each id in the `PICKS` table of the export scripts
was opened and looked at before it was added. Adding a line without viewing the source defeats the
only check there is.

Re-export after adding a pick:

```bash
python3 scripts/export-art.py     # needs Pillow
python3 scripts/export-video.py   # needs Pillow + ffmpeg
```

## The lab

Interactive demos live on the sibling domain **[coinupbtc.xyz](https://coinupbtc.xyz/)**
(repo: [`Coinupbtc/coinupbtc-xyz`](https://github.com/Coinupbtc/coinupbtc-xyz)). Same brand tokens,
separate repo — GitHub Pages allows only one custom domain per repo.

## Custom domain

`CNAME` file → `coinupbtc.com`. At Porkbun, point apex A records to GitHub Pages IPs and `www` CNAME to `Coinupbtc.github.io`.

## License

MIT — see `LICENSE`.
