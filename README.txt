CATSHU WHITELIST V3

This version recreates the CatShu whitelist design shown in the reference: dark cosmic blue background, gold/yellow accents, bold comic typography, cat artwork, progress/task card, and a completed whitelist member card.

Supabase:
- Table: public.whitelist
- Required columns: id, created_at, x_username, wallet, tasks_completed, status, comment_link
- Keep your public INSERT RLS policy enabled.
- The frontend uses only the publishable Supabase key. Never put a service-role key in the frontend.

X:
- Official account used by the buttons: https://x.com/1catshu
- Replace the profile URL in index.html with a specific post URL when you have the final post for Like/Repost.

Deploy:
Upload index.html, style.css, app.js and assets/ to your GitHub repository. Vercel/GitHub Pages can then serve it as a static site.


V4 uses assets/catshu-hero-bg.png as the full hero background. The whitelist/progress panel is positioned clearly on the right on desktop.

V4.3 Lite: optimized mobile effects while preserving the desktop design.
