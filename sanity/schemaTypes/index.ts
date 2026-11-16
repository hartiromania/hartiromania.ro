import type { SchemaTypeDefinition } from "sanity";

import { imageWithAlt } from "./objects/imageWithAlt";
import { specification } from "./objects/specification";
import { storyContent } from "./objects/storyContent";
import { giftProduct } from "./objects/giftProduct";
import { product } from "./documents/product";
import { promoPackage } from "./documents/promoPackage";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documente
  product,
  promoPackage,
  // Obiecte reutilizabile
  imageWithAlt,
  specification,
  storyContent,
  giftProduct,
];
