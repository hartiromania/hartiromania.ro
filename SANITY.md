# Sanity CMS — ghid hartiromania.ro

Produsele și pachetele promo NU se mai scriu în cod. Se gestionează în **Sanity Studio**.

Studio-ul e găzduit gratuit de Sanity (NU embed în site — vezi de ce mai jos), la:
**https://harti-romania.sanity.studio/** ✅ (deja deployat).

## 1. Date proiect

|            |                                          |
| ---------- | ---------------------------------------- |
| Project ID | `kqgfquqs`                               |
| Dataset    | `production`                             |
| Studio     | **https://harti-romania.sanity.studio/** |
| App ID     | `p9dbjx729jbwaezuw9loh7no`               |

## 2. De ce studio separat, nu embed la /studio?

Sanity 5.28 are nevoie de un API din React 19.2 (`useEffectEvent`). Next.js 15.3.8 (versiunea
pinned a site-ului) își bundle-uiește intern o versiune mai veche de React care NU are acest export,
deci embed-ul ar cere upgrade de Next.js (versiune majoră, risc pe tot site-ul). Studio-ul găzduit
separat e gratuit, recomandat de Sanity, păstrează site-ul public neatins și ușor, și se poate muta
embed mai târziu dacă urcăm Next.js.

## 3. Setup studio (o singură dată)

Din rădăcina proiectului, local:

```
npx sanity login                    # te autentifici în browser
node_modules/.bin/sanity deploy     # hostname-ul e deja setat în sanity.cli.ts
```

Rezultă editorul la `https://harti-romania.sanity.studio`. De fiecare dată când schimbăm câmpurile
(fișierele din `sanity/`), se re-rulează `node_modules/.bin/sanity deploy` ca să se actualizeze.

Pentru editare locală rapidă (fără deploy): `pnpm studio:dev` → `http://localhost:3333`.

## 4. Variabile de mediu

### În Vercel (Settings → Environment Variables) — Production + Preview

Publice (nu secrete), opționale (au fallback în `sanity/env.ts`), dar recomandate explicit:

```
NEXT_PUBLIC_SANITY_PROJECT_ID = kqgfquqs
NEXT_PUBLIC_SANITY_DATASET    = production
```

### Doar local, pentru migrare (NU în git, NU în chat)

`.env.local` (deja ignorat de git):

```
SANITY_API_WRITE_TOKEN = <token cu drept de scriere>
```

Token-ul: **sanity.io/manage → proiect → API → Tokens**, rol **Editor**.

## 5. Cum adaugi un produs nou

1. Intră în Studio (adresa de mai sus) și loghează-te.
2. Meniu stânga → **Produse** → categoria → **+** (document nou).
3. Completează câmpurile (titlu, slug auto din titlu, categorie, preț, descriere, specificații,
   carusel imagini drag & drop, link comandă eMag, povestea etc.).
4. **Publish**. Produsul apare pe site în ~1 minut (revalidare ISR la 60s).

### „Povestea hărții"

Scrii ca într-un editor de text. Pentru titlurile îngroșate din mijloc, alege stilul
**„Subtitlu (bold, mare)"**. Pentru linkuri, selectezi textul și apeși butonul de link. Iese pe site
cu exact aceleași stilizări ca înainte.

### Prețul

Pui doar cifra (ex: `49.61`). Pe site apare automat „49,61 RON". Pentru cazuri speciale, completezi
„Etichetă preț personalizată".

## 6. Migrarea inițială — FĂCUTĂ ✅ (30 mai 2026)

Cele 18 produse + 3 pachete promo + 103 imagini au fost migrate în Sanity, fără erori.
Scripturile one-time (`scripts/migrate-to-sanity.ts`, `scripts/fix-story-typos.ts`), fișierele
vechi `lib/products-data.tsx` / `lib/promo-data.tsx` și dependențele `tsx`/`jsdom` au fost ȘTERSE
după migrare (rămân în istoricul git dacă e nevoie vreodată).

## 7. Arhitectură (pe scurt)

- `sanity/` — schema (produs/promo) + structură meniu; `sanity.config.ts` / `sanity.cli.ts`.
- `lib/sanity/` — fetch din Sanity + „traducătorul" care transformă documentul în exact forma
  `Product`/`PromoPackage` folosită de componentele de design (designul rămâne neatins).
- `lib/sanity/portable-text-to-html.ts` — redă „Povestea" cu aceleași clase ca înainte.
- Paginile = server-components (aduc datele) + client-components (carusel, căutare, modale).
- `lib/categories.ts` — cele 3 categorii (rămân în cod, structurale).
- `scripts/migrate-to-sanity.ts` — migrarea unică.

Imaginile se stochează în CDN-ul Sanity (`cdn.sanity.io`, în `next.config.mjs`).
