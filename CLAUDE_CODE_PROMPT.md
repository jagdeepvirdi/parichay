# Claude Code prompt — finish shipping Parichay

Paste everything below this line as your first message to a fresh Claude Code
session, with this folder (`parichay/`) as the working directory. Run
`npm install` first — `node_modules/` was stripped before this was packaged.

---

You're picking up **Parichay**, a local-first contact-exchange app being
built for Jagdeep Virdi (GitHub: `jagdeepvirdi`, personal site
`jagdeepsinghvirdi.com`, where his other apps — Ghar, Reknit, Trove — live
on their own subdomains).

Read `CLAUDE.md` and `README.md` in this folder first — they're the real
spec and build rules. Don't restate them back to Jagdeep; just follow them.

## What's already built and verified — don't redo this

A full Vite + React 19 + TypeScript (strict) + Tailwind v4 + Dexie scaffold,
with all five screens wired to real local storage (no mock data):

- **Profile** (`src/features/profile`) — editable card, Professional/Personal
  sections, an "include phone numbers when sharing" toggle
- **Share** (`src/features/share`) — four presets, each rendering a real
  client-side vCard QR code via `qrcode`
- **Scan** (`src/features/scan`) — live camera + `jsqr` decoding, parses the
  vCard, lets you assign a group and a note, saves it
- **Network** (`src/features/network`) — grouped, searchable list
- **Contact detail** (`src/features/contact`) — "Push to phone contacts"
  downloads a real `.vcf` file (there's no silent-write API on either OS,
  so this is the correct, honest mechanism — don't try to replace it)

`src/lib/vcard.ts` (build + parse — the only exchange format) has full test
coverage, including a round-trip test that caught a real double-prefixed-URL
bug before it shipped. `npm run typecheck`, `npm run lint`, and `npm test`
all pass as of the one commit already in this repo (`git log`).

Everything is local-only: Dexie/IndexedDB, zero network calls from the app.
That is the entire point of the product — see rule 1 in `CLAUDE.md`.

## What's left

1. **Create the GitHub repo and push.** `jagdeepvirdi/parichay`, private,
   matching `ghar`/`reknit`/`trove`. This was blocked by a safety classifier
   in the sandboxed environment that built this scaffold (it declined both
   a raw `gh api` repo-creation call and the session's own repo-attach tool,
   with no reason given) — it should be an ordinary
   `gh repo create jagdeepvirdi/parichay --private --source=. --push` for
   you, assuming `gh` is authenticated as Jagdeep here. If it still gets
   refused, stop and tell Jagdeep rather than finding a workaround.
2. **Deploy it.** Vercel, matching the subdomain pattern of his other apps
   (`reknit.jagdeepsinghvirdi.com`, `ghar.jagdeepsinghvirdi.com`) —
   `parichay.jagdeepsinghvirdi.com` is the obvious name, but confirm with
   Jagdeep before touching DNS.
3. **Test the Scan flow on a real phone.** Camera-permission UX and QR
   legibility at normal reading distance couldn't be verified in the
   sandboxed build environment — this needs a real device.
4. **Optional, ask first** (these are explicitly called out as gaps in
   `CLAUDE.md`, not oversights):
   - A marketing/landing page + install page, matching Reknit's `/`
     (landing) + `/app/` (app shell) split.
   - A proper icon set — the current one (`scripts/icon-512*.svg`, baked
     into `public/`) is a simple placeholder two-circle mark.

Ask Jagdeep before changing any product behavior or scope. Everything above
is additive to what's already built and tested — the app works today, it
just isn't on GitHub, deployed, or phone-tested yet.
