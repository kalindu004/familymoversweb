# familymoversweb

Single-page replacement for the Joomla site at [familymovers.lk](https://www.familymovers.lk).

Copy, photos, logos, and contact details were taken from the live site. The embedded Google Form for quote requests is **not** included; inquiries go to `info@familymovers.lk`.

## Preview

From this folder:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080

## Deploy (cutover later)

Upload the contents of this folder (keep `index.html` at the web root) to the existing host, or enable GitHub Pages on `main`. Point `familymovers.lk` at the new files when you are ready — DNS/hosting cutover is out of this repo.

## Stack

Static HTML, CSS, and a small JS file. No CMS, no build step, no secrets.
