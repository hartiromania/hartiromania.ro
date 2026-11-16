import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "../env";

// Client de CITIRE pentru date publice (produse + pachete promo).
// useCdn: true => răspunsuri rapide din CDN-ul Sanity, perfect pentru ISR.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});
