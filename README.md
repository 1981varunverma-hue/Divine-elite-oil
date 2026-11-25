# Divine Elite Oil – Billing

Billing, customers, sales reports, purchases and WhatsApp for Divine Elite Oil, Gurugram.

- **Website / iPhone / PC:** https://1981varunverma-hue.github.io/Divine-elite-oil/ (on iPhone: Share → Add to Home Screen)
- **Android app:** https://github.com/1981varunverma-hue/Divine-elite-oil/releases/latest/download/DivineBilling.apk

## How it is built
- `web/` – the whole app (one page, works offline). Deployed to GitHub Pages on every push to `main`.
- `web/config.js` – Firebase web config (not secret).
- `firestore.rules` – who can read/write what. Paste into Firebase console → Firestore → Rules.
- `android-shell/` – Capacitor shell that opens the website as an Android app and adds native PDF sharing. Built by `.github/workflows/android.yml`.

## Roles
- **admin** – everything
- **staff** – make and send bills, customers, WhatsApp messages
- **partner** – read-only: bills, sales report, customers, purchases

Everyone logs in with their mobile number and a 6-digit PIN.
