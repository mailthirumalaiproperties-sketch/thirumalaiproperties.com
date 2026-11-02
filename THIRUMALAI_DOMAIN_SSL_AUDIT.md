# Thirumalai Properties — Domain, DNS and SSL Audit

| | |
|---|---|
| **Audit date** | 2026-11-02, 08:28–08:35 UTC (13:58–14:05 IST) |
| **Scope** | thirumalaiproperties.com, www, blog — DNS, GitHub Pages, TLS |
| **Status** | ✅ **Main website restored.** Valid HTTPS on the apex and www, confirmed externally on all four GitHub Pages servers at 2026-11-02 09:46 UTC (§9). ✅ **Blog live** at https://blog.thirumalaiproperties.com with its own valid certificate, confirmed 2026-11-02 10:30 UTC (§10). |

---

## 1. Executive summary

> **Update, 2026-11-02 09:46 UTC: resolved.** After the domain-verification TXT record was added and the `www` CNAME was pointed at `mailthirumalaiproperties-sketch.github.io`, GitHub issued a new Let's Encrypt certificate (valid 2026-11-02 → 2027-01-31, covering the apex and www). `https://thirumalaiproperties.com` now returns **200** with a valid certificate on all four GitHub Pages servers. `www` and plain-http requests redirect (301) to it. Removing and re-adding the custom domain (step 3) was **not needed** and was not done. Full results are in §9.
>
> The findings below describe the state **before** the fix.

**The main site fails because GitHub Pages is still serving an expired certificate.** The Let's Encrypt certificate for `thirumalaiproperties.com` and `www.thirumalaiproperties.com` expired on **2026-10-11 09:07:50 UTC**, and GitHub never renewed it. That is exactly what `NET::ERR_CERT_DATE_INVALID` means. *(Confirmed.)*

**The most likely reason the renewal was missed** is that the domain was moved onto Cloudflare around 2026-08-20 and moved back to Hostinger nameservers **today (2026-11-02 06:01:59 UTC)**. While Cloudflare was in front, visitors saw Cloudflare's own valid certificates, so nobody noticed GitHub's certificate expiring behind it. When the nameservers came back to Hostinger this morning, visitors started connecting to GitHub directly and hit the expired certificate. *(The timeline is confirmed from registry and Certificate Transparency data. That this is why GitHub didn't renew is a strongly supported hypothesis; the Pages settings screen is needed to confirm it.)*

**Things that are not the problem:** your computer's clock, the apex A records, the CNAME file, CAA records, DNSSEC, IPv6 records, the deployment itself, and the old developer repository. Each was checked and ruled out.

**The fix is small and does not touch the website code:**
1. Verify the domain on your GitHub account (one TXT record).
2. Point `www` at your own GitHub Pages hostname.
3. Trigger GitHub's documented certificate re-issue (remove and re-add the custom domain **once**).

**Security issue found:** `blog.thirumalaiproperties.com` points at GitHub Pages, but no site claims it and the domain is not verified on GitHub. Right now, **any GitHub user could publish their own content at blog.thirumalaiproperties.com**. Step 1 of the repair plan closes this.

**Blog:** no blog application exists in any repository I can see. A hosting decision is needed before anything is built (see §10).

---

## 2. Current system architecture

```
                         Registrar: Hostinger (HOSTINGER operations, UAB)
                         Nameservers: ns1/ns2.dns-parking.com  (changed back today 06:01 UTC)
                                              │
        ┌─────────────────────────────────────┼─────────────────────────────────────┐
        │                                     │                                     │
  thirumalaiproperties.com          www.thirumalaiproperties.com        blog.thirumalaiproperties.com
  A ×4 → 185.199.108-111.153        CNAME → sivaathri.github.io         CNAME → sivaathri.github.io
        │                                     │  (former developer's account)       │  (same)
        └──────────────────────► GitHub Pages edge (185.199.108-111.153) ◄──────────┘
                                              │   routes by Host header, not by CNAME target
                         ┌────────────────────┴───────────────────┐
                         │                                        │
     mailthirumalaiproperties-sketch/thirumalaiproperties.com     (no repository claims "blog")
     Source: Deploy from branch gh-pages, / (root)                → "Site not found · GitHub Pages"
     Custom domain: thirumalaiproperties.com
     Serves: expired LE cert (apex + www)
```

| Component | Value | Evidence |
|---|---|---|
| Repository | `mailthirumalaiproperties-sketch/thirumalaiproperties.com` (public, created 2026-08-18 05:42 UTC) | GitHub API |
| Owner account | `mailthirumalaiproperties-sketch` (created 2026-08-18 05:28 UTC, 1 public repo) | GitHub API |
| App stack | React 19 + Vite 8 + Tailwind 4, EmailJS contact form, static SPA | `package.json` |
| Publishing | `gh-pages` branch, uploaded through the GitHub web UI (commits "Updates", "Create CNAME") | `git log origin/gh-pages` |
| Previous host repo | `sivaathri/Properties` (Pages still enabled, **no custom domain any more**) | GitHub API + HTTP redirect |

---

## 3. DNS audit

### 3.1 Records (authoritative answer from ns1.dns-parking.com; identical on 8.8.8.8, 1.1.1.1 and the local resolver)

| Type | Name | Target | TTL | Assessment |
|---|---|---|---|---|
| A | @ | 185.199.108.153 | 14400 | ✅ Correct GitHub Pages IP |
| A | @ | 185.199.109.153 | 14400 | ✅ Correct |
| A | @ | 185.199.110.153 | 14400 | ✅ Correct |
| A | @ | 185.199.111.153 | 14400 | ✅ Correct |
| CNAME | www | sivaathri.github.io | 300 | ⚠️ Works, but points at a different GitHub account. Should be `mailthirumalaiproperties-sketch.github.io` |
| CNAME | blog | sivaathri.github.io | 300 | ⚠️ Points at GitHub Pages but **no site claims it**, so it can be taken over |

### 3.2 Other records and registry data

| Check | Result | Assessment |
|---|---|---|
| NS | ns1.dns-parking.com, ns2.dns-parking.com (TTL 21600) | ✅ Matches Hostinger |
| SOA serial | `2026110201` | Zone edited **today** |
| RDAP (Verisign) "last changed" | **2026-11-02 06:01:59 UTC** | Registry-level change today, consistent with a nameserver switch |
| Registered / expires | 2026-01-18 / 2027-01-18 | ✅ |
| DNSSEC | Not signed (no DS) | ✅ No DNSSEC mismatch possible |
| CAA (apex) | None | ✅ Any CA, including Let's Encrypt, may issue |
| AAAA (apex) | None | ✅ No conflict (optional improvement, see §12) |
| TXT (apex) | None | — |
| `_github-pages-challenge-mailthirumalaiproperties-sketch` TXT | **NXDOMAIN** | ❌ Domain not verified on GitHub |
| MX | None | Note: no email is configured on this domain |

### 3.3 Cloudflare history (from Certificate Transparency logs, crt.sh)

| Issued (UTC) | Issuer | Names | Interpretation |
|---|---|---|---|
| 2026-01-18 | Let's Encrypt R12 | apex, www | GitHub Pages (original setup) |
| 2026-04-11 | Let's Encrypt R12 | apex, www | GitHub Pages renewal |
| 2026-07-03 | Google Trust Services WR1 | apex, www | — |
| **2026-07-13** | **Let's Encrypt YR2** | **apex, www** | **The certificate GitHub serves today. Expired 2026-10-11** |
| 2026-08-20 (×6) | Google Trust Services WE1/WR1 | apex, `*.thirumalaiproperties.com`, `*.www…` | **Wildcard certs. GitHub Pages never issues wildcards; this pattern matches Cloudflare Universal SSL** |
| 2026-08-21 (×2) | Let's Encrypt YE2 | apex, `*.thirumalaiproperties.com` | Same, Cloudflare-style |
| 2026-08-21 → today | — | — | **No new GitHub Pages certificate was issued** |

**Conclusion:** the domain was proxied through Cloudflare from about 2026-08-20 and returned to Hostinger DNS today. No Cloudflare records remain in public DNS now; all resolvers tested return Hostinger's answers.

**Propagation note:** `.com` delegations are cached for up to 48 hours. A few resolvers worldwide may keep sending visitors to Cloudflare until about **2026-11-04 06:00 UTC**. This also explains the mixed errors seen in different browser tabs.

---

## 4. GitHub Pages deployment audit

| Check | Result |
|---|---|
| Custom domain configured on the new repo | ✅ `http://mailthirumalaiproperties-sketch.github.io/thirumalaiproperties.com/` → `301 https://thirumalaiproperties.com/` |
| Enforce HTTPS | Appears **ON**: GitHub returns `301 http → https` for the apex and www |
| `CNAME` file on `main` (`public/CNAME`) and on `gh-pages` | ✅ Both contain `thirumalaiproperties.com` |
| Latest deployment | ✅ `gh-pages@a68ee84`, state `success`, environment URL `https://thirumalaiproperties.com/` (2026-08-18 06:00 UTC) |
| Pages build runs | 5 runs, all on 2026-08-18. Runs 1–2 built from `main` (raw source, which wouldn't work), runs 3–5 from `gh-pages`. Last run: success. No runs since. |
| `gh-pages` content | Production Vite build (`index.html`, `assets/index-WVXNu9st.js`, images, `robots.txt`, `sitemap.xml`, Google verification file). Its `index.html` matches `main`'s head/meta. |
| Stray files on `gh-pages` | `.env.example`, `.gitignore`, `.oxlintrc.json` are published. They contain placeholders only (no secrets), but they don't belong on a public site. |
| Old repo `sivaathri/Properties` | Pages still enabled, with **no** CNAME file and no custom domain (`http://sivaathri.github.io/Properties/` redirects only to its own https URL). **Does not conflict.** It is probably still serving a duplicate copy of the site. |
| `sivaathri.github.io` | 404, no user site. Only used as a CNAME target name. |
| Contributor `mecom8489` | Account returns 404 (deleted or renamed). |

**Not verifiable without your GitHub login:** what the Settings → Pages screen shows (DNS check result, certificate state, whether the Enforce HTTPS box is available), and the `/pages/health` API. The unauthenticated `GET /repos/…/pages` request returned 404. The `gh` CLI is not installed on this PC.

---

## 5. SSL/TLS certificate diagnosis

Retrieved with a .NET `SslStream` handshake (SNI set to each hostname), then cross-checked with `curl.exe` using normal Windows certificate validation.

| Host | Subject | Issuer | SANs | Valid from → to (UTC) | Result |
|---|---|---|---|---|---|
| thirumalaiproperties.com | CN=thirumalaiproperties.com | Let's Encrypt YR2 | apex, www | 2026-07-13 09:07:51 → **2026-10-11 09:07:50** | ❌ **Expired 22 days ago.** curl: `SEC_E_CERT_EXPIRED` |
| www.thirumalaiproperties.com | (same certificate, serial `0523…F67F`) | Let's Encrypt YR2 | apex, www | same | ❌ Expired, `SEC_E_CERT_EXPIRED` |
| blog.thirumalaiproperties.com | CN=*.github.io | Let's Encrypt YR1 | *.github.io, *.github.com, … | 2026-09-30 → 2026-12-29 | ❌ Name mismatch (GitHub's fallback certificate, because nothing claims the hostname). curl: `SEC_E_WRONG_PRINCIPAL` |

**Local clock check:** PC time 2026-11-02 08:29:08 UTC. The `Date` headers from Google, GitHub and Cloudflare were 08:29:04–08:29:10 UTC, so the clock is accurate to within 4 seconds. **The clock is not the cause.** (Windows reports its time source as "Local CMOS Clock / not synchronized", which is worth fixing but irrelevant here.)

**HSTS:** Chrome refuses to let visitors click through because the browser has an HSTS policy cached for this domain. *(Confirmed after the fix: GitHub Pages itself sends `Strict-Transport-Security: max-age=31556952`, which is one year.)* It needs no fix: with a valid certificate, HSTS works in your favour.

---

## 6. Root causes

### Confirmed

| # | Finding | Evidence |
|---|---|---|
| C1 | GitHub Pages serves an **expired** certificate for the apex and www. This is the direct cause of `NET::ERR_CERT_DATE_INVALID`. | TLS handshake, `SEC_E_CERT_EXPIRED` |
| C2 | GitHub has **not issued any new certificate** for the domain since 2026-07-13. | crt.sh |
| C3 | The domain was behind Cloudflare from about 2026-08-20, and the nameservers were moved back to Hostinger **today, 06:01:59 UTC**. | crt.sh wildcard certs, RDAP last-changed date, SOA serial 2026110201 |
| C4 | `blog` resolves to GitHub Pages but **no repository claims it**, so anyone could take it over. | HTTP 404 "Site not found", `*.github.io` cert |
| C5 | The `www` and `blog` CNAMEs point at `sivaathri.github.io` (former developer), not the owner `mailthirumalaiproperties-sketch.github.io`. | DNS |
| C6 | The domain is **not verified** on the owner's GitHub account. | TXT lookup NXDOMAIN |

### Hypotheses (supported, not proven)

| # | Hypothesis | Why I think so | How to confirm |
|---|---|---|---|
| H1 | GitHub stopped renewing because its DNS check failed while Cloudflare was proxying the domain (GitHub saw Cloudflare IPs instead of its own). | Renewal would have been due around 2026-09-11, inside the Cloudflare window. | **Effectively confirmed.** The Pages settings screen showed *"DNS check unsuccessful – Both thirumalaiproperties.com and its alternate name are improperly configured … (NotServedByPagesError)"*, and Enforce HTTPS was greyed out. Once DNS pointed at GitHub again, a new certificate was issued within the hour. |
| H2 | When the site moved from `sivaathri/Properties` to the new repository on 2026-08-18, the new repository never got its own certificate ("DNS Check in Progress"), and GitHub kept serving the old one. | Repo/account created 08-18; no certificate issued afterwards | Consistent with H1. It can't be separated from H1 now that both are resolved. |
| H3 | Some visitors still reach Cloudflare for up to 48 hours because of cached delegations. | `.com` NS TTL is 172800 s | Resolves itself by about 2026-11-04. All seven public resolvers tested at 09:45 UTC already return Hostinger. |

### Ruled out

Windows clock · apex A records · wrong CNAME file · CAA blocking Let's Encrypt · DNSSEC · conflicting AAAA records · failed deployment · another repository claiming the domain.

---

## 7. Changes made

All changes were made manually by the site owner in Hostinger and GitHub. Claude made no changes to production. Each change was verified externally afterwards.

| # | When (UTC, 2026-11-02) | Where | Change | Verified |
|---|---|---|---|---|
| 1 | ~09:35 | GitHub account → Settings → Pages | Started verifying `thirumalaiproperties.com` as a verified domain | TXT record visible on both Hostinger nameservers, 8.8.8.8 and 1.1.1.1 |
| 2 | ~09:35 | Hostinger DNS | **Added** `TXT _github-pages-challenge-mailthirumalaiproperties-sketch` = `73374e906f7fc3157fb806ed5cc9c1` (TTL 300) | ✅ |
| 3 | ~09:35 | Hostinger DNS | ⚠️ **Unintended:** the existing `CNAME www → sivaathri.github.io` record disappeared, apparently edited into the TXT record. `www` returned "does not exist" for roughly 5–10 minutes. | Detected by authoritative lookup |
| 4 | ~09:40 | Hostinger DNS | **Added** `CNAME www → mailthirumalaiproperties-sketch.github.io` (TTL 300). This restored `www` and completed plan step 2. | ✅ All resolvers; `http://www` → 301 to the apex |
| 5 | ~09:40–09:46 | GitHub (automatic) | New Let's Encrypt (YR1) certificate issued for the apex and www, valid until 2027-01-31 | ✅ All four Pages servers (§9) |
| 6 | ~10:10 | Both repos | `Sharveshraja1009` added as collaborator. Repo-local git author set to `Sharveshraja1009 <sharveshraja1009@gmail.com>` in both local clones. | Commit `313735b` is linked to the Sharveshraja1009 GitHub account |
| 7 | ~10:20 | `Blog.thirumalaiproperties` repo | Blog (Next.js static export) pushed to `main` by Sharveshraja1009. Pages Source set to **GitHub Actions**. Deploy run #1 succeeded. | ✅ Lint, build and deploy all succeeded |
| 8 | ~10:25 | Blog repo → Settings → Pages | Custom domain `blog.thirumalaiproperties.com` set | github.io URL → 301 to the blog domain |
| 9 | ~10:25 | Hostinger DNS | `CNAME blog`: `sivaathri.github.io` → `mailthirumalaiproperties-sketch.github.io` | ✅ Both Hostinger nameservers, 8.8.8.8, 1.1.1.1, 9.9.9.9 |
| 10 | ~10:27 | GitHub (automatic) | Let's Encrypt certificate issued for `blog.thirumalaiproperties.com`, valid until 2027-01-31 | ✅ All four Pages servers (§10) |

Not changed: apex A records, nameservers, main-site repository code, `main` and `gh-pages` branches of the main site, main-site Pages settings.

Files created:
- `THIRUMALAI_DOMAIN_SSL_AUDIT.md` (this report, untracked in the local clone, not committed)
- A certificate-inspection script in Claude's temporary scratchpad (outside the repository)

---

## 8. Changes requiring manual action (prioritised repair plan)

I don't have access to your GitHub account (no `gh` CLI or token) or to Hostinger, so each step below is a manual action. **Do the steps in order.** After each step, I can re-run the external checks.

**Progress (09:46 UTC):**
- Step 1: TXT added ✅. Confirm that GitHub → Settings → Pages lists the domain as **Verified**.
- Step 2: done ✅.
- Step 3: **not needed**, because the certificate was re-issued automatically.
- Still to do in the repo's Pages settings: click **Check again** so the stale "DNS check unsuccessful" message clears, then make sure **Enforce HTTPS** is ticked once it becomes clickable.
- Steps 4–5 and the blog are still open.

### Step 0 — Backup (done in this report)
Appendix A records every current DNS record and Pages setting.

### Step 1 — Verify the domain on GitHub (security; prerequisite for step 3)
1. GitHub → your profile picture → **Settings** → **Pages** (under "Code, planning, and automation") → **Add a domain** → enter `thirumalaiproperties.com`.
2. GitHub shows a TXT record. In **Hostinger → Domains → DNS / Nameservers → DNS records**, add:
   - Type `TXT`, Name `_github-pages-challenge-mailthirumalaiproperties-sketch`, Value: *(the code GitHub shows)*, TTL 300.
3. Back in GitHub, click **Verify**. Retry after a few minutes if it isn't immediate.

- **Impact:** none on visitors. It only adds a record.
- **Benefit:** stops any other GitHub account from claiming `thirumalaiproperties.com`, `www` or `blog`. This closes the blog takeover risk and protects the domain during step 3, when it is briefly unclaimed.
- **Rollback:** delete the TXT record and remove the verified domain.

### Step 2 — Correct the `www` CNAME
In Hostinger, edit `CNAME www`: change the target from `sivaathri.github.io` to `mailthirumalaiproperties-sketch.github.io` (TTL 300).

- **Impact:** none expected. Both names resolve to the same four GitHub IPs. This brings the setup in line with GitHub's documentation and removes the dependency on a former developer's account name.
- **Rollback:** set the target back to `sivaathri.github.io`.
- Leave `blog` unchanged for now (see §10).

### Step 3 — Re-issue the GitHub Pages certificate (main fix)
1. Repository → **Settings → Pages**. **Before changing anything, take a screenshot**: it confirms or rules out H1/H2.
2. If it shows "DNS check successful" with a working Enforce HTTPS box, wait 15 minutes and recheck the site. GitHub may already be re-issuing after today's nameserver change. If not:
3. Under **Custom domain**, click **Remove**. Then type `thirumalaiproperties.com` again and click **Save**.
4. Wait for "DNS check successful". The certificate usually arrives within about 15–60 minutes (GitHub allows up to 24 hours). Then tick **Enforce HTTPS**.

- **Impact:** for the time between removing and re-adding the domain (seconds to minutes), GitHub may show "Site not found". Until the certificate is issued, HTTPS stays unavailable, which it already is today. With "Deploy from a branch", GitHub automatically deletes and then re-creates the `CNAME` file on `gh-pages` with two small commits. Site files are not touched.
- **Do this only once.** If no certificate appears within 24 hours, contact GitHub Support with the screenshot rather than repeating it.
- **Rollback:** re-enter `thirumalaiproperties.com` in the Custom domain field and save. That restores the exact current state.
- GitHub documents this procedure under *Troubleshooting custom domains → HTTPS errors*: "you may need to remove and re-add your custom domain … to trigger the process of enabling HTTPS".

### Step 4 — Cloudflare clean-up (low priority, no visitor impact)
Log in to the Cloudflare account that held `thirumalaiproperties.com`. Confirm the zone shows as moved or inactive, then remove it. That way a future nameserver mistake can't silently bring back the old proxy and certificates.

### Step 5 — Old developer copy (low priority)
Ask the owner of `sivaathri/Properties` to disable GitHub Pages on that repository. It probably serves a duplicate of your site at `sivaathri.github.io/Properties/`, which is bad for SEO.

---

## 9. Main website verification results (baseline before the fix, 2026-11-02 08:30 UTC)

| URL | DNS | HTTP status | Redirect to | TLS | Final result |
|---|---|---|---|---|---|
| http://thirumalaiproperties.com | 4 × GitHub A | 301 | https://thirumalaiproperties.com/ | n/a | ❌ Ends on the expired-cert error |
| https://thirumalaiproperties.com | 4 × GitHub A | — | — | ❌ Expired 2026-10-11 | ❌ `NET::ERR_CERT_DATE_INVALID` |
| http://www.thirumalaiproperties.com | CNAME → sivaathri.github.io → GitHub | 301 | https://thirumalaiproperties.com/ | n/a | ❌ Ends on the expired-cert error |
| https://www.thirumalaiproperties.com | same | — | — | ❌ Expired (same cert) | ❌ |

### After the fix (2026-11-02 09:46 UTC, `curl.exe` with normal certificate validation, no bypass)

| URL | DNS | First response | Final destination | TLS | Content |
|---|---|---|---|---|---|
| http://thirumalaiproperties.com | 4 × GitHub A | 301 → https://thirumalaiproperties.com/ | 200 https://thirumalaiproperties.com/ | ✅ | ✅ |
| https://thirumalaiproperties.com | 4 × GitHub A | **200** | same | ✅ Valid: LE YR1, 2026-11-02 → 2027-01-31, SAN apex + www | ✅ Title "Thirumalai Properties \| Real Estate in Pondicherry & Puducherry", bundle `assets/index-WVXNu9st.js` (matches `gh-pages@a68ee84`) |
| http://www.thirumalaiproperties.com | CNAME → mailthirumalaiproperties-sketch.github.io | 301 → https://thirumalaiproperties.com/ | 200 apex | ✅ | ✅ |
| https://www.thirumalaiproperties.com | same | 301 → https://thirumalaiproperties.com/ | 200 apex | ✅ Same valid certificate | ✅ |

Certificate checked on each of 185.199.108.153, .109, .110 and .111 for both the apex and www: identical certificate on all, with no validation errors. Response headers include `Strict-Transport-Security: max-age=31556952`.

**Main website: verified working over HTTPS.**

If a browser still shows the old privacy error, it is using a cached connection. Close **all** Chrome windows and reopen, or try an incognito window.

---

## 10. Blog subdomain verification results and hosting decision

### Baseline

| URL | DNS | HTTP status | TLS | Content |
|---|---|---|---|---|
| http://blog.thirumalaiproperties.com | CNAME → sivaathri.github.io → GitHub | 404 | n/a | "Site not found · GitHub Pages" |
| https://blog.thirumalaiproperties.com | same | — | ❌ `*.github.io` cert, name mismatch | — |

The blog and the main site **do not** currently serve each other's content.

### After launch (2026-11-02 10:30 UTC)

Chosen architecture: **Option A, a static blog on GitHub Pages**, built in React (Next.js 16 static export + Tailwind CSS 4) in the separate repository `mailthirumalaiproperties-sketch/Blog.thirumalaiproperties` and deployed by GitHub Actions. It shares no code or deployment with the main site; the two only link to each other.

| URL | DNS | Status | TLS | Content |
|---|---|---|---|---|
| https://blog.thirumalaiproperties.com/ | CNAME → mailthirumalaiproperties-sketch.github.io | **200** | ✅ CN=blog.thirumalaiproperties.com, LE, until 2027-01-31, identical and error-free on all four Pages servers | ✅ "Thirumalai Properties Blog", 8 links to thirumalaiproperties.com |
| https://blog…/posts/* (3 articles) | same | 200 | ✅ | ✅ Each article is its own prerendered HTML page with canonical URL, Open Graph tags and BlogPosting JSON-LD |
| https://blog…/category/* (3) | same | 200 | ✅ | ✅ |
| https://blog…/sitemap.xml, /robots.txt | same | 200 | ✅ | ✅ Sitemap lists 7 URLs |
| https://blog…/no-such-page/ | same | 404 | ✅ | ✅ The blog's own branded 404 page |
| http://blog.thirumalaiproperties.com/ | same | **301 → https://blog.thirumalaiproperties.com/** | n/a | ✅ Fixed 10:46 UTC (see below) |

One article returned a single transient 503 from GitHub's CDN and then 200 on four consecutive retries.

**Stale CDN cache (resolved):** after the custom domain was attached, GitHub's CDN kept serving the "Site not found" page cached before the blog existed. It was seen for `http://blog…` (Age up to 3408 s) and by the owner's browser for `https://blog…`, even in InPrivate mode and with `?v=1`, because the Pages CDN ignores query strings in its cache key. A manual redeploy (workflow run #2, 10:46 UTC) purged it. Immediately afterwards `http` returned 301 → `https` and `https` returned 200 with `Age: 0`. **Lesson:** always deploy (or redeploy) *after* setting a Pages custom domain.

**Main site regression check (same time):** `https://thirumalaiproperties.com/` 200 with the main-site title; `www` and `http` 301 to the apex. The two sites serve different content.

### Existing blog application
None found. The main repository has no blog code (searched for "blog"), `mailthirumalaiproperties-sketch` has one public repository, and no `sivaathri` repository is blog-related. If a blog exists in a private repository or elsewhere, please point me to it.

### Hosting options (your decision needed)

| | **A. Static blog on GitHub Pages (recommended)** | **B. WordPress on Hostinger hosting** |
|---|---|---|
| Fits if | You're happy writing posts as Markdown files (or I add a simple Git-based editor) | Non-technical staff need a web editor, plugins and media library |
| Stack | Astro (fast, SEO-friendly, Markdown posts), deployed by GitHub Actions | WordPress + MySQL (server-side, so **cannot** run on GitHub Pages) |
| Repo | New, separate public repo `mailthirumalaiproperties-sketch/blog` | n/a |
| DNS for `blog` | CNAME → `mailthirumalaiproperties-sketch.github.io` | Target given by Hostinger hosting (usually an A record to the hosting IP) |
| HTTPS | Separate GitHub-issued certificate for `blog.` | Hostinger SSL (Let's Encrypt) |
| Cost | Free | Needs a Hostinger hosting plan |
| Independence from main site | Fully separate repo, deployment and certificate | Fully separate |

Either way, the blog will link and point visitors to `https://thirumalaiproperties.com` (properties, enquiries, contact) and **will not** redirect the whole subdomain.

**Until the blog exists:** step 1 (domain verification) removes the takeover risk. Alternatively, the `blog` record could be removed until launch. That deletes a DNS record, so I need your explicit go-ahead.

---

## 11. Remaining issues

1. The repo's Pages screen still showed a stale "DNS check unsuccessful (NotServedByPagesError)" and a greyed-out Enforce HTTPS box when last viewed. Click **Check again**, then tick **Enforce HTTPS** when it becomes available. GitHub already redirects http to https.
2. Up to 48 hours of nameserver propagation (until about 2026-11-04 06:00 UTC). A few visitors may still see Cloudflare during this window.
3. `gh-pages` is maintained by manual web uploads and contains stray files (`.env.example`, `.gitignore`, `.oxlintrc.json`).
4. The Windows PC isn't syncing time with an internet time server (currently accurate).
5. The status of the old Cloudflare zone is unknown.
6. No email (MX) is configured on the domain. Mentioned only in case you expected it.
7. **Blog:** tick **Enforce HTTPS** in the Blog repo's Pages settings. Plain `http://blog…` still shows a cached "Site not found" until GitHub's CDN cache expires.
8. **Blog content review:** the three starter articles are general guidance written during setup. Someone at Thirumalai Properties should check them for accuracy.
9. **Main site → blog link** is not added yet (it needs a main-site deployment, pending approval).
10. **Main-site bugs found during the blog work (not yet fixed):** the header call button dials the placeholder `tel:+911234567890` (`src/components/Navbar.jsx`), and the WhatsApp link `https://wa.me/9514476555` is missing the `91` country code (`src/components/Footer.jsx`).

---

## 12. Recommended improvements (after the site is restored)

1. **Automated deployment:** a GitHub Actions workflow that builds `main` and deploys to Pages. This replaces manual uploads, keeps the live site in sync with source, and stops stray files being published. EmailJS IDs would go in repository variables. *(Would change the production deployment process, so it needs your approval.)*
2. **Certificate monitoring:** a free uptime/SSL monitor (for example UptimeRobot) on the apex and blog, alerting about 14 days before expiry. This outage went unnoticed for weeks because Cloudflare masked it.
3. **One DNS provider:** keep Hostinger as the single DNS authority and note it here, so nameserver changes are deliberate.
4. **Optional IPv6:** add the four GitHub AAAA records for `@` (2606:50c0:8000::153 … 8003::153).
5. **Optional CAA:** `0 issue "letsencrypt.org"` on the apex, plus your blog host's CA if you choose option B. Add this only once the blog host is decided, or it could block that host's certificate.
6. **Enable Windows time sync:** Settings → Time & language → Date & time → "Set time automatically", then "Sync now".
7. Remove the GitHub Pages copy at `sivaathri.github.io/Properties/` (step 5).

---

## 13. Rollback instructions

| Step | Change | Rollback |
|---|---|---|
| 1 | TXT `_github-pages-challenge-mailthirumalaiproperties-sketch` added; domain verified | Delete the TXT record in Hostinger; GitHub → Settings → Pages → remove the verified domain |
| 2 | `www` CNAME → `mailthirumalaiproperties-sketch.github.io` (done) | Edit `www` back to `sivaathri.github.io`, TTL 300. **Not recommended:** the current value is the correct one. |
| 3 | Custom domain removed and re-added | Re-enter `thirumalaiproperties.com` in Settings → Pages → Custom domain → Save (restores the `CNAME` file on `gh-pages` automatically). If needed, `public/CNAME` on `main` and the `gh-pages` copy both contain `thirumalaiproperties.com` (Appendix A). |
| 4 | Cloudflare zone removed | Re-add the site in Cloudflare (only matters if you deliberately move nameservers back) |
| Any DNS | — | Restore from Appendix A |

---

## Appendix A — Configuration backup (as of 2026-11-02 08:30 UTC)

**Hostinger DNS (authoritative, ns1.dns-parking.com):**

```
@     A      185.199.108.153        14400
@     A      185.199.109.153        14400
@     A      185.199.110.153        14400
@     A      185.199.111.153        14400
www   CNAME  sivaathri.github.io    300
blog  CNAME  sivaathri.github.io    300
NS: ns1.dns-parking.com, ns2.dns-parking.com
SOA serial: 2026110201
No CAA, AAAA, TXT, MX records at apex. DNSSEC: off.
```

**GitHub Pages (`mailthirumalaiproperties-sketch/thirumalaiproperties.com`):**

```
Source:        Deploy from a branch → gh-pages, / (root)
Custom domain: thirumalaiproperties.com
Enforce HTTPS: on (inferred from GitHub's http→https 301)
gh-pages HEAD: a68ee84  ("Updates", 2026-08-18)
main HEAD:     c6bba7a  ("chore: add custom domain name to CNAME file")
CNAME file:    thirumalaiproperties.com   (main: public/CNAME, gh-pages: /CNAME)
```

## Appendix B — Commands used (all read-only)

- `git remote -v`, `git branch -a`, `git log`, `git ls-tree origin/gh-pages`, `git show origin/gh-pages:CNAME`
- `Resolve-DnsName` against 8.8.8.8, 1.1.1.1, ns1.dns-parking.com and the local resolver (A, AAAA, CNAME, NS, SOA, TXT, MX)
- `https://dns.google/resolve` for CAA, DS and `_github-pages-challenge` TXT
- `https://rdap.verisign.com/com/v1/domain/thirumalaiproperties.com` (registry data)
- `https://crt.sh/?q=thirumalaiproperties.com` (Certificate Transparency history)
- .NET `SslStream` handshake per hostname (subject, issuer, SANs, validity, policy errors)
- `curl.exe -I` over http (headers and redirects) and https (normal validation)
- Public GitHub REST API: repo, users, branches, contents, Actions runs, deployments
- `w32tm /query /status` and `Date` headers from Google, GitHub and Cloudflare (clock check)
