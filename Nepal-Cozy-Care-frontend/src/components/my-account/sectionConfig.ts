import {
  Heart,
  LayoutDashboard,
  MapPin,
  Package,
  Settings,
  Shield,
  User,
} from "lucide-react";
import type { SectionConfig } from "./types";

export const accountSections: SectionConfig[] = [
  {
    key: "overview",
    label: "Overview",
    description: "See the parts of your account that need attention first.",
    icon: LayoutDashboard,
  },
  {
    key: "profile",
    label: "Profile",
    description: "Keep your contact details accurate for orders and support.",
    icon: User,
  },
  {
    key: "orders",
    label: "Orders",
    description: "Review recent purchases, expand details, and cancel pending orders.",
    icon: Package,
  },
  {
    key: "addresses",
    label: "Addresses",
    description: "Save common delivery locations so checkout is faster next time.",
    icon: MapPin,
  },
  {
    key: "wishlist",
    label: "Wishlist",
    description: "Manage plants you want to revisit later.",
    icon: Heart,
  },
  {
    key: "security",
    label: "Security",
    description: "Change your password and control active sessions.",
    icon: Shield,
  },
  {
    key: "preferences",
    label: "Preferences",
    description: "Choose how often you want updates and care reminders.",
    icon: Settings,
  },
];
