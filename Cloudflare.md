# Cloudflare Pages Deployment & Security

> **AGENT INSTRUCTION:** When deploying an Astro site to Cloudflare Pages, follow this document exactly. The `_headers` file is the most important security configuration — do not deploy without it.

---

## 1. Initial Setup

### Connect GitHub repository

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Pages**
2. Click **Create a project** → **Connect to Git**
3. Select your GitHub repository
4. Configure build settings:

| Setting | Value |
|---------|-------|
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` |

5. Click **Save and Deploy**

> **AGENT INSTRUCTION:** Cloudflare Pages reads `.nvmrc` automatically. Ensure it exists in your repo root with the correct Node version (e.g., `22`). You do NOT need to set `NODE_VERSION` as an environment variable if `.nvmrc` is present.

### Custom domain

1. In your Pages project, go to **Custom domains**
2. Add your domain (e.g., `yourdomain.com`)
3. Cloudflare will prompt you to add a DNS record — approve it
4. Enable **Always Use HTTPS** in the domain's SSL/TLS settings

> **AGENT INSTRUCTION:** For the highest security score, use the "Full (strict)" SSL/TLS encryption mode in Cloudflare. This requires a valid certificate on the origin (which Cloudflare Pages provides automatically).

---

## 2. Build Configuration

### Environment variables (optional)

In Pages project settings → **Environment variables**:

| Variable | Value | When needed |
|----------|-------|-------------|
| `NODE_VERSION` | `22` | Only if `.nvmrc` is missing |
| `ASTRO_TELEMETRY_DISABLED` | `1` | Always — disables Astro analytics |

> **AGENT INSTRUCTION:** Set `ASTRO_TELEMETRY_DISABLED=1` on all projects. This is a privacy best practice and has no impact on functionality.

### Build output

Astro's `output: "static"` generates a `dist/` folder with:
- HTML files for every route
- `_astro/` folder with hashed CSS/JS assets (cache-friendly)
- Any files from `public/` copied verbatim

Cloudflare Pages serves `dist/` directly. No server runtime is needed.

---

## 3. Security Headers (`public/_headers`)

Create `public/_headers`. This is the single most important file for security.

### Default template (adjust for your needs)

```
/*
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; upgrade-insecure-requests
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/
  Cache-Control: public, max-age=0, must-revalidate
```

> **AGENT INSTRUCTION:** Copy this template and modify ONLY the CSP directives to match your third-party services (analytics, fonts, forms). Do not remove any other headers. The `/*` path applies headers to ALL routes. Path-specific rules below it override for matching routes.

### Header reference

| Header | Purpose | Value |
|--------|---------|-------|
| `Strict-Transport-Security` | Forces HTTPS (HSTS) | `max-age=63072000; includeSubDomains; preload` |
| `Content-Security-Policy` | Prevents XSS, injection | See CSP section below |
| `X-Frame-Options` | Clickjacking protection | `DENY` or `SAMEORIGIN` |
| `X-Content-Type-Options` | MIME sniffing protection | `nosniff` |
| `Referrer-Policy` | Controls referrer leakage | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Disables browser APIs | Deny all unnecessary APIs |
| `Cross-Origin-Opener-Policy` | Window isolation | `same-origin` |
| `Cross-Origin-Resource-Policy` | Resource isolation | `same-origin` |

### Content-Security-Policy (CSP)

CSP is the most complex header. Start strict and relax only as needed.

#### Default CSP (no third-party services)

```
default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; upgrade-insecure-requests
```

#### With Google Analytics 4 + GTM

```
default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.google-analytics.com; font-src 'self'; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://*.google-analytics.com; upgrade-insecure-requests
```

#### With Google Fonts

```
...; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ...
```

#### With Web3Forms (or similar form endpoint)

```
...; connect-src 'self' https://api.web3forms.com; form-action 'self' https://api.web3forms.com; ...
```

> **AGENT INSTRUCTION:** Astro generates inline styles during build, so `style-src 'self' 'unsafe-inline'` is required. `script-src 'unsafe-inline'` should be avoided if possible — use external `.js` files or `type="text/partytown"` for analytics instead. Always use `upgrade-insecure-requests` to upgrade HTTP to HTTPS automatically.

### Cache-Control headers

| Path pattern | Directive | Why |
|--------------|-----------|-----|
| `/_astro/*` | `public, max-age=31536000, immutable` | Hashed filenames — safe to cache forever |
| `/assets/*` | `public, max-age=31536000, immutable` | Your own hashed/static assets |
| `/*.html` | `public, max-age=0, must-revalidate` | HTML should always be fresh |
| `/` | `public, max-age=0, must-revalidate` | Homepage must be fresh |
| Any page | `public, max-age=0, must-revalidate` | Cloudflare CDN handles edge caching |

> **AGENT INSTRUCTION:** Cloudflare Pages automatically applies `Cache-Control: public, max-age=0, must-revalidate` to HTML. You can override per-path. The `_astro/` directory contains files with content hashes in their names (e.g., `index.DNs6zLT3.css`) — these are safe to cache forever because the hash changes when content changes.

---

## 4. Redirects

Create `public/_redirects` for URL changes:

```
# Old URL → New URL (301 permanent redirect)
/old-page      /new-page      301
/another-old   /another-new   301

# External redirect
/outdated-blog  https://medium.com/your-post  301
```

> **AGENT INSTRUCTION:** Always use 301 for permanent moves. Cloudflare Pages supports up to 100 redirect rules in `_redirects`. For more complex routing, use Cloudflare's Redirect Rules in the dashboard.

---

## 5. robots.txt

Create `public/robots.txt`:

```
User-agent: *
Allow: /
Sitemap: https://yourdomain.com/sitemap-index.xml
```

> **AGENT INSTRUCTION:** Replace `yourdomain.com` with your actual domain. The sitemap is auto-generated by `@astrojs/sitemap` during build. If you have pages that should not be indexed (like `/politica-de-cookies`), add `Disallow: /politica-de-cookies/` here OR use `<meta name="robots" content="noindex">` in the page.

---

## 6. security.txt

Create `public/.well-known/security.txt`:

```
Contact: mailto:security@yourdomain.com
Expires: 2027-01-01T00:00:00.000Z
Acknowledgments: https://yourdomain.com/security-hall-of-fame
Policy: https://yourdomain.com/security-policy
```

> **AGENT INSTRUCTION:** This is optional but recommended for production sites. It tells security researchers how to report vulnerabilities responsibly. The `.well-known/` directory is the standard location.

---

## 7. DNS Configuration

### For Cloudflare-managed domains

1. Set the proxy status to **Proxied** (orange cloud) for your A/AAAA/CNAME records
2. Go to **SSL/TLS** → **Overview** → Set to **Full (strict)**
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**

### Security settings to enable

| Setting | Location | Recommendation |
|---------|----------|----------------|
| **SSL/TLS** | SSL/TLS → Overview | Full (strict) |
| **Always Use HTTPS** | SSL/TLS → Edge Certificates | On |
| **Automatic HTTPS Rewrites** | SSL/TLS → Edge Certificates | On |
| **HSTS** | SSL/TLS → Edge Certificates | Enable (matches `_headers`) |
| **Security Level** | Security → Settings | High |
| **Browser Integrity Check** | Security → Settings | On |
| **Brotli** | Speed → Optimization | On |
| **Early Hints** | Speed → Optimization | On |
| **Auto Minify** | Speed → Optimization | HTML, CSS, JS — On |

> **AGENT INSTRUCTION:** The `_headers` file HSTS setting and Cloudflare's dashboard HSTS are redundant — that's fine. The browser uses whichever is stricter. "Full (strict)" SSL mode ensures encrypted end-to-end communication.

---

## 8. Analytics

### Option A: Cloudflare Web Analytics (Recommended)

1. In Cloudflare Dashboard → **Analytics & Logs** → **Web Analytics**
2. Add your site — no code changes needed
3. Privacy-friendly, no cookie banner required

### Option B: Google Analytics 4

Add to `BaseLayout.astro`:

```astro
<script
  type="text/partytown"
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
></script>
<script type="text/partytown">
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag("js", new Date());
  gtag("config", "G-XXXXXXXXXX");
</script>
```

Update CSP in `_headers` to include GA domains (see CSP section above).

> **AGENT INSTRUCTION:** Cloudflare Web Analytics is simpler and more privacy-respecting. Use GA4 only if you need advanced funnel/segmentation features. With GA4, you need a cookie consent banner in the EU. With Cloudflare Analytics, you don't.

---

## 9. Deploy Workflow

### What happens on push to `main`

1. Developer pushes to `main`
2. GitHub Actions runs `ci.yml` — lint, build, Lighthouse CI, Playwright tests
3. If CI passes, Cloudflare Pages auto-deploys from `main`
4. Cloudflare Pages builds with `npm run build`
5. After deployment succeeds, GitHub triggers `deploy.yml`
6. `deploy.yml` runs Playwright tests against the LIVE URL
7. If smoke tests pass, the deployment is verified

> **AGENT INSTRUCTION:** This is a "deploy then verify" pattern. The site goes live immediately after Cloudflare builds it, but the smoke test job alerts you if something is broken in production. For critical sites, add branch protection requiring CI pass before merge.

---

## 10. Troubleshooting

### "Build failed: Command not found"

Ensure `package.json` has a `build` script and all dependencies are in `dependencies`/`devDependencies`, not globally installed.

### "Headers not applied"

- Check that `public/_headers` exists (NOT `_headers` in root)
- Verify syntax: no trailing spaces, proper indentation
- Test with `curl -I https://yourdomain.com/`

### "CSP blocks my analytics/fonts"

Check browser DevTools → Console for CSP violation errors. Add the blocked domain to the appropriate CSP directive. Use `https:` (not specific domains) only if you trust all HTTPS sources.

### "Images not loading"

Ensure `img-src` in CSP includes `data:` (for inlined SVGs) and `https:` (for external images) if needed.

### "Fonts not loading"

Ensure `font-src` in CSP includes your font CDN (e.g., `https://fonts.gstatic.com` for Google Fonts). Self-hosted fonts only need `'self'`.

---

## 11. Security Score Checklist

Run [securityheaders.com](https://securityheaders.com/) against your site. Target:

| Check | Target | How |
|-------|--------|-----|
| Strict-Transport-Security | A+ | `max-age=63072000; includeSubDomains; preload` |
| Content-Security-Policy | A+ | Strict but functional CSP |
| X-Frame-Options | A+ | `DENY` |
| X-Content-Type-Options | A+ | `nosniff` |
| Referrer-Policy | A+ | `strict-origin-when-cross-origin` |
| Permissions-Policy | A+ | Deny unnecessary APIs |
| Cross-Origin-Opener-Policy | A+ | `same-origin` |
| Cross-Origin-Resource-Policy | A+ | `same-origin` |

> **AGENT INSTRUCTION:** A+ on securityheaders.com should be your minimum target. The template `_headers` above achieves this out of the box. You only lose points if you weaken CSP for third-party services — document any relaxations.

---

## 12. Quick Setup Checklist

For a new deployment:

- [ ] Connect GitHub repo in Cloudflare Pages dashboard
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `dist`
- [ ] Verify `.nvmrc` exists with correct Node version
- [ ] Add custom domain and enable "Always Use HTTPS"
- [ ] Set SSL/TLS to "Full (strict)"
- [ ] Create `public/_headers` with all security headers
- [ ] Create `public/_redirects` for any URL changes
- [ ] Create `public/robots.txt`
- [ ] Create `public/.well-known/security.txt` (optional)
- [ ] Enable Brotli, Early Hints, Auto Minify in Speed settings
- [ ] Run `curl -I https://yourdomain.com/` to verify headers
- [ ] Test on [securityheaders.com](https://securityheaders.com/)
- [ ] Verify sitemap is accessible at `/sitemap-index.xml`
