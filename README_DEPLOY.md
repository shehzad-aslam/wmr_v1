# Watermark Remover Project (Frontend + Flask backend)

This package contains:
- `watermark_remover_prototype.py` - OpenCV-based detection & inpainting prototype.
- `server.py` - Minimal Flask server exposing `/detect-mask` and `/inpaint`.
- `watermark_remover_demo.html` - Simple browser frontend for local testing.
- `vercel_frontend/` - Next.js frontend that proxies to an external backend (for Vercel deployment).

## Quick local run (no Docker)
1. Create a virtualenv and install:
   ```
   pip install -r requirements.txt
   ```
2. Run the Flask server:
   ```
   python server.py
   ```
3. Open `watermark_remover_demo.html` in your browser and test (it posts to `http://127.0.0.1:5000`).

## Deploying frontend to Vercel
- Deploy `vercel_frontend/` to Vercel and set `BACKEND_URL` in Vercel env vars to point at your Flask server (public URL).

## Notes
- This is educational. Removing copyrighted watermarks without permission may be illegal.
