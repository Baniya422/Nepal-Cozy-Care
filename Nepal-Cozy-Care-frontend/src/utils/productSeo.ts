import { absoluteSiteUrl, SITE_NAME } from "./siteUrl";
import { resolveImageUrl } from "./imageUrl";

interface SeoProduct {
  id: number; name: string; price: number; stock: number;
  category?: string; description?: string; image?: string; size?: string;
  scientific_name?: string; light?: string; water?: string;
  avg_rating?: number; review_count?: number;
}
export const isPlantProduct = (category = "") => !/pot|planter|tool|soil|fertilizer|accessor|seed|kit/i.test(category);
export const productCategory = (category = "") => /seed/i.test(category)
  ? { name: "Seeds", path: "/seeds" }
  : isPlantProduct(category) ? { name: "Plants", path: "/plants" } : { name: "Pots & accessories", path: "/pots" };
export const plainDescription = (text: string) => text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
export function productDescription(product: SeoProduct): string {
  if (product.description?.trim()) return plainDescription(product.description);
  return [
    `${product.name}${product.category ? ` — ${product.category}` : ""}.`,
    product.size && `Size: ${product.size}.`,
    product.light && `Light: ${product.light}.`,
    product.water && `Water: ${product.water}.`,
  ].filter(Boolean).join(" ");
}
export function productStructuredData(product: SeoProduct) {
  const url = absoluteSiteUrl(`/plants/${product.id}`);
  const category = productCategory(product.category);
  return [
    {
      "@context": "https://schema.org", "@type": "Product", "@id": `${url}#product`,
      name: product.name, url, sku: String(product.id),
      description: productDescription(product), category: product.category,
      ...(product.image ? { image: [absoluteSiteUrl(resolveImageUrl(product.image))] } : {}),
      ...(product.size ? { size: product.size } : {}),
      additionalProperty: [["Botanical name", product.scientific_name], ["Light", product.light], ["Water", product.water]]
        .filter(([, value]) => value).map(([name, value]) => ({ "@type": "PropertyValue", name, value })),
      offers: {
        "@type": "Offer", url, priceCurrency: "NPR", price: product.price.toFixed(2),
        availability: `https://schema.org/${product.stock > 0 ? "InStock" : "OutOfStock"}`,
        seller: { "@type": "Organization", name: SITE_NAME },
      },
      ...(Number(product.review_count) > 0 && Number(product.avg_rating) >= 1 && Number(product.avg_rating) <= 5
        ? { aggregateRating: { "@type": "AggregateRating", ratingValue: Number(product.avg_rating), reviewCount: Number(product.review_count), bestRating: 5, worstRating: 1 } } : {}),
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteSiteUrl("/") },
        { "@type": "ListItem", position: 2, name: category.name, item: absoluteSiteUrl(category.path) },
        { "@type": "ListItem", position: 3, name: product.name, item: url },
      ],
    },
  ];
}
