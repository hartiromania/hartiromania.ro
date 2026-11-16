# CLAUDE.md — hartiromania.ro

> Instrucțiuni de proiect pentru Claude: stack, structură, convenții. Detaliile operaționale private (conturi, email și DNS, variabile de mediu, newsletter, preferințele owner-ului) sunt în `CLAUDE.local.md`, care nu se publică (e în `.gitignore`) și e încărcat mai jos. Citește-le pe amândouă la începutul fiecărei sesiuni.

@CLAUDE.local.md

## 1. Project Overview

**hartiromania.ro** este un site de prezentare + catalog de hărți istorice românești, cărți și vederi de colecție. Modelul de business e un **showcase / brochure site cu external-cart redirect**: site-ul gestionează identitatea brandului, conținutul și SEO-ul, iar pentru orice comandă utilizatorul e redirecționat la eMag (eMag Marketplace) prin buton "Comandă". Nu există coș nativ, plată sau logistică pe site.

**Brand**: 100% românesc, focus pe patrimoniu cultural, hărți vintage, istorie nefalsificată a poporului român

## 2. Stack tehnic

- **Framework**: Next.js 16 (App Router, Turbopack) + React 19.3 + TypeScript 6.0 (maximul suportat de typescript-eslint; TS 7 încă nu)
- **Runtime**: Node.js 24 (`.nvmrc`, `engines` în `package.json` — Vercel îl citește de acolo)
- **Tooling**: pnpm 11 (`packageManager`), ESLint 10 (flat config, `eslint-config-next`), Prettier, GitHub Actions
- **Styling**: Tailwind CSS v4 + shadcn/ui (doar button, card, carousel, input, textarea). Iconițe: lucide-react 1.x; iconițele de rețele sociale sunt în `components/brand-icons.tsx` (lucide 1.0 le-a scos)
- **Fonturi**: Playfair Display (titluri) + Crimson Text (body) — Google Fonts
- **Hosting**: Vercel (deploy automat din GitHub `main`)
- **Domeniu**: DNS gestionat în Vercel (registrar și înregistrări: `CLAUDE.local.md`, secțiunea 3)
- **Cod**: GitHub (`hartiromania/hartiromania.ro`)

## 5. Structură cod / fișiere

### Pages (App Router)

- `/` — homepage (hero + featured products + about + brand pride)
- `/produse` + `/produse/{harti,vederi,carti}` — listare per categorie
- `/produse/[category]/[slug]` — pagina de produs
- `/promo` + `/promo/[slug]` — pachete combo promoționale
- `/despre`, `/contact`, `/video`
- `/blog`, `/blog/[slug]`, `/blog/{category,author,tag}/[slug]`
- `/xdxadmin` — setează cookie de admin (24h) pentru afișare condiționată (NU e auth real)

### API routes

- `/api/contact` — POST: form de contact via Resend
- `/api/newsletter/subscribe` — POST: subscribe la MailerLite (validează email, body: `{email, name?, source}`)
- `/api/cron/blog-newsletter` — GET: cron handler care trimite newsletter la articol nou (vezi secțiunea 8)

### Components cheie

- `components/header.tsx`, `components/footer.tsx`
- `components/newsletter-form.tsx` — form refolosibil cu 3 variante (`footer` / `card` / `popup`)
- `components/newsletter-popup.tsx` — modal cu logica de timing (20s AND 50% scroll, localStorage one-time)
- `components/newsletter-blog-cta.tsx` — block mid-article în pagini de blog
- `components/product-card.tsx`, `components/product-search.tsx`, `components/promo-card.tsx`
- `components/image-magnifier.tsx`, `components/blog-text-zoom.tsx`
- `components/ui/*` — shadcn/ui

### Data

- **Produsele și pachetele promo sunt în Sanity CMS** (NU mai în cod) — vezi secțiunea 12. Fetch prin `lib/sanity/{products,promo}.ts`. (Fișierele vechi `lib/products-data.tsx` / `lib/promo-data.tsx` au fost șterse după migrare.)
- `lib/categories.ts` — cele 3 categorii (statice, structurale)
- `lib/navigation.ts` — link-uri header
- `lib/types.ts` — tipuri TypeScript (Product, ProductCategory, PromoPackage)
- `lib/zenblog.ts` — client REST pentru Zenblog
- `lib/search-utils.ts` — utilitare căutare
- `lib/blog-newsletter-template.ts` — HTML template pentru emailul de notificare la articol nou
- `lib/mailerlite-campaigns.ts` — helper-uri pentru MailerLite Campaigns API (create + schedule + delete)

### Cron config

- `vercel.json` — schedule `0 8 * * *` (zilnic 08:00 UTC = 11:00 RO vara / 10:00 iarna) pentru `/api/cron/blog-newsletter`

### Proxy (fostul middleware)

`proxy.ts` (Next 16 a redenumit `middleware` în `proxy`) face redirect din vechi URL-uri (`/harti/*`, `/carti/*`, `/vederi/*`) către noul prefix `/produse/*`.

### Next config

`next.config.mjs`:

- `eslint.ignoreDuringBuilds: true` (lint-ul rulează separat, în CI)
- erorile TypeScript opresc build-ul
- Remote patterns: vercel-storage, zenblog
- AVIF + WebP cu device sizes optimizate

## 7. Convenții de lucru

### Workflow (din 12 nov 2026; modelat după openbrasov / ngig.cloud)

1. **Start task**: `git status` → `git checkout main && git pull` → `git checkout -b <tip>/<slug-scurt>` (ex. `feat/seo-sitemap`, `fix/lupa-zoom`, `chore/upgrade-next`). Fără branch-uri `claude/*` noi.
2. **Descriere înainte de cod**: spune exact ce urmează să faci, cu întrebările deschise; abia după răspuns începi implementarea.
3. **Commit pe sub-task**, cu `git add <căi explicite>`. Mesaj multi-linie scris cu heredoc Bash (`git commit -F - <<'EOF'`), nu cu here-string PowerShell.
4. **Verificări locale obligatorii, făcute de Claude înainte de predare**: `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build`, plus verificarea în browser (Playwright, pe `pnpm build && pnpm start`) a paginilor atinse. Owner-ul testează abia după, doar pe localhost (nu pe Vercel Preview).
5. **Push + PR de Claude**: primul push `git push -u origin <branch>`; PR cu `gh pr create --base main --title "<titlu>" --body-file <fișier .md din scratchpad>` (niciodată `--body` inline: backtick-urile se execută în shell). După creare, un singur `gh pr checks` ca să confirmi că titlul trece; fără polling pe CI.
6. **Owner-ul** testează local (dacă e nevoie de o verificare vizuală) și face **Squash merge** din GitHub. Confirmarea merge-ului: `gh pr view <n> --json state,mergedAt` (nu te baza pe „am dat merge”).
7. **După merge**: `git checkout main && git pull`, șterge branch-ul local, propune următorul task.
8. **release-please** deschide/actualizează singur PR-ul de release (versiune + `CHANGELOG.md`) și îl unește automat.

### Titluri PR și commit-uri

- **Conventional Commits, în engleză, subiect cu literă mică**: `feat: add product sitemap`, `fix(seo): canonical url on blog posts`. Verificat de `.github/workflows/pr-title.yml`.
- Tipuri: `feat` (versiune minoră), `fix` (patch), `perf`, `refactor`, `docs`, `chore`, `ci`, `build`, `style`, `test`, `revert`.
- **Descrierea PR-ului în română**, pe șablonul din `.github/PULL_REQUEST_TEMPLATE.md` (Ce schimbă / De ce / Verificare); la „Verificare” scrii ce ai rulat efectiv și rezultatul.
- Textul public (PR, commit, README) descrie doar ce s-a implementat și cu ce tehnologie, fără intenții sau ce lipsește. Squash commit-ul păstrează descrierea pentru totdeauna.
- **Fără atribuire AI**: niciun `Co-Authored-By` și niciun footer „Generated with” în commit-uri sau PR-uri.

### CI (GitHub Actions)

- `ci.yml`: pe fiecare PR și pe `main` rulează `pnpm lint`, `format:check`, `typecheck`, `build` (job-ul `check`).
- `pr-title.yml`: validează titlul PR-ului.
- `release-please.yml` + `release-please-config.json`: versiuni și CHANGELOG în română.
- `dependabot.yml`: săptămânal, minor+patch grupate într-un singur PR; majorele separat.

### Modificarea codului

- TypeScript e verificat la build (`ignoreBuildErrors` a fost scos): o eroare de tip oprește deploy-ul.
- shadcn/ui: nu modifica `components/ui/*` decât dacă owner-ul cere explicit (exclus și din Prettier).
- Formatare: Prettier (`pnpm format`), stilul din `.prettierrc` (punct și virgulă, ghilimele duble, 100 coloane).
- Textele românești de pe site folosesc ghilimelele „…”.

### Style guidelines

- **Estetică vintage**: accent-orange (token `--orange-accent` = `#a0501a`, ales pentru contrast AA cu textul crem; `#d2691e` rămâne pentru rame și elemente decorative mari), border-double pe secțiuni importante, fonturi Playfair pentru titluri, Crimson Text pentru body
- **Accesibilitate**: text normal ≥ 4,5:1, titlurile nu sar niveluri (h1 → h2 → h3), butoanele doar-iconiță au `aria-label`; pentru butoane cu culoare din Sanity, textul vine din `readableTextOn()` (`lib/utils.ts`)
- **Culori principale**: `accent-orange`, `accent-orange-foreground`, `muted-foreground`, `card`, `background`
- **Hover states**: scale-105 sau opacity transitions, niciodată culori complet diferite
- **Mobile-first**: toate componentele responsive, breakpoint principal `md:` (768px)

## 11. Reguli speciale pentru Claude

- **Respectă** regula globală din `~/.claude/CLAUDE.md` — anunță folosirea/încheierea folosirii agenților când owner-ul îi cere explicit pe nume.
- **NU instala pachete npm noi** fără confirmare explicită — proiectul e mid-size și owner-ul vrea control asupra dependențelor.
- **Când adaugi un pachet nou**: `pnpm add <pachet>` (pnpm 11 e instalat global; corepack nu mai vine cu Node 25+), apoi commit `package.json` + `pnpm-lock.yaml` împreună. CI și Vercel folosesc `--frozen-lockfile`. pnpm refuză implicit versiunile publicate de mai puțin de o zi (protecție supply-chain): alege versiunea anterioară, nu adăuga excepții.
- Nicio dependență nu mai e pe `"latest"`: toate au versiuni `^x.y.z` în `package.json` și sunt fixate exact în `pnpm-lock.yaml`. Actualizările vin săptămânal prin Dependabot.
- **NU schimba modelul de business** — site-ul rămâne showcase + eMag redirect, NU adăuga ecommerce nativ decât dacă e cerut explicit.
- **Verifică DNS-ul atent înainte să schimbi orice** — există 3 servicii email care pot interfera. Vezi `CLAUDE.local.md`, secțiunea 3.
- **Pentru imagini în emailuri** (template-uri trimise prin MailerLite): folosește simpleicons.org sau alte CDN-uri trusted. Gmail blochează data URIs în `<img src>`, rasterizează SVG-urile externe blurat dacă n-au dimensiuni mari, și nu poate accesa fișiere de pe Preview branch (URL-uri absolute pointează la production).

## 12. Sanity CMS — produse & pachete promo (session: 30 mai 2026)

**Status**: ✅ Infrastructură implementată (build verde). Produsele + pachetele promo se gestionează în **Sanity**, NU mai în cod. Detalii operaționale în `SANITY.md`.

### Esențial

- **Proiect Sanity**: `Harti Romania`, Project ID `kqgfquqs`, dataset `production`, plan **Free** (100GB assets — fără limită practică).
- **Editorul** e Studio-ul găzduit standalone la **https://harti-romania.sanity.studio/** — **NU e integrat în site** (nu există rută `/studio` în Next, în ciuda unui plan inițial). Owner adaugă/editează acolo, **Publish** → apare pe site în ~60s (ISR `revalidate=60`).
- **NU folosim `next-sanity`** (nu e nevoie: site-ul doar citește). Site-ul **citește** datele cu `@sanity/client`; editorul e construit + deployat din `sanity.config.ts` cu CLI-ul `sanity` (`sanity deploy`), NU randat în aplicația Next.
- **Sanity 6** cere Node 22.12+ și React 19.2.2+ (avem Node 24, React 19.3).

### Arhitectură (design-ul rămâne NEATINS)

- `sanity/` — schema (`product`, `promoPackage`, obiecte `imageWithAlt`/`specification`/`storyContent`/`giftProduct`), `structure.ts` (meniu), config în `sanity.config.ts` + `sanity.cli.ts`.
- `lib/sanity/transform.ts` — **adapter**: documentul Sanity → exact forma `Product`/`PromoPackage` din `lib/types.ts`. Componentele de design nu se modifică.
- `lib/sanity/portable-text-to-html.ts` — „Povestea" (Portable Text cu stiluri `normal`+`subtitlu`+link) → HTML cu EXACT clasele Tailwind vechi; randare păstrată cu `dangerouslySetInnerHTML`. Fidelitate 100% + editare ușoară.
- `lib/sanity/{products,promo}.ts` — fetch server-only (`safeFetch` cu try/catch ca să nu pice build-ul pe dataset gol/eroare rețea).
- Pagini **server (fetch) + client (interactivitate)**: `produse/{harti,vederi,carti}/page.tsx` (+ `*-client.tsx`), `produse/[category]/[slug]`, `promo`, `promo/[slug]`.
- `lib/categories.ts` — cele 3 categorii rămân **statice** în cod (structurale). Homepage + `/produse` doar swap de import.
- `next.config.mjs` — adăugat `cdn.sanity.io` la remotePatterns.

### Migrare — FĂCUTĂ (30 mai 2026)

- 18 produse + 3 promo + 103 imagini migrate în Sanity, fără erori. 5 caractere stricate (U+FFFD) pre-existente din textele originale au fost corectate direct în Sanity.
- Scripturile one-time (`scripts/migrate-to-sanity.ts`, `scripts/fix-story-typos.ts`) + fișierele vechi de date + dependențele `tsx`/`jsdom` au fost ȘTERSE după migrare (rămân în istoricul git dacă e nevoie vreodată).

### Studio

- Live la **https://harti-romania.sanity.studio/** (hostname + appId în `sanity.cli.ts`).
- **Comanda de deploy**: rulează `node_modules/.bin/sanity deploy` (sau `npx sanity deploy`) din rădăcina proiectului. ⚠️ `pnpm studio:deploy` prin corepack EȘUEAZĂ cu `'pnpm' is not recognized` (verificarea internă de deps a pnpm nu se găsește pe sine în PATH) — apelează binarul `sanity` direct ca să ocolești wrapper-ul pnpm. Necesită login Sanity pe mașină (`sanity login`; contul e notat în `CLAUDE.local.md`).
- ⚠️ Deploy DOAR cu auto-updates dezactivat (în `sanity.cli.ts`: `deployment.autoUpdates: false`) — altfel pică cu "Unzip: unexpected end of file".
- Deploy-ul schimbă DOAR editorul (formular/schema), nu atinge produsele existente și nu afectează site-ul public. Reversibil (re-deploy schema veche).
- Schema se schimbă editând `sanity/` → re-deploy cu `sanity deploy`.

### TODO owner (opțional)

- Setează în Vercel `NEXT_PUBLIC_SANITY_PROJECT_ID=kqgfquqs` și `NEXT_PUBLIC_SANITY_DATASET=production` (au fallback în cod, deci opțional dar recomandat).
