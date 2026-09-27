CATSHU WHITELIST — REDESIGN V2

Files:
- index.html
- style.css
- app.js
- assets/catshu-1.png ... catshu-5.png

Supabase:
- Uses the publishable frontend key only.
- Table: public.whitelist
- Required columns: x_username, wallet, tasks_completed (jsonb), status, comment_link (text)
- Public INSERT RLS policy must allow the frontend to insert rows.

Flow:
1. Follow @1catshu
2. Like the CatShu post/page
3. Repost
4. Paste comment link (comment text is not checked)
5. Enter X username + EVM wallet and submit
6. A final whitelist card appears with the saved username and wallet.

Replace the X account/post links in index.html with exact post URLs when you have them.
Never put a Supabase service-role/secret key in frontend code.
