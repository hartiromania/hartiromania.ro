# Changelog

Versiunile urmează [Semantic Versioning](https://semver.org/lang/ro/): o funcționalitate nouă (`feat`) crește a doua cifră, o corectură (`fix`) pe a treia. Începând cu 1.8.4, fișierul e actualizat automat de release-please din titlurile PR-urilor.

## [1.12.0](https://github.com/hartiromania/hartiromania.ro/compare/v1.11.0...v1.12.0) (2026-11-26)


### Funcționalități

* google analytics with cookie consent and privacy pages ([#14](https://github.com/hartiromania/hartiromania.ro/issues/14)) ([a22d9d6](https://github.com/hartiromania/hartiromania.ro/commit/a22d9d6c45ebc1728350eb74fee23fd0c22d8db6))

## [1.11.0](https://github.com/hartiromania/hartiromania.ro/compare/v1.10.1...v1.11.0) (2026-11-18)


### Funcționalități

* **admin:** admin panel at admin.hartiromania.ro ([#10](https://github.com/hartiromania/hartiromania.ro/issues/10)) ([5bcbab7](https://github.com/hartiromania/hartiromania.ro/commit/5bcbab725f99f8cf5133f4b5969c780159636a71))

## [1.10.1](https://github.com/hartiromania/hartiromania.ro/compare/v1.10.0...v1.10.1) (2026-11-18)


### Corecturi

* **contact:** give test messages a visible spam score ([#9](https://github.com/hartiromania/hartiromania.ro/issues/9)) ([574461e](https://github.com/hartiromania/hartiromania.ro/commit/574461e10b39f34a163430cabef4a64c8a38694d))

## [1.10.0](https://github.com/hartiromania/hartiromania.ro/compare/v1.9.3...v1.10.0) (2026-11-18)


### Funcționalități

* **contact:** spam detection and new notification email ([#7](https://github.com/hartiromania/hartiromania.ro/issues/7)) ([4720dcc](https://github.com/hartiromania/hartiromania.ro/commit/4720dcc7c759ddc63f2d1c8a1af8b4c37f8964b5))

## 1.9.3 (2026-11-16)


### Corecturi

* **deps:** patched versions of vulnerable transitive dependencies

## 1.9.2 (2026-11-16)


### Corecturi

* **seo:** return a real 404 for missing blog posts, categories, authors and tags

## 1.9.1 (2026-11-13)


### Corecturi

* **a11y:** wcag aa contrast, heading order, readable line length and header overlap

## 1.9.0 (2026-11-12)


### Funcționalități

* **seo:** metadata, structured data, sitemap, robots, llms.txt and share cards

## 1.8.4 (2026-11-12)

### Corecturi

- erorile TypeScript sunt verificate la build; corectate tipurile pentru documentele din Sanity și pentru pachetele promo
- popup-ul de newsletter și formularul de contact nu mai depind de stări redundante, respectiv de cheia Resend la build
- ghilimele românești („…”) în textele paginilor Acasă, Despre și Contact

## 1.8.3 (2026-06-19)

### Corecturi

- lupa de zoom funcționează din nou pe imaginile produselor din Sanity

## 1.8.2 (2026-06-04)

### Corecturi

- miniaturi clare la baza caruselului de produs

## 1.8.1 (2026-05-30)

### Corecturi

- prețul și butonul de comandă la baza caruselului; descrierea și specificațiile afișate independent

## 1.8.0 (2026-05-30)

### Funcționalități

- pagina de produs în layout 2×2 pe desktop

## 1.7.0 (2026-05-30)

### Funcționalități

- rânduri prestabilite la Specificații pentru un produs nou în Sanity

## 1.6.0 (2026-05-30)

### Funcționalități

- produsele și pachetele promo se gestionează în Sanity CMS

## 1.5.2 (2026-05-28)

### Corecturi

- abonarea la newsletter verifică apartenența la grup, nu doar existența adresei

## 1.5.1 (2026-05-28)

### Corecturi

- dezabonarea scoate adresa din grupul newsletter-ului

## 1.5.0 (2026-05-28)

### Funcționalități

- emailurile newsletter-ului pleacă prin Resend; MailerLite păstrează lista de abonați

## 1.4.0 (2026-05-27)

### Funcționalități

- newsletter automat la fiecare articol nou de blog (Vercel Cron)

## 1.3.1 (2026-05-24)

### Corecturi

- popup-ul de newsletter: titlu nou, fără declanșare la scroll, reapare după 15 zile

## 1.3.0 (2026-05-18)

### Funcționalități

- flux RSS pentru blog

## 1.2.0 (2026-05-14)

### Funcționalități

- abonare la newsletter (MailerLite) din footer, popup și articolele de blog

## 1.1.0 (2026-03-04)

### Funcționalități

- sortarea produselor după noutate și bare laterale fixe pentru navigare în catalog

## 1.0.1 (2025-12-09)

### Corecturi

- actualizare de securitate pentru React Server Components

## 1.0.0

Lansarea site-ului: catalogul de hărți, cărți și vederi, pachetele promo, blogul și paginile Despre, Contact și Video.
