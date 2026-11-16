import type { StructureResolver } from "sanity/structure";

// Meniul din stânga al editorului: Produse (grupate pe categorii) + Pachete Promo.
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Conținut")
    .items([
      S.listItem()
        .title("Produse")
        .child(
          S.list()
            .title("Produse")
            .items([
              S.listItem()
                .title("Toate produsele")
                .child(S.documentTypeList("product").title("Toate produsele")),
              S.listItem()
                .title("Hărți")
                .child(
                  S.documentList()
                    .title("Hărți")
                    .filter('_type == "product" && category == "harti"')
                    .defaultOrdering([{ field: "sortOrder", direction: "asc" }]),
                ),
              S.listItem()
                .title("Vederi")
                .child(
                  S.documentList()
                    .title("Vederi")
                    .filter('_type == "product" && category == "vederi"'),
                ),
              S.listItem()
                .title("Cărți")
                .child(
                  S.documentList()
                    .title("Cărți")
                    .filter('_type == "product" && category == "carti"'),
                ),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("Pachete Promo")
        .child(S.documentTypeList("promoPackage").title("Pachete Promo")),
    ]);
