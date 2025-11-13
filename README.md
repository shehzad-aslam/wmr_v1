Minimal Vercel project (Node.js serverless) for watermark detection + simple inpaint.

How to deploy:
1. Install dependencies locally: `npm install`
2. Run locally with `npx vercel dev` (requires Vercel CLI) or deploy to Vercel.
3. The static frontend is in public/index.html and serverless functions are in api/.

Notes:
- This is a lightweight heuristic approach (no heavy AI). It uses sharp to blur masked areas.
- For best results, run on images you own.
