# FileFlex

FileFlex converts supported images and documents entirely in your browser. Every conversion and compression is completely free — no sign-up, no trial limits, and no data collection. Files stay on the device and are never uploaded; no database or server storage is used.

## Features

- Unlimited, free conversions — no accounts, no trial caps, no limits
- 100% client-side processing: images, PDFs, docs, and more never leave your device
- Batch conversion with ZIP download, file compression, and shareable links

## Local development

1. Install Node.js 22 or later.
2. From the repository root, run:

   ```sh
   cd fc
   npm ci
   npm start
   ```

   `npm start` runs the React development server. To preview through the Vercel CLI, use `npm run dev` instead.

## Build

```sh
cd fc
npm run build
```

## Deploy to Vercel

1. Push the repository to GitHub:

   ```sh
   git add .
   git commit -m "Prepare FileFlex deployment"
   git push origin main
   ```

2. Import the repository in Vercel and set **Root Directory** to `fc`.
3. Use `npm ci` for install and `npm run build` for build. The included `vercel.json` sets the CRA output directory to `build`; `vercel-build` runs the same build.

Hash navigation works on static hosting without SPA rewrites.

## Security and privacy

- All conversion, compression, and link generation happens locally in your browser.
- Files never leave your device and are never stored by FileFlex.
- No accounts, no sign-in, no tracking, and no data collection.
- Only your theme, motion, and cookie preferences are saved in browser localStorage, which you fully control.
