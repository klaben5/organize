# ReduceTurnover.ai website

A static marketing site for ReduceTurnover.ai, a consulting firm that helps companies reduce employee turnover.

## Files

- `index.html`: the whole page (hero, services, approach, cost calculator, industries, FAQ, contact)
- `styles.css`: all styles, responsive down to phone width
- `script.js`: mobile menu, turnover cost calculator, contact form validation
- `favicon.svg`: site icon

There's no build step or dependencies. Open `index.html` in a browser, or serve the folder locally:

```sh
cd reduceturnover-website
python3 -m http.server 8000
```

## Deploying

Upload the folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, S3) and point `reduceturnover.ai` at it.

## Before going live

- **Contact form**: it currently opens the visitor's email app (`mailto:hello@reduceturnover.ai`). For real lead capture, point the form's `action` at a form service (Formspree, Netlify Forms, HubSpot) or your CRM.
- **Email address**: confirm `hello@reduceturnover.ai` exists, or change it in `index.html`.
- **Content**: the stats band uses general industry estimates. Swap in your own figures, client results, or testimonials once you have them.
