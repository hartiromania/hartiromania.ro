import { pageMetadata } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import HomePage from "./home-client";

export const metadata = pageMetadata({
  title: "Hărți istorice, vederi și cărți de colecție",
  absoluteTitle: `${SITE_NAME} | Hărți istorice, vederi și cărți de colecție`,
  description: SITE_DESCRIPTION,
  path: "/",
});

export default function Page() {
  return <HomePage />;
}
