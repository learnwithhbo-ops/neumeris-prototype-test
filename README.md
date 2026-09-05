# Revily V2 plain Vite site

This is a framework-independent static deployment of the complete Revily V2 Fractions and Decimal Calculation application. It uses stable plain Vite only. There is no React, Next.js, vinext, Cloudflare Worker, database, or server-side runtime.

## Local development

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. The root redirects to `/fractions/`.

## Production build

```bash
npm run build
npm run preview
```

The complete deployable website is written to `dist`. Upload the **contents** of `dist` to the root of any ordinary static host, including Netlify, Vercel static hosting, Cloudflare Pages, Amazon S3/CloudFront, Apache, or nginx.

The application uses hash routes after `/fractions/`, so the host does not require server-side route rewrites. It must preserve the root public paths `/fractions/`, `/FRA 01 to 28/`, and `/CUR-N03_Decimal_Calculation_19_Atomic_Skills_v1.2/`.

Do not rename hashed MP3 files or the curriculum directories. Do not commit `node_modules`, `dist`, environment files, or credentials.
