# CLAUDE.md — Parichay (Contact Exchange)

A local-first, device-to-device contact exchange app. The whole point is that there is **no server and no account** — the app must keep working in airplane mode, for both sides of an exchange. Read `README.md` first for the product shape; this file is the build rules.

## Stack

- Vite + React 19 + TypeScript (strict)
- Tailwind v4 (CSS-first `@theme` tokens in `src/index.css`; use full static class strings, not template-built ones)
- Dexie (IndexedDB) + `dexie-react-hooks` for all app data — no `localStorage` for app data
- React Router for navigation
- `qrcode` to render a share QR client-side; `jsqr` + `getUserMedia` to scan one
- Vitest + React Testing Library

## Commands

```
npm run dev
npm run build
npm run typecheck   # tsc -b --noEmit
npm run lint         # oxlint
npm test             # vitest run
npm run test:watch
```

Run `typecheck`, `lint` and `test` before declaring any task done.

## Structure

```
src/
  lib/            # PURE logic, no React, no Dexie
    profileFields.ts  # the flat field shape shared by "my card" and a scanned contact
    presets.ts        # the four share presets and which fields each carries
    vcard.ts          # buildVCard / parseVCard — the only exchange format
    *.test.ts
  db/             # Dexie schema (profile, groups, contacts)
  hooks/          # useProfile, useGroups, useContacts — thin Dexie wrappers
  components/     # Avatar, BottomNav, FieldCard, Logo — presentational, reusable
  features/
    profile/      # "Your card" — build/edit the profile
    share/        # preset picker + QR
    scan/         # camera + jsQR + "card received" group-assign flow
    network/      # grouped, searchable list of collected contacts
    contact/      # one contact's detail + push-to-phone-contacts export
```

## Hard rules

1. **No network calls from the app, ever.** Not analytics, not a CDN font swap at runtime, nothing. The product's entire pitch is that it's safe to use with no signal. (A future marketing/landing page, if one gets added outside `src/`, is a separate concern — never the app itself.)
2. **The exchange is the vCard QR, full stop.** Don't add a second transport (Bluetooth, NFC, a share link) without asking first — Web Bluetooth isn't supported in iOS Safari and there's no cross-platform Web NFC, which is exactly why QR was chosen.
3. **Never silently write to the OS contacts.** There is no API for that on either platform. "Push to phone contacts" builds a `.vcf` and triggers a normal browser download; the OS's own import sheet is the real UI for that step. Don't try to get cleverer than that.
4. **A share preset never includes a field the profile's `includePhones` toggle has turned off**, even "Everything." That toggle is a blanket override, checked in `ShareScreen`'s `effectiveFields`, not baked into the presets themselves.
5. **Dexie schema changes are new `db.version(n)` blocks** with an `upgrade` step if existing data needs reshaping. Never edit an existing version block in place.
6. **Destructive actions need a confirmation.** Removing a contact is two taps (see `ContactDetailScreen`'s `confirmingDelete`), not one.
7. **Social handles normalize, but don't assume a platform.** `normalizeUrl` in `vcard.ts` treats anything containing a `.` as already a full domain/path and anything else as a bare handle — keep that contract if you touch it, the round-trip test (`vcard.test.ts`) pins it down.

## UI

- Mobile-first, phone width is the only width that matters (this is not a desktop app).
- Light theme only, matching the original design mockup's teal (`--color-accent`) / warm ochre (`--color-accent-warm`) palette — no dark-mode branch has been built; ask before adding one rather than bolting it on half-finished.
- `IBM Plex Sans` / `IBM Plex Mono` throughout.

## Known gaps / next steps (not yet built)

- No separate marketing/landing page or install instructions page (reknit and trove both have one — Parichay doesn't yet).
- No proper PWA icon set beyond the generated placeholder (`scripts/icon-512*.svg` — simple two-circle mark, fine for now, worth a real pass later).
- No automated test coverage for the Dexie hooks or the camera/scan loop (hard to test meaningfully without a real camera); `src/lib/` is the fully-tested part.
- Not yet deployed anywhere.

## Definition of done

A task is done when `typecheck`, `lint` and `test` all pass, the UI works at ~375px width, and the final message states what changed and anything left undecided.
