import { useLocation } from "react-router-dom";
import SEO from "./SEO";

const pages: Record<string, [string, string]> = {
  "/blogs": ["Plant Care Guides for Nepal Homes", "Read practical guides on watering, light, soil and choosing plants for your home in Nepal."],
  "/about": ["About Our Plant Shop", "Learn about Nepal Cozy Care and find plants, pots and practical growing advice for your home."],
  "/mission": ["Our Approach to Plant Care", "Learn about Nepal Cozy Care's approach to helping customers choose and care for plants."],
  "/contact": ["Contact Our Plant Shop", "Ask about a plant, check product details, or get help with an order and delivery from Nepal Cozy Care."],
  "/shipping": ["Plant Delivery Information", "Check delivery areas, charges and order information before buying plants online from Nepal Cozy Care."],
  "/help-center": ["Plant Orders & Care Help", "Find answers about buying plants, delivery, orders and looking after your plants."],
  "/popular-items": ["Popular Plants & Pots in Nepal", "Browse popular plants and pots. Compare current prices and availability at Nepal Cozy Care."],
  "/best-sellers": ["Best-Selling Plants in Nepal", "Shop best-selling plants and compare prices, availability and care needs before ordering."],
  "/plant-finder": ["Find Plants for Your Home", "Find plants that suit your room, available light and care routine. Compare products and prices in Nepal."],
  "/plant-health-checker": ["Plant Health & Care Guidance", "Explore possible causes of plant problems and find practical care guidance."],
  "/room-designer": ["Plan Plants for Your Room", "Explore plant placement in your room before choosing plants for your space."],
};

export default function RouteSEO() {
  const { pathname } = useLocation();
  // These pages own their metadata, including loading/error states.
  if (["/", "/plants", "/pots", "/seeds", "/care-tips"].includes(pathname)
    || /^\/(plants|blogs|care-tips)\/[^/]+$/.test(pathname)) return null;
  const page = pages[pathname];
  return <SEO title={page?.[0] ?? "Account & Store Tools"} description={page?.[1] ?? "Manage your Nepal Cozy Care account."}
    canonicalPath={pathname} noindex={!page} />;
}
