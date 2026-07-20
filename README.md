# Coinupbtc — Portfolio Site

A fast, single-page personal portfolio. No build step, no frameworks, no
trackers, no cookies, no third-party requests. Open `index.html` in a browser
or serve the folder with any static host.

- **Design**: dark cinematic default, electric cobalt accent, light theme toggle.
- **Stack**: one HTML file, one CSS file, one JS file. System fonts only.
- **Privacy**: theme choice only in the visitor's `localStorage`. **No email,
  school, city, employer, or phone** is published. Contact is GitHub only.

Identity on this site is the handle **Coinupbtc** only. Live at
**https://coinupbtc.github.io/**.

## Contact policy

Do not add a personal email, real name, employer, school, or city to this
repo. Prefer GitHub issues / profile for inbound contact.

## Publishing

Any static host works — GitHub Pages is configured on `main`. After editing:

1. Confirm a privacy grep is clean:
   `rg -i '(personal email|phone number|street address|employer name|school name)' . --glob '!.git/**'`
2. Push to `main`; Pages rebuilds from the root.

## License

MIT — see `LICENSE`. Your content is yours.
