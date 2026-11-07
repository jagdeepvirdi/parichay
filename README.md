# Parichay — Contact Exchange

*Share only what you choose, phone to phone, with no server in between.*

A local-first contact exchange app. There is no account, no server and no sync: everyone's card, the people they've collected, and the groups they've sorted them into live only in that device's browser storage (IndexedDB), and the app works fully offline — including the exchange itself, which happens entirely through a QR code rendered and scanned on-device.

- **Build your card once**, split into Professional and Personal sections.
- **Share selectively**: Professional / Personal / Everything / Digital-only presets, each producing a vCard QR code with only those fields — generated client-side, nothing sent anywhere.
- **Scan someone's card** with the camera, assign it to a group on the spot (e.g. "AI CEO Course"), and optionally jot a note.
- **Browse your network**, grouped, searchable.
- **Push to phone contacts**: exports a standard `.vcf` file — there's no API for an app to write silently into a phone's native address book, so the OS's own "Add to Contacts" import is the real mechanism, by design on both iOS and Android.

## Run it

```
npm install
npm run dev         # http://localhost:5173
npm run build       # production build into dist/
npm run typecheck
npm run lint
npm test
```

## Stack

Vite, React 19, TypeScript (strict), Tailwind v4, Dexie (IndexedDB) + dexie-react-hooks, React Router, `qrcode` (generation) + `jsqr` (scanning), Vitest + Testing Library, `vite-plugin-pwa`.

Pure logic (vCard building/parsing, share presets) lives in `src/lib/` and is covered by colocated tests.

## Deploy

Static site; any static host works. `vercel.json` rewrites everything to `index.html` for client-side routing.
