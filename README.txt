CATSHU WHITELIST — redesigned site

FILES
- index.html
- style.css
- app.js
- assets/

IMPORTANT
1. Put your five CatShu images in assets/ using these names:
   catshu-1.png
   catshu-2.png
   catshu-3.png
   catshu-4.png
   catshu-5.png

2. Supabase table expected:
   public.whitelist
   x_username text
   wallet text
   comment_link text
   tasks_completed jsonb
   status text

3. Keep your public INSERT RLS policy with WITH CHECK (true).
4. This frontend uses the Supabase publishable key only. Never put a secret/service-role key in app.js.
5. The comment step only checks that a URL was pasted; it does not inspect the comment text.

The design is intentionally original: dark violet/black base, cyan + pink accents, angled character cards, no copied ticker/ribbon.
