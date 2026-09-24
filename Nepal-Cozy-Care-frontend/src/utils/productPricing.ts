/** Price is the actual selling price used by the cart and checkout. */
export function getProductPricing(price: number | string, discount: number | string = 0) {
  const sellingPrice = Math.max(0, Number(price) || 0);
  const value = Number(discount);
  const discountPercent = Number.isFinite(value) && value > 0 && value < 100 ? value : 0;
  const originalPrice = discountPercent > 0
    ? Math.round(sellingPrice / (1 - discountPercent / 100) * 100) / 100
    : sellingPrice;
  return { sellingPrice, discountPercent, originalPrice };
}
