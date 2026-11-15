export type ProPaywallPlan = {
  productId: string;
  price: string;
  period: "month";
  mode: "native" | "test";
};

export function selectProMonthlyPackage(offerings: any, test: boolean) {
  const monthly = offerings?.current?.monthly;
  const expectedProduct = test ? "monthly" : "200";
  if (offerings?.current?.identifier !== "200" || !monthly ||
    monthly.product?.identifier !== expectedProduct || monthly.packageType !== "MONTHLY" ||
    typeof monthly.product.priceString !== "string" || !monthly.product.priceString.trim()) {
    throw new Error("Seller Scan Pro’s monthly plan is unavailable. Please retry.");
  }
  return monthly;
}
