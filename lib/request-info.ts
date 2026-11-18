// Who sent a request: real IP, approximate location and device, from the headers Vercel
// adds (it overwrites them itself, so a visitor cannot fake them). Locally they are missing.

// Romanian counties by their ISO 3166-2 code (what Vercel sends as the region).
const RO_COUNTIES: Record<string, string> = {
  AB: "Alba",
  AR: "Arad",
  AG: "Argeș",
  BC: "Bacău",
  BH: "Bihor",
  BN: "Bistrița-Năsăud",
  BT: "Botoșani",
  BV: "Brașov",
  BR: "Brăila",
  B: "București",
  BZ: "Buzău",
  CS: "Caraș-Severin",
  CL: "Călărași",
  CJ: "Cluj",
  CT: "Constanța",
  CV: "Covasna",
  DB: "Dâmbovița",
  DJ: "Dolj",
  GL: "Galați",
  GR: "Giurgiu",
  GJ: "Gorj",
  HR: "Harghita",
  HD: "Hunedoara",
  IL: "Ialomița",
  IS: "Iași",
  IF: "Ilfov",
  MM: "Maramureș",
  MH: "Mehedinți",
  MS: "Mureș",
  NT: "Neamț",
  OT: "Olt",
  PH: "Prahova",
  SM: "Satu Mare",
  SJ: "Sălaj",
  SB: "Sibiu",
  SV: "Suceava",
  TR: "Teleorman",
  TM: "Timiș",
  TL: "Tulcea",
  VS: "Vaslui",
  VL: "Vâlcea",
  VN: "Vrancea",
};

const COUNTRY_NAMES = new Intl.DisplayNames(["ro"], { type: "region" });

// The visitor's real IP and its location, as resolved by Vercel's network. Vercel
// overwrites these headers itself, so a visitor cannot fake them. Locally they are missing.
export function visitorOf(headers: Headers) {
  const header = (name: string) => {
    const value = headers.get(name);
    return value ? decodeURIComponent(value) : "";
  };
  const ip = header("x-real-ip") || header("x-forwarded-for").split(",")[0].trim() || undefined;
  const country = header("x-vercel-ip-country");
  const region = header("x-vercel-ip-country-region");
  const county = country === "RO" ? RO_COUNTIES[region] : region;
  const parts = [
    header("x-vercel-ip-city"),
    county && country === "RO" && county !== "București" ? `jud. ${county}` : county,
    country ? COUNTRY_NAMES.of(country) : "",
  ].filter((part, i, all) => part && all.indexOf(part) === i);
  const lat = header("x-vercel-ip-latitude");
  const lon = header("x-vercel-ip-longitude");
  return {
    ip,
    location: parts.length ? parts.join(", ") : "necunoscută",
    mapUrl: lat && lon ? `https://www.google.com/maps?q=${lat},${lon}` : undefined,
  };
}

export function deviceOf(userAgent: string | null): string {
  if (!userAgent) return "necunoscut";
  const os = /iPhone|iPad/.test(userAgent)
    ? "iPhone/iPad"
    : /Android/.test(userAgent)
      ? "Android"
      : /Windows/.test(userAgent)
        ? "Windows"
        : /Mac OS X/.test(userAgent)
          ? "Mac"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "alt sistem";
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Chrome\//.test(userAgent)
          ? "Chrome"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : "alt browser";
  const mobile = /Mobi|Android|iPhone/.test(userAgent) ? "telefon" : "calculator";
  return `${browser} pe ${os} (${mobile})`;
}
