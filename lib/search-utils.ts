export function removeDiacritics(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function searchProducts<
  T extends { title: string; shortTitle?: string; description?: string; storyContent?: string },
>(products: T[], query: string, searchMode: "title" | "advanced" = "title"): T[] {
  // Trim whitespace from query
  const trimmedQuery = query.trim();

  // If query is empty after trimming, return all products
  if (!trimmedQuery) {
    return products;
  }

  const normalizedQuery = removeDiacritics(trimmedQuery);

  return products.filter((product) => {
    const normalizedTitle = removeDiacritics(product.title);
    const normalizedShortTitle = product.shortTitle ? removeDiacritics(product.shortTitle) : "";

    // Title-only search: search in both title and shortTitle
    if (searchMode === "title") {
      return (
        normalizedTitle.includes(normalizedQuery) || normalizedShortTitle.includes(normalizedQuery)
      );
    }

    // Advanced search: search in title, shortTitle, description, and story
    const normalizedDescription = product.description ? removeDiacritics(product.description) : "";
    const normalizedStory = product.storyContent ? removeDiacritics(product.storyContent) : "";

    return (
      normalizedTitle.includes(normalizedQuery) ||
      normalizedShortTitle.includes(normalizedQuery) ||
      normalizedDescription.includes(normalizedQuery) ||
      normalizedStory.includes(normalizedQuery)
    );
  });
}

export function sortProductsAlphabetically<T extends { title: string }>(products: T[]): T[] {
  return [...products].sort((a, b) => {
    const titleA = removeDiacritics(a.title);
    const titleB = removeDiacritics(b.title);
    return titleA.localeCompare(titleB, "ro");
  });
}

export function sortProductsByUploadOrder<T extends { sortOrder?: number }>(products: T[]): T[] {
  return [...products].sort((a, b) => {
    const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
}
