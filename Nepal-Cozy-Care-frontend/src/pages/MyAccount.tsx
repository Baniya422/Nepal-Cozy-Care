import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Heart,
  LayoutDashboard,
  Leaf,
  LogOut,
  MapPin,
  Package,
  Settings,
  Shield,
  ShoppingBag,
  Trash2,
  Truck,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Layout from "../components/layout/Layout";
import "../styles/my-account.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const PROFILE_KEY = "account.profile";
const ADDRESSES_KEY = "account.addresses";
const PREFERENCES_KEY = "account.preferences";
const PASSWORD_CHANGED_KEY = "account.passwordChangedAt";

type AccountSection =
  | "overview"
  | "profile"
  | "orders"
  | "addresses"
  | "wishlist"
  | "security"
  | "preferences";

type AccountUser = {
  id: number;
  name: string;
  email: string;
  role?: string;
  created_at?: string;
};

type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  line_total?: number;
  plant?: {
    id: number;
    name: string;
    image?: string | null;
  } | null;
};

type AccountOrder = {
  id: number;
  status: string;
  payment_status?: string;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  shipping_name?: string | null;
  shipping_phone?: string | null;
  shipping_address?: string | null;
  tracking_number?: string | null;
  courier_name?: string | null;
  created_at: string;
  items: OrderItem[];
};

type WishlistEntry = {
  id: number;
  plant_id: number;
  plant?: {
    id: number;
    name: string;
    price: number;
    image?: string | null;
    room?: string | null;
    size?: string | null;
  } | null;
};

type AddressEntry = {
  id: string;
  label: string;
  address: string;
  note: string;
  isDefault: boolean;
};

type Preferences = {
  emailUpdates: boolean;
  smsAlerts: boolean;
  careReminderDays: number;
};

type ProfileExtras = {
  phone: string;
};

type Notice = {
  tone: "success" | "error";
  text: string;
};

type SectionConfig = {
  key: AccountSection;
  label: string;
  description: string;
  icon: LucideIcon;
};

const accountSections: SectionConfig[] = [
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

function readStoredUser(): AccountUser | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw) as AccountUser;
  } catch {
    return null;
  }
}

function readProfileExtras(): ProfileExtras {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return { phone: "" };
    const parsed = JSON.parse(raw) as Partial<ProfileExtras>;
    return {
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
    };
  } catch {
    return { phone: "" };
  }
}

function readAddresses(): AddressEntry[] {
  try {
    const raw = localStorage.getItem(ADDRESSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AddressEntry[]) : [];
  } catch {
    return [];
  }
}

function readPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) {
      return {
        emailUpdates: true,
        smsAlerts: false,
        careReminderDays: 3,
      };
    }

    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      emailUpdates: parsed.emailUpdates ?? true,
      smsAlerts: parsed.smsAlerts ?? false,
      careReminderDays: Number(parsed.careReminderDays ?? 3),
    };
  } catch {
    return {
      emailUpdates: true,
      smsAlerts: false,
      careReminderDays: 3,
    };
  }
}

function persistProfileExtras(nextProfile: ProfileExtras) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
}

function persistAddresses(nextAddresses: AddressEntry[]) {
  localStorage.setItem(ADDRESSES_KEY, JSON.stringify(nextAddresses));
}

function persistPreferences(nextPreferences: Preferences) {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(nextPreferences));
}

function extractErrorMessage(data: any, fallback: string) {
  const validationMessages = Object.values(data?.errors ?? {}).flat();
  const firstValidationMessage = validationMessages.find(
    (message): message is string => typeof message === "string"
  );

  return data?.message || firstValidationMessage || fallback;
}

function buildImageUrl(image?: string | null) {
  return image ? `${API}/storage/${image}` : "/images/plant-placeholder.jpg";
}

function formatCurrency(amount?: number | null) {
  return `Rs. ${Number(amount ?? 0).toLocaleString("en-NP", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "Not available";

  return new Date(dateString).toLocaleDateString("en-NP", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateString?: string | null) {
  if (!dateString) return "Not available";

  return new Date(dateString).toLocaleString("en-NP", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOrderStatusLabel(status: string) {
  switch (status) {
    case "out_for_delivery":
      return "Out for Delivery";
    case "in_transit":
      return "In Transit";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).replaceAll("_", " ");
  }
}

function getOrderStatusTone(status: string) {
  switch (status) {
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
    case "out_for_delivery":
    case "shipped":
    case "packed":
      return "active";
    default:
      return "pending";
  }
}

function deriveAddressesFromOrders(orders: AccountOrder[]) {
  const seen = new Set<string>();
  const derived: AddressEntry[] = [];

  for (const order of orders) {
    const address = order.shipping_address?.trim();
    if (!address) continue;

    const lookupKey = address.toLowerCase();
    if (seen.has(lookupKey)) continue;

    seen.add(lookupKey);
    derived.push({
      id: `order-${order.id}`,
      label: derived.length === 0 ? "Primary" : `Delivery Spot ${derived.length + 1}`,
      address,
      note: [order.shipping_name, order.shipping_phone].filter(Boolean).join(" | "),
      isDefault: derived.length === 0,
    });
  }

  return derived;
}

export default function MyAccount() {
  const navigate = useNavigate();
  const storedUser = readStoredUser();
  const storedProfileExtras = readProfileExtras();

  const [sessionToken, setSessionToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<AccountUser | null>(storedUser);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [wishlist, setWishlist] = useState<WishlistEntry[]>([]);
  const [addresses, setAddresses] = useState<AddressEntry[]>(() => readAddresses());
  const [preferences, setPreferences] = useState<Preferences>(() => readPreferences());
  const [activeSection, setActiveSection] = useState<AccountSection>("overview");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [loadingNotice, setLoadingNotice] = useState<Notice | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: storedUser?.name ?? "",
    email: storedUser?.email ?? "",
    phone: storedProfileExtras.phone,
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState<Notice | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [securityNotice, setSecurityNotice] = useState<Notice | null>(null);
  const [passwordChangedAt, setPasswordChangedAt] = useState<string | null>(() =>
    localStorage.getItem(PASSWORD_CHANGED_KEY)
  );

  const [addressForm, setAddressForm] = useState({
    label: "",
    address: "",
    note: "",
  });
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressNotice, setAddressNotice] = useState<Notice | null>(null);

  const [preferencesNotice, setPreferencesNotice] = useState<Notice | null>(null);
  const [cancelingOrderId, setCancelingOrderId] = useState<number | null>(null);
  const [wishlistBusyPlantId, setWishlistBusyPlantId] = useState<number | null>(null);

  const selectedSection =
    accountSections.find((section) => section.key === activeSection) ?? accountSections[0];

  const totalOrders = orders.length;
  const activeDeliveries = orders.filter((order) =>
    ["packed", "shipped", "out_for_delivery"].includes(order.status)
  ).length;
  const wishlistCount = wishlist.length;
  const reminderLabel =
    preferences.careReminderDays === 1
      ? "Tomorrow"
      : `In ${preferences.careReminderDays} days`;
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;

  const clearLocalSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setSessionToken(null);
    setUser(null);
    setOrders([]);
    setWishlist([]);
  };

  useEffect(() => {
    if (!sessionToken) {
      setLoadingAccount(false);
      return;
    }

    let isActive = true;

    const loadAccount = async () => {
      setLoadingAccount(true);
      setLoadingNotice(null);

      try {
        const headers = {
          Accept: "application/json",
          Authorization: `Bearer ${sessionToken}`,
        };

        const [meResponse, ordersResponse, wishlistResponse] = await Promise.all([
          fetch(`${API}/api/me`, { headers }),
          fetch(`${API}/api/orders?per_page=8`, { headers }),
          fetch(`${API}/api/wishlist`, { headers }),
        ]);

        const [meData, ordersData, wishlistData] = await Promise.all([
          meResponse.json().catch(() => ({})),
          ordersResponse.json().catch(() => ({})),
          wishlistResponse.json().catch(() => ({})),
        ]);

        if (!isActive) return;

        if (meResponse.status === 401) {
          clearLocalSession();
          setLoadingNotice({
            tone: "error",
            text: "Your session expired. Please log in again.",
          });
          return;
        }

        if (!meResponse.ok) {
          throw new Error(extractErrorMessage(meData, "Failed to load your account."));
        }

        const nextUser = (meData.user ?? null) as AccountUser | null;
        setUser(nextUser);
        localStorage.setItem("user", JSON.stringify(nextUser));
        setProfileForm((current) => ({
          name: nextUser?.name ?? "",
          email: nextUser?.email ?? "",
          phone: current.phone || readProfileExtras().phone || "",
        }));

        if (ordersResponse.ok) {
          setOrders((ordersData.data?.orders ?? []) as AccountOrder[]);
        } else {
          setOrders([]);
          setLoadingNotice({
            tone: "error",
            text: extractErrorMessage(ordersData, "Orders could not be loaded right now."),
          });
        }

        if (wishlistResponse.ok) {
          setWishlist((wishlistData.data?.wishlist ?? []) as WishlistEntry[]);
        } else {
          setWishlist([]);
          setLoadingNotice({
            tone: "error",
            text: extractErrorMessage(wishlistData, "Wishlist could not be loaded right now."),
          });
        }
      } catch (error) {
        if (!isActive) return;

        setLoadingNotice({
          tone: "error",
          text:
            error instanceof Error
              ? error.message
              : "We could not load your account details.",
        });
      } finally {
        if (isActive) {
          setLoadingAccount(false);
        }
      }
    };

    void loadAccount();

    return () => {
      isActive = false;
    };
  }, [sessionToken]);

  useEffect(() => {
    if (!orders.length) return;

    if (!profileForm.phone.trim()) {
      const recentPhone = orders.find((order) => order.shipping_phone?.trim())?.shipping_phone?.trim();
      if (recentPhone) {
        setProfileForm((current) => ({
          ...current,
          phone: recentPhone,
        }));
        persistProfileExtras({ phone: recentPhone });
      }
    }

    if (addresses.length === 0) {
      const derivedAddresses = deriveAddressesFromOrders(orders);
      if (derivedAddresses.length > 0) {
        setAddresses(derivedAddresses);
        persistAddresses(derivedAddresses);
      }
    }
  }, [orders]);

  const saveProfileExtras = (phone: string) => {
    persistProfileExtras({ phone });
  };

  const navigateToSection = (section: AccountSection) => {
    setActiveSection(section);
    setExpandedOrderId(null);
  };

  const openTrackOrder = (orderId?: number) => {
    const query = orderId
      ? `?orderId=${orderId}&email=${encodeURIComponent(profileForm.email)}`
      : "";
    navigate(`/track-order${query}`);
  };

  const renderNotice = (notice: Notice | null) => {
    if (!notice) return null;

    return (
      <div className={`account-inline-notice ${notice.tone}`}>
        <AlertCircle size={16} />
        <span>{notice.text}</span>
      </div>
    );
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileNotice(null);

    if (!sessionToken) {
      setProfileNotice({
        tone: "error",
        text: "Please log in again before updating your profile.",
      });
      return;
    }

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileNotice({
        tone: "error",
        text: "Name and email are required.",
      });
      return;
    }

    setProfileSaving(true);

    try {
      const response = await fetch(`${API}/api/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          name: profileForm.name.trim(),
          email: profileForm.email.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        clearLocalSession();
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(extractErrorMessage(data, "Could not update your profile."));
      }

      const nextUser = (data.user ?? user) as AccountUser;
      setUser(nextUser);
      localStorage.setItem("user", JSON.stringify(nextUser));
      saveProfileExtras(profileForm.phone.trim());
      setProfileForm((current) => ({
        ...current,
        name: nextUser.name,
        email: nextUser.email,
        phone: current.phone.trim(),
      }));
      setProfileNotice({
        tone: "success",
        text: "Profile saved successfully.",
      });
    } catch (error) {
      setProfileNotice({
        tone: "error",
        text:
          error instanceof Error ? error.message : "Could not update your profile.",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddressSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddressNotice(null);

    const label = addressForm.label.trim();
    const address = addressForm.address.trim();
    const note = addressForm.note.trim();

    if (!label || !address) {
      setAddressNotice({
        tone: "error",
        text: "Address label and full address are required.",
      });
      return;
    }

    let nextAddresses: AddressEntry[];

    if (editingAddressId) {
      nextAddresses = addresses.map((entry) =>
        entry.id === editingAddressId
          ? {
              ...entry,
              label,
              address,
              note,
            }
          : entry
      );
    } else {
      nextAddresses = [
        ...addresses,
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          label,
          address,
          note,
          isDefault: addresses.length === 0,
        },
      ];
    }

    setAddresses(nextAddresses);
    persistAddresses(nextAddresses);
    setAddressForm({ label: "", address: "", note: "" });
    setEditingAddressId(null);
    setAddressNotice({
      tone: "success",
      text: editingAddressId ? "Address updated." : "Address added.",
    });
  };

  const handleEditAddress = (address: AddressEntry) => {
    setActiveSection("addresses");
    setAddressNotice(null);
    setEditingAddressId(address.id);
    setAddressForm({
      label: address.label,
      address: address.address,
      note: address.note,
    });
  };

  const handleDeleteAddress = (addressId: string) => {
    const nextAddresses = addresses.filter((entry) => entry.id !== addressId);

    if (nextAddresses.length > 0 && !nextAddresses.some((entry) => entry.isDefault)) {
      nextAddresses[0] = {
        ...nextAddresses[0],
        isDefault: true,
      };
    }

    setAddresses(nextAddresses);
    persistAddresses(nextAddresses);

    if (editingAddressId === addressId) {
      setEditingAddressId(null);
      setAddressForm({ label: "", address: "", note: "" });
    }

    setAddressNotice({
      tone: "success",
      text: "Address removed.",
    });
  };

  const handleSetDefaultAddress = (addressId: string) => {
    const nextAddresses = addresses.map((entry) => ({
      ...entry,
      isDefault: entry.id === addressId,
    }));

    setAddresses(nextAddresses);
    persistAddresses(nextAddresses);
    setAddressNotice({
      tone: "success",
      text: "Default address updated.",
    });
  };

  const handleSavePreferences = () => {
    persistPreferences(preferences);
    setPreferencesNotice({
      tone: "success",
      text: "Preferences saved on this device.",
    });
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!sessionToken) return;

    setCancelingOrderId(orderId);
    setLoadingNotice(null);

    try {
      const response = await fetch(`${API}/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        clearLocalSession();
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(extractErrorMessage(data, "Unable to cancel that order."));
      }

      const updatedOrder = (data.data?.order ?? null) as AccountOrder | null;
      if (updatedOrder) {
        setOrders((current) =>
          current.map((order) => (order.id === orderId ? updatedOrder : order))
        );
      }

      setLoadingNotice({
        tone: "success",
        text: `Order #${orderId} was cancelled.`,
      });
    } catch (error) {
      setLoadingNotice({
        tone: "error",
        text:
          error instanceof Error ? error.message : "Unable to cancel that order.",
      });
    } finally {
      setCancelingOrderId(null);
    }
  };

  const handleRemoveWishlistItem = async (plantId: number) => {
    if (!sessionToken) return;

    setWishlistBusyPlantId(plantId);
    setLoadingNotice(null);

    try {
      const response = await fetch(`${API}/api/wishlist/${plantId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        clearLocalSession();
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(extractErrorMessage(data, "Unable to remove wishlist item."));
      }

      setWishlist((current) =>
        current.filter((entry) => (entry.plant?.id ?? entry.plant_id) !== plantId)
      );
    } catch (error) {
      setLoadingNotice({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to remove wishlist item.",
      });
    } finally {
      setWishlistBusyPlantId(null);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSecurityNotice(null);

    if (!sessionToken) {
      setSecurityNotice({
        tone: "error",
        text: "Please log in again before changing your password.",
      });
      return;
    }

    if (passwordForm.password !== passwordForm.password_confirmation) {
      setSecurityNotice({
        tone: "error",
        text: "New password and confirmation do not match.",
      });
      return;
    }

    setPasswordSaving(true);

    try {
      const response = await fetch(`${API}/api/me/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        clearLocalSession();
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(extractErrorMessage(data, "Could not update your password."));
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        setSessionToken(data.token as string);
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user as AccountUser);
      }

      const updatedAt = new Date().toISOString();
      localStorage.setItem(PASSWORD_CHANGED_KEY, updatedAt);
      setPasswordChangedAt(updatedAt);
      setPasswordForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
      setSecurityNotice({
        tone: "success",
        text: "Password updated. Other sessions were signed out.",
      });
    } catch (error) {
      setSecurityNotice({
        tone: "error",
        text:
          error instanceof Error ? error.message : "Could not update your password.",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = async (logoutAll: boolean) => {
    if (!sessionToken) {
      navigate("/login");
      return;
    }

    setSecurityNotice(null);

    try {
      const response = await fetch(`${API}/api/${logoutAll ? "logout-all" : "logout"}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (!response.ok && response.status !== 401) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          extractErrorMessage(data, "We could not complete the logout request.")
        );
      }
    } catch (error) {
      setSecurityNotice({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "We could not complete the logout request.",
      });
      return;
    }

    clearLocalSession();
    navigate("/login");
  };

  const renderOverview = () => (
    <div className="account-section-stack">
      <div className="account-stats-grid">
        <article className="account-stat-card">
          <span className="account-stat-label">Total Orders</span>
          <strong>{totalOrders}</strong>
          <p>Everything you have ordered so far.</p>
        </article>
        <article className="account-stat-card">
          <span className="account-stat-label">Active Deliveries</span>
          <strong>{activeDeliveries}</strong>
          <p>Orders currently packed, shipped, or out for delivery.</p>
        </article>
        <article className="account-stat-card">
          <span className="account-stat-label">Wishlist</span>
          <strong>{wishlistCount}</strong>
          <p>Plants saved for later decisions.</p>
        </article>
        <article className="account-stat-card">
          <span className="account-stat-label">Next Reminder</span>
          <strong>{reminderLabel}</strong>
          <p>Based on your current care reminder preference.</p>
        </article>
      </div>

      <div className="account-quick-grid">
        <button type="button" className="account-quick-card" onClick={() => navigateToSection("profile")}>
          <div>
            <h3>Update Profile</h3>
            <p>Keep your name, email, and phone ready for checkout and support.</p>
          </div>
          <ChevronRight size={18} />
        </button>

        <button type="button" className="account-quick-card" onClick={() => navigateToSection("orders")}>
          <div>
            <h3>Review Orders</h3>
            <p>Open recent order details or cancel any pending purchase.</p>
          </div>
          <ChevronRight size={18} />
        </button>

        <button type="button" className="account-quick-card" onClick={() => navigateToSection("wishlist")}>
          <div>
            <h3>Manage Wishlist</h3>
            <p>Jump back to your saved plants and remove anything outdated.</p>
          </div>
          <ChevronRight size={18} />
        </button>

        <button type="button" className="account-quick-card" onClick={() => openTrackOrder()}>
          <div>
            <h3>Track an Order</h3>
            <p>Open the tracker with your current account email prefilled.</p>
          </div>
          <ExternalLink size={18} />
        </button>
      </div>

      <div className="account-overview-grid">
        <section className="account-card">
          <div className="account-card-head">
            <h3>Recent Orders</h3>
            <button type="button" className="account-link-btn" onClick={() => navigateToSection("orders")}>
              View all
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="account-empty-state">
              <ShoppingBag size={24} />
              <p>No order history yet.</p>
              <button type="button" className="account-primary-btn" onClick={() => navigate("/plants")}>
                Browse Plants
              </button>
            </div>
          ) : (
            <div className="account-list-stack">
              {orders.slice(0, 3).map((order) => (
                <article key={order.id} className="account-list-card">
                  <div className="account-list-main">
                    <div>
                      <p className="account-item-title">Order #{order.id}</p>
                      <p className="account-item-meta">
                        {order.items.length} item{order.items.length === 1 ? "" : "s"} | {formatCurrency(order.total)}
                      </p>
                    </div>
                    <span className={`account-status-pill ${getOrderStatusTone(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="account-list-footer">
                    <span>{formatDate(order.created_at)}</span>
                    <button type="button" className="account-link-btn" onClick={() => openTrackOrder(order.id)}>
                      Track order
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="account-card">
          <div className="account-card-head">
            <h3>Default Delivery Address</h3>
            <button type="button" className="account-link-btn" onClick={() => navigateToSection("addresses")}>
              Manage
            </button>
          </div>

          {defaultAddress ? (
            <div className="account-address-preview">
              <strong>{defaultAddress.label}</strong>
              <p>{defaultAddress.address}</p>
              <span>{defaultAddress.note || "Default checkout destination"}</span>
            </div>
          ) : (
            <div className="account-empty-state">
              <MapPin size={24} />
              <p>No saved addresses yet.</p>
              <button type="button" className="account-primary-btn" onClick={() => navigateToSection("addresses")}>
                Add Address
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="account-section-stack">
      {renderNotice(profileNotice)}

      <div className="account-profile-grid">
        <section className="account-card">
          <div className="account-card-head">
            <h3>Snapshot</h3>
          </div>
          <div className="account-profile-summary">
            <div>
              <p className="account-field-label">Full name</p>
              <strong>{profileForm.name || "Not set"}</strong>
            </div>
            <div>
              <p className="account-field-label">Email</p>
              <strong>{profileForm.email || "Not set"}</strong>
            </div>
            <div>
              <p className="account-field-label">Phone</p>
              <strong>{profileForm.phone || "Add a phone number for delivery calls"}</strong>
            </div>
            <div>
              <p className="account-field-label">Member since</p>
              <strong>{formatDate(user?.created_at)}</strong>
            </div>
          </div>
        </section>

        <section className="account-card">
          <div className="account-card-head">
            <h3>Edit Profile</h3>
          </div>

          <form className="account-form" onSubmit={handleProfileSubmit}>
            <label className="account-form-field">
              <span>Full name</span>
              <input
                type="text"
                value={profileForm.name}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Your full name"
              />
            </label>

            <label className="account-form-field">
              <span>Email address</span>
              <input
                type="email"
                value={profileForm.email}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="you@example.com"
              />
            </label>

            <label className="account-form-field">
              <span>Phone number</span>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="+977 98XXXXXXXX"
              />
            </label>

            <p className="account-form-hint">
              Phone number is saved locally for faster checkout and delivery communication.
            </p>

            <div className="account-form-actions">
              <button type="submit" className="account-primary-btn" disabled={profileSaving}>
                {profileSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="account-section-stack">
      {orders.length === 0 ? (
        <div className="account-empty-state account-card">
          <Package size={28} />
          <h3>No orders yet</h3>
          <p>Your completed checkout history will appear here.</p>
          <button type="button" className="account-primary-btn" onClick={() => navigate("/plants")}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="account-list-stack">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const isPending = order.status === "pending";

            return (
              <section key={order.id} className="account-card">
                <div className="account-order-head">
                  <div>
                    <h3>Order #{order.id}</h3>
                    <p>
                      Placed {formatDateTime(order.created_at)} | {order.items.length} item
                      {order.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="account-order-head-side">
                    <span className={`account-status-pill ${getOrderStatusTone(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                    <strong>{formatCurrency(order.total)}</strong>
                  </div>
                </div>

                <div className="account-order-actions">
                  <button type="button" className="account-secondary-btn" onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}>
                    {isExpanded ? "Hide Details" : "View Details"}
                  </button>
                  <button type="button" className="account-secondary-btn" onClick={() => openTrackOrder(order.id)}>
                    Track Order
                  </button>
                  {isPending && (
                    <button
                      type="button"
                      className="account-danger-btn"
                      onClick={() => void handleCancelOrder(order.id)}
                      disabled={cancelingOrderId === order.id}
                    >
                      {cancelingOrderId === order.id ? "Cancelling..." : "Cancel Order"}
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="account-order-details">
                    <div className="account-order-meta-grid">
                      <article>
                        <span>Shipping name</span>
                        <strong>{order.shipping_name || "Not provided"}</strong>
                      </article>
                      <article>
                        <span>Phone</span>
                        <strong>{order.shipping_phone || "Not provided"}</strong>
                      </article>
                      <article>
                        <span>Address</span>
                        <strong>{order.shipping_address || "Not provided"}</strong>
                      </article>
                      <article>
                        <span>Payment</span>
                        <strong>{order.payment_status || "Pending"}</strong>
                      </article>
                    </div>

                    <div className="account-order-items">
                      {order.items.map((item) => (
                        <div key={item.id} className="account-order-item">
                          <img
                            src={buildImageUrl(item.plant?.image)}
                            alt={item.plant?.name || "Plant"}
                          />
                          <div>
                            <p className="account-item-title">{item.plant?.name || "Product"}</p>
                            <p className="account-item-meta">
                              Qty {item.quantity} | {formatCurrency(item.line_total ?? item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderAddresses = () => (
    <div className="account-section-stack">
      {renderNotice(addressNotice)}

      <div className="account-address-layout">
        <section className="account-card">
          <div className="account-card-head">
            <h3>{editingAddressId ? "Edit Address" : "Add New Address"}</h3>
          </div>

          <form className="account-form" onSubmit={handleAddressSubmit}>
            <label className="account-form-field">
              <span>Label</span>
              <input
                type="text"
                value={addressForm.label}
                onChange={(event) =>
                  setAddressForm((current) => ({
                    ...current,
                    label: event.target.value,
                  }))
                }
                placeholder="Home, Office, Gift Delivery"
              />
            </label>

            <label className="account-form-field">
              <span>Full address</span>
              <textarea
                value={addressForm.address}
                onChange={(event) =>
                  setAddressForm((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
                placeholder="Ward, street, city, landmark"
                rows={4}
              />
            </label>

            <label className="account-form-field">
              <span>Delivery note</span>
              <input
                type="text"
                value={addressForm.note}
                onChange={(event) =>
                  setAddressForm((current) => ({
                    ...current,
                    note: event.target.value,
                  }))
                }
                placeholder="Gate code, office hours, recipient phone"
              />
            </label>

            <div className="account-form-actions">
              <button type="submit" className="account-primary-btn">
                {editingAddressId ? "Update Address" : "Save Address"}
              </button>
              {editingAddressId && (
                <button
                  type="button"
                  className="account-secondary-btn"
                  onClick={() => {
                    setEditingAddressId(null);
                    setAddressForm({ label: "", address: "", note: "" });
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="account-card">
          <div className="account-card-head">
            <h3>Saved Addresses</h3>
          </div>

          {addresses.length === 0 ? (
            <div className="account-empty-state">
              <MapPin size={24} />
              <p>No saved addresses yet.</p>
            </div>
          ) : (
            <div className="account-list-stack">
              {addresses.map((address) => (
                <article key={address.id} className="account-list-card">
                  <div className="account-list-main">
                    <div>
                      <p className="account-item-title">
                        {address.label}
                        {address.isDefault ? " | Default" : ""}
                      </p>
                      <p className="account-item-meta">{address.address}</p>
                    </div>
                  </div>

                  {address.note && <p className="account-item-note">{address.note}</p>}

                  <div className="account-list-actions">
                    {!address.isDefault && (
                      <button type="button" className="account-link-btn" onClick={() => handleSetDefaultAddress(address.id)}>
                        Set default
                      </button>
                    )}
                    <button type="button" className="account-link-btn" onClick={() => handleEditAddress(address)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="account-link-btn danger"
                      onClick={() => handleDeleteAddress(address.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );

  const renderWishlist = () => (
    <div className="account-section-stack">
      {wishlist.length === 0 ? (
        <div className="account-empty-state account-card">
          <Heart size={28} />
          <h3>Your wishlist is empty</h3>
          <p>Save plants while browsing to compare them later.</p>
          <button type="button" className="account-primary-btn" onClick={() => navigate("/plants")}>
            Explore Plants
          </button>
        </div>
      ) : (
        <div className="account-wishlist-grid">
          {wishlist.map((entry) => {
            const plant = entry.plant;
            const plantId = plant?.id ?? entry.plant_id;

            return (
              <article key={entry.id} className="account-card account-wishlist-card">
                <img src={buildImageUrl(plant?.image)} alt={plant?.name || "Plant"} />
                <div className="account-wishlist-card-body">
                  <h3>{plant?.name || "Saved plant"}</h3>
                  <p>{formatCurrency(plant?.price)}</p>
                  <span>
                    {[plant?.room, plant?.size].filter(Boolean).join(" | ") || "Saved for later"}
                  </span>
                </div>
                <div className="account-wishlist-actions">
                  <button type="button" className="account-primary-btn" onClick={() => navigate(`/plants/${plantId}`)}>
                    View Product
                  </button>
                  <button
                    type="button"
                    className="account-icon-btn"
                    onClick={() => void handleRemoveWishlistItem(plantId)}
                    disabled={wishlistBusyPlantId === plantId}
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderSecurity = () => (
    <div className="account-section-stack">
      {renderNotice(securityNotice)}

      <div className="account-security-grid">
        <section className="account-card">
          <div className="account-card-head">
            <h3>Password</h3>
          </div>

          <div className="account-security-summary">
            <p>
              Last updated: <strong>{passwordChangedAt ? formatDateTime(passwordChangedAt) : "Not recorded yet"}</strong>
            </p>
            <p>Updating your password signs out other devices and keeps this one active.</p>
          </div>

          <form className="account-form" onSubmit={handlePasswordSubmit}>
            <label className="account-form-field">
              <span>Current password</span>
              <input
                type="password"
                value={passwordForm.current_password}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    current_password: event.target.value,
                  }))
                }
                placeholder="Enter current password"
              />
            </label>

            <label className="account-form-field">
              <span>New password</span>
              <input
                type="password"
                value={passwordForm.password}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="Minimum 6 characters"
              />
            </label>

            <label className="account-form-field">
              <span>Confirm new password</span>
              <input
                type="password"
                value={passwordForm.password_confirmation}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    password_confirmation: event.target.value,
                  }))
                }
                placeholder="Repeat new password"
              />
            </label>

            <div className="account-form-actions">
              <button type="submit" className="account-primary-btn" disabled={passwordSaving}>
                {passwordSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </section>

        <section className="account-card">
          <div className="account-card-head">
            <h3>Session Controls</h3>
          </div>

          <div className="account-session-actions">
            <button type="button" className="account-secondary-btn" onClick={() => void handleLogout(false)}>
              <LogOut size={16} />
              Logout This Device
            </button>
            <button type="button" className="account-danger-btn" onClick={() => void handleLogout(true)}>
              <Shield size={16} />
              Logout All Devices
            </button>
          </div>

          <p className="account-form-hint">
            Use logout all if you signed in on another laptop or shared browser and want to invalidate every active session.
          </p>
        </section>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="account-section-stack">
      {renderNotice(preferencesNotice)}

      <section className="account-card">
        <div className="account-card-head">
          <h3>Notification Preferences</h3>
        </div>

        <div className="account-toggle-list">
          <label className="account-toggle-row">
            <div>
              <strong>Email updates</strong>
              <span>Receive order updates, restocks, and care notes by email.</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailUpdates}
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  emailUpdates: event.target.checked,
                }))
              }
            />
          </label>

          <label className="account-toggle-row">
            <div>
              <strong>SMS alerts</strong>
              <span>Get delivery-sensitive notices by phone when timing matters.</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.smsAlerts}
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  smsAlerts: event.target.checked,
                }))
              }
            />
          </label>
        </div>

        <label className="account-form-field account-reminder-field">
          <span>Care reminder frequency</span>
          <select
            value={preferences.careReminderDays}
            onChange={(event) =>
              setPreferences((current) => ({
                ...current,
                careReminderDays: Number(event.target.value),
              }))
            }
          >
            <option value={1}>Every day</option>
            <option value={3}>Every 3 days</option>
            <option value={5}>Every 5 days</option>
            <option value={7}>Every week</option>
          </select>
        </label>

        <div className="account-form-actions">
          <button type="button" className="account-primary-btn" onClick={handleSavePreferences}>
            Save Preferences
          </button>
        </div>
      </section>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case "profile":
        return renderProfile();
      case "orders":
        return renderOrders();
      case "addresses":
        return renderAddresses();
      case "wishlist":
        return renderWishlist();
      case "security":
        return renderSecurity();
      case "preferences":
        return renderPreferences();
      case "overview":
      default:
        return renderOverview();
    }
  };

  if (!sessionToken) {
    return (
      <Layout>
        <div className="account-page">
          <section className="account-hero">
            <div className="account-container account-hero-inner">
              <div>
                <span className="account-eyebrow">Customer Dashboard</span>
                <h1>My Account</h1>
                <p>
                  Track deliveries, review saved plants, and manage your checkout details from one place.
                </p>
              </div>
            </div>
          </section>

          <section className="account-shell">
            <div className="account-container">
              {renderNotice(loadingNotice)}
              <div className="account-guest-card">
                <div className="account-guest-icon">
                  <Leaf size={26} />
                </div>
                <h2>Login required</h2>
                <p>
                  Sign in to view your orders, wishlist, saved addresses, and account security settings.
                </p>
                <div className="account-guest-actions">
                  <Link to="/login" className="account-primary-link">
                    Login
                  </Link>
                  <Link to="/register" className="account-secondary-link">
                    Create Account
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="account-page">
        <section className="account-hero">
          <div className="account-container account-hero-inner">
            <div>
              <span className="account-eyebrow">Customer Dashboard</span>
              <h1>My Account</h1>
              <p>
                Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}. Manage your profile, orders, saved addresses, and care preferences here.
              </p>
            </div>

            <div className="account-hero-actions">
              <button type="button" className="account-hero-btn primary" onClick={() => navigateToSection("orders")}>
                <Package size={16} />
                View Orders
              </button>
              <button type="button" className="account-hero-btn secondary" onClick={() => navigate("/my-garden")}>
                <Leaf size={16} />
                My Garden
              </button>
              <button type="button" className="account-hero-btn secondary" onClick={() => openTrackOrder()}>
                <Truck size={16} />
                Track Order
              </button>
            </div>
          </div>
        </section>

        <section className="account-shell">
          <div className="account-container account-content">
            <aside className="account-sidebar">
              <div className="account-sidebar-head">
                <div className="account-avatar">
                  {(user?.name || "A").charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{user?.name || "Account User"}</strong>
                  <span>{user?.email || "No email available"}</span>
                </div>
              </div>

              <div className="account-nav">
                {accountSections.map((section) => {
                  const Icon = section.icon;

                  return (
                    <button
                      key={section.key}
                      type="button"
                      className={`account-nav-btn ${activeSection === section.key ? "active" : ""}`}
                      onClick={() => navigateToSection(section.key)}
                    >
                      <span className="account-nav-btn-main">
                        <Icon size={16} />
                        {section.label}
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  );
                })}
              </div>
            </aside>

            <main className="account-main">
              {renderNotice(loadingNotice)}

              <header className="account-main-header">
                <div>
                  <p className="account-main-kicker">{selectedSection.label}</p>
                  <h2>{selectedSection.label}</h2>
                  <p>{selectedSection.description}</p>
                </div>
              </header>

              {loadingAccount ? (
                <div className="account-loading-card">
                  <Package size={26} />
                  <h3>Loading your account</h3>
                  <p>Fetching your latest profile, orders, and wishlist details.</p>
                </div>
              ) : (
                renderActiveSection()
              )}
            </main>
          </div>
        </section>
      </div>
    </Layout>
  );
}
