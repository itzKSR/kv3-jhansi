# KV3 Jhansi — Class XII Farewell Portal (Next.js + 3D + GSAP + Supabase)

A 3D & GSAP-animated farewell website built for **PM SHRI Kendriya Vidyalaya No. 3, Jhansi** with:
- **Interactive Three.js 3D background** + **GSAP ScrollTrigger & 3D tilt animations**
- **Participant Registration Form** (`Name`, `Class & Section`, `Stream`, `Willing to Pay: Yes/No`)
- **KV Crown Voting Booth** with normalized candidate name matching (`lib/voteCounter.ts`)
- **Live Recharts Bar Graph** with category tabs and optional organizer passcode lock

## Deploy to Vercel + Connect Supabase (5 Minutes)

1. **Upload to GitHub:** Unzip this folder and push it to a new GitHub repository.
2. **Import into Vercel:** Go to [vercel.com/new](https://vercel.com/new), import your GitHub repo, and click **Deploy**.
3. **Add the Database (Supabase):**
   - In your Vercel project dashboard, open the **Storage** tab (or visit the [Supabase Marketplace Integration](https://vercel.com/marketplace/supabase)) and connect a free **Supabase** project.
   - Vercel automatically injects `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY`.
4. **Create the Tables:**
   - Open your Supabase Dashboard -> **SQL Editor** -> **New Query**.
   - Paste the entire contents of `supabase/schema.sql` and click **Run**.
5. **Redeploy on Vercel:** Trigger one redeploy in Vercel so the new environment variables take effect. Your form entries and crown votes are now permanently stored in PostgreSQL!

## Optional: Hide the Live Results Graph Until the Party
Add an environment variable in Vercel (`Project Settings -> Environment Variables`):
- `NEXT_PUBLIC_RESULTS_PASSCODE=kv3jhansi2026`

Then redeploy—students will be able to register and vote, while only organizers with the passcode can unlock the live bar chart.
