# Hărți România

Site-ul [hartiromania.ro](https://www.hartiromania.ro): hărți istorice românești, cărți și vederi de colecție. Site de prezentare și catalog; comenzile se plasează pe eMAG, prin butonul „Comandă” de pe fiecare produs.

## Tehnologie

| Zonă                     | Ce folosim                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------- |
| Framework                | Next.js (App Router), React, TypeScript                                                 |
| Stil                     | Tailwind CSS, componente shadcn/ui                                                      |
| Produse și pachete promo | Sanity CMS (editor: [harti-romania.sanity.studio](https://harti-romania.sanity.studio)) |
| Blog                     | Zenblog (API REST)                                                                      |
| Newsletter               | MailerLite (abonați) + Resend (trimitere), Upstash Redis, Vercel Cron                   |
| Găzduire                 | Vercel (deploy automat din `main`, Preview pentru fiecare PR)                           |

## Rulare locală

Necesită Node.js 24+ și pnpm (versiunea e fixată în `package.json`, câmpul `packageManager`).

```bash
pnpm install
pnpm dev
```

Variabilele de mediu sunt în Vercel; pentru local se pun în `.env.local` (nu se publică în repo).

| Comandă              | Ce face                                         |
| -------------------- | ----------------------------------------------- |
| `pnpm dev`           | serverul de dezvoltare pe http://localhost:3000 |
| `pnpm build`         | build de producție, cu verificarea tipurilor    |
| `pnpm lint`          | ESLint                                          |
| `pnpm typecheck`     | TypeScript, fără build                          |
| `pnpm format`        | formatează codul cu Prettier                    |
| `pnpm studio:deploy` | publică editorul Sanity (vezi `SANITY.md`)      |

## Cum se lucrează

1. Fiecare schimbare are branch-ul ei, pornit din `main` actualizat: `feat/…`, `fix/…`, `chore/…`.
2. Înainte de PR trec local `pnpm lint`, `pnpm typecheck` și `pnpm build`, iar paginile atinse sunt verificate în browser.
3. PR-ul are titlu [Conventional Commits](https://www.conventionalcommits.org) cu literă mică (`feat: …`, `fix(seo): …`); la squash merge, titlul devine commit-ul de pe `main`.
4. GitHub Actions rulează aceleași verificări pe fiecare PR.
5. După verificare, PR-ul se unește în `main` (squash) și Vercel publică în producție.
6. release-please ține la zi `CHANGELOG.md` și versiunea, din titlurile PR-urilor.

Dependabot propune săptămânal actualizările de pachete.

## Documentație

- `CLAUDE.md`: contextul proiectului și convențiile de lucru
- `SANITY.md`: produsele și pachetele promo în Sanity

## Drepturi

Codul sursă e public pentru transparență, dar **nu are licență open-source**: toate drepturile sunt rezervate. Textele, hărțile, fotografiile, logo-ul și celelalte materiale ale site-ului sunt © Hărți România și nu pot fi copiate sau refolosite fără acord scris.
