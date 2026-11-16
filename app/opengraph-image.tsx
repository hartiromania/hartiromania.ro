import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_NAME } from "@/lib/site";

// Cardul de share al site-ului (Facebook, WhatsApp, Telegram, X, LinkedIn) pentru paginile
// fără poză proprie. Produsele și articolele își declară propria fotografie în metadate.
// E tipografic, fără fotografie, ca PNG-ul să rămână mic (WhatsApp ignoră imaginile mari).

export const alt = `${SITE_NAME}: hărți istorice, vederi și cărți de colecție`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#3d2914";
const INK_SOFT = "#5d4037";
const PARCHMENT = "#f5f1e8";
const ACCENT = "#d2691e";

// Fonturile site-ului (licență OFL) și logo-ul. Playfair vine în subseturile latin +
// latin-ext (@fontsource); Crimson e fișierul complet, ca diacriticele să nu fie luate
// din alt font. Citite o singură dată; căile sunt scrise explicit ca bundler-ul să includă
// doar aceste fișiere.
const assets = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/playfair-display-latin-700-normal.woff")),
  readFile(join(process.cwd(), "assets/fonts/playfair-display-latin-ext-700-normal.woff")),
  readFile(join(process.cwd(), "assets/fonts/CrimsonText-Regular.ttf")),
  readFile(join(process.cwd(), "public/logo-principal-no-bg-cropped.png")),
]);

export default async function OpengraphImage() {
  const [playfairLatin, playfairExt, crimson, logo] = await assets;
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        padding: 28,
        backgroundColor: PARCHMENT,
        backgroundImage:
          "radial-gradient(circle at 30% 40%, #faf7f2 0%, #f5f1e8 55%, #ece3d1 100%)",
      }}
    >
      {/* Rama dublă, semnătura secțiunilor importante de pe site. */}
      <div style={{ display: "flex", flex: 1, border: `4px solid ${ACCENT}`, padding: 8 }}>
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            border: `1.5px solid ${ACCENT}`,
            padding: "0 64px",
            gap: 48,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div
              style={{
                fontFamily: "Playfair Display",
                fontSize: 96,
                lineHeight: 1.02,
                letterSpacing: "-0.01em",
                color: INK,
              }}
            >
              {SITE_NAME}
            </div>
            <div
              style={{ width: 132, height: 5, backgroundColor: ACCENT, margin: "30px 0 26px" }}
            />
            <div
              style={{
                fontFamily: "Crimson Text",
                fontSize: 44,
                lineHeight: 1.2,
                color: INK_SOFT,
                maxWidth: 480,
              }}
            >
              Hărți istorice, vederi și cărți de colecție
            </div>
            <div
              style={{
                fontFamily: "Crimson Text",
                fontSize: 30,
                color: INK_SOFT,
                marginTop: 40,
              }}
            >
              hartiromania.ro
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse randează doar <img> */}
          <img src={logoSrc} width={420} height={273} alt="" style={{ objectFit: "contain" }} />
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Playfair Display", data: playfairLatin, weight: 700, style: "normal" },
        { name: "Playfair Display", data: playfairExt, weight: 700, style: "normal" },
        { name: "Crimson Text", data: crimson, weight: 400, style: "normal" },
      ],
    },
  );
}
