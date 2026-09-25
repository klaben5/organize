# reduceturnover.ai website

One scrolling landing page with one action: **Schedule a free consult**. Built from the launch package (Sep 24, 2026).

Plain HTML, CSS, and JavaScript with no build step. Open `index.html` in a browser, or serve the folder:

```sh
cd reduceturnover-website
python3 -m http.server 8000
```

## Files

| File | What it is |
| --- | --- |
| `index.html` | Landing page: nav, hero, cost strip, cost model, five levers, consult steps, founder, FAQ, final CTA, footer |
| `styles.css` | All styles (shared by every page) |
| `script.js` | Consult pop-up, scheduler embed, cost model, conversion tracking |
| `blog/` | Blog index and post #1 ("How much does employee turnover really cost?") |
| `privacy.html` | Privacy policy |
| `404.html` | Not-found page (uses absolute paths, so it must be served from the site root) |
| `og-image.png` | 1200×630 LinkedIn/social preview |
| `sitemap.xml`, `robots.txt` | For Search Console and Bing Webmaster Tools |

## Before launch: fill these in

Search the code for `[` and `TODO` to find all of them.

1. **Scheduler.** Set `SCHEDULER_URL` at the top of `script.js` to your Calendly or Cal.com 30-minute event link. Every "Schedule a free consult" button then opens it in a pop-up, passes along UTM tags, and shows the thank-you screen when a booking completes. Add the three intake questions (company and role, headcount, exits in the last 12 months) in the scheduler itself. Until it's set, the pop-up shows a built-in intake form that emails the request to `max@reduceturnover.ai`.
2. **Cost strip numbers.** `index.html` has `[$XX,000]` and `[X] months` placeholders, plus `[add your source]`. They show up underlined in blue so they can't be missed.
3. **Founder.** Your last name, photo (replace the "M" placeholder), and LinkedIn URL. These appear in `index.html` (founder section, footer, and JSON-LD) and in the blog post's JSON-LD.
4. **Privacy policy.** Add the launch date and have it reviewed.
5. **Analytics.** Uncomment the Plausible or GA4 snippet in the `<head>` of `index.html`. The page already sends these events:
   - `consult_click`, with a `location` property (nav, hero, calculator, levers, consult-steps, final, mobile-sticky)
   - `booking_completed`
   - `cost_model_used`

   Mark `booking_completed` as the conversion.

## Deploying

Any static host works (Netlify, Vercel, Cloudflare Pages, GitHub Pages). Serve this folder as the site root, set `404.html` as the not-found page, and redirect `www` to the bare domain (or the reverse).
