CATSHU WHITELIST

Files:
- index.html
- style.css
- app.js
- assets/

Before deployment:
1. In Supabase, add a text column named `comment_link` to public.whitelist.
2. Keep the public INSERT RLS policy.
3. Replace the placeholder X links in app.js with the real CatShu account/post URLs.
4. Deploy this folder to Vercel as a static site.

Security:
- The Supabase key in app.js is a publishable key, not a secret/service-role key.
- Do not put a secret/service-role key in this site.
