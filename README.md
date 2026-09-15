# familymoversweb

Public static site for [Family Movers (Pvt) Ltd](https://www.familymovers.lk) — packing, moving and storage in Sri Lanka since 1989.

Hostinger Git-syncs this repo’s `main` branch to production. No build step.

## Phase 1 redesign (current)

Homepage (`index.html`) rebuilt as a rich single page with hash sections ready for a later multi-page split (`#home`, `#about`, `#services`, `#portfolio`, `#testimonials`, `#contact`, `#quote`, `#team`, `#why`, plus journey IDs).

- Brand colours: navy `#013370` / `#001733` + gold `#fdba13`
- Quote form: embedded Google Form at `#quote`
- Analytics: GA4 `G-W453LPRSKV`
- WhatsApp widget + sticky mobile Call / WhatsApp / Quote bar

## Preview

```bash
python3 -m http.server 8080
```

Open http://localhost:8080

## Stack

Static HTML, CSS, and JS. No CMS, no secrets.
