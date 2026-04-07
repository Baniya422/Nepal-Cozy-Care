import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AccountGuestPrompt from "../components/my-account/AccountGuestPrompt";
import AccountHero from "../components/my-account/AccountHero";
import AccountLoadingCard from "../components/my-account/AccountLoadingCard";
import AccountMainHeader from "../components/my-account/AccountMainHeader";
import AccountNotice from "../components/my-account/AccountNotice";
import AccountSidebar from "../components/my-account/AccountSidebar";
import { accountSections } from "../components/my-account/sectionConfig";
import AccountAddressesSection from "../components/my-account/sections/AccountAddressesSection";
import AccountOrdersSection from "../components/my-account/sections/AccountOrdersSection";
import AccountOverviewSection from "../components/my-account/sections/AccountOverviewSection";
import AccountPreferencesSection from "../components/my-account/sections/AccountPreferencesSection";
import AccountProfileSection from "../components/my-account/sections/AccountProfileSection";
import AccountSecuritySection from "../components/my-account/sections/AccountSecuritySection";
import AccountWishlistSection from "../components/my-account/sections/AccountWishlistSection";
import type {
  AccountOrder,
  AccountSection,
  AccountUser,
  AddressEntry,
  AddressForm,
  Notice,
  PasswordForm,
  Preferences,
  ProfileExtras,
  ProfileForm,
  WishlistEntry,
} from "../components/my-account/types";
import Layout from "../components/layout/Layout";
import "../styles/my-account.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const PROFILE_KEY = "account.profile";
const ADDRESSES_KEY = "account.addresses";
const PREFERENCES_KEY = "account.preferences";
const PASSWORD_CHANGED_KEY = "account.passwordChangedAt";

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

type ErrorResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

function extractErrorMessage(data: unknown, fallback: string) {
  const payload: ErrorResponse =
    data && typeof data === "object" ? (data as ErrorResponse) : {};
  const validationMessages = Object.values(payload.errors ?? {}).flatMap((value) =>
    Array.isArray(value) ? value : [value]
  );
  const firstValidationMessage = validationMessages.find(
    (message): message is string => typeof message === "string"
  );

  return payload.message || firstValidationMessage || fallback;
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

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: storedUser?.name ?? "",
    email: storedUser?.email ?? "",
    phone: storedProfileExtras.phone,
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState<Notice | null>(null);

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [securityNotice, setSecurityNotice] = useState<Notice | null>(null);
  const [passwordChangedAt, setPasswordChangedAt] = useState<string | null>(() =>
    localStorage.getItem(PASSWORD_CHANGED_KEY)
  );

  const [addressForm, setAddressForm] = useState<AddressForm>({
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

  const updateProfileField = (field: keyof ProfileForm, value: string) => {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateAddressField = (field: keyof AddressForm, value: string) => {
    setAddressForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updatePasswordField = (field: keyof PasswordForm, value: string) => {
    setPasswordForm((current) => ({
      ...current,
      [field]: value,
    }));
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
    <AccountOverviewSection
      totalOrders={totalOrders}
      activeDeliveries={activeDeliveries}
      wishlistCount={wishlistCount}
      reminderLabel={reminderLabel}
      orders={orders}
      defaultAddress={defaultAddress}
      onNavigateToSection={navigateToSection}
      onOpenTrackOrder={openTrackOrder}
      onBrowsePlants={() => navigate("/plants")}
      formatCurrency={formatCurrency}
      formatDate={formatDate}
      getOrderStatusTone={getOrderStatusTone}
      getOrderStatusLabel={getOrderStatusLabel}
    />
  );

  const renderProfile = () => (
    <AccountProfileSection
      notice={profileNotice}
      profileForm={profileForm}
      memberSinceLabel={formatDate(user?.created_at)}
      profileSaving={profileSaving}
      onSubmit={handleProfileSubmit}
      onChangeProfileField={updateProfileField}
    />
  );

  const renderOrders = () => (
    <AccountOrdersSection
      orders={orders}
      expandedOrderId={expandedOrderId}
      cancelingOrderId={cancelingOrderId}
      onToggleOrderExpand={(orderId) =>
        setExpandedOrderId((current) => (current === orderId ? null : orderId))
      }
      onOpenTrackOrder={(orderId) => openTrackOrder(orderId)}
      onCancelOrder={(orderId) => void handleCancelOrder(orderId)}
      onStartShopping={() => navigate("/plants")}
      formatDateTime={formatDateTime}
      formatCurrency={formatCurrency}
      buildImageUrl={buildImageUrl}
      getOrderStatusTone={getOrderStatusTone}
      getOrderStatusLabel={getOrderStatusLabel}
    />
  );

  const renderAddresses = () => (
    <AccountAddressesSection
      notice={addressNotice}
      editingAddressId={editingAddressId}
      addressForm={addressForm}
      addresses={addresses}
      onSubmit={handleAddressSubmit}
      onChangeAddressField={updateAddressField}
      onCancelEdit={() => {
        setEditingAddressId(null);
        setAddressForm({ label: "", address: "", note: "" });
      }}
      onSetDefaultAddress={handleSetDefaultAddress}
      onEditAddress={handleEditAddress}
      onDeleteAddress={handleDeleteAddress}
    />
  );

  const renderWishlist = () => (
    <AccountWishlistSection
      wishlist={wishlist}
      wishlistBusyPlantId={wishlistBusyPlantId}
      onExplorePlants={() => navigate("/plants")}
      onOpenProduct={(plantId) => navigate(`/plants/${plantId}`)}
      onRemoveWishlistItem={(plantId) => void handleRemoveWishlistItem(plantId)}
      buildImageUrl={buildImageUrl}
      formatCurrency={formatCurrency}
    />
  );

  const renderSecurity = () => (
    <AccountSecuritySection
      notice={securityNotice}
      passwordForm={passwordForm}
      passwordSaving={passwordSaving}
      passwordChangedLabel={passwordChangedAt ? formatDateTime(passwordChangedAt) : "Not recorded yet"}
      onSubmit={handlePasswordSubmit}
      onChangePasswordField={updatePasswordField}
      onLogoutThisDevice={() => void handleLogout(false)}
      onLogoutAllDevices={() => void handleLogout(true)}
    />
  );

  const renderPreferences = () => (
    <AccountPreferencesSection
      notice={preferencesNotice}
      preferences={preferences}
      onToggleEmailUpdates={(checked) =>
        setPreferences((current) => ({
          ...current,
          emailUpdates: checked,
        }))
      }
      onToggleSmsAlerts={(checked) =>
        setPreferences((current) => ({
          ...current,
          smsAlerts: checked,
        }))
      }
      onReminderChange={(days) =>
        setPreferences((current) => ({
          ...current,
          careReminderDays: days,
        }))
      }
      onSavePreferences={handleSavePreferences}
    />
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
        <AccountGuestPrompt loadingNotice={loadingNotice} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="account-page">
        <AccountHero
          userName={user?.name}
          onViewOrders={() => navigateToSection("orders")}
          onOpenMyGarden={() => navigate("/my-garden")}
          onOpenTrackOrder={() => openTrackOrder()}
        />

        <section className="account-shell">
          <div className="account-container account-content">
            <AccountSidebar
              user={user}
              sections={accountSections}
              activeSection={activeSection}
              onNavigateToSection={navigateToSection}
            />

            <main className="account-main">
              <AccountNotice notice={loadingNotice} />
              <AccountMainHeader section={selectedSection} />
              {loadingAccount ? <AccountLoadingCard /> : renderActiveSection()}
            </main>
          </div>
        </section>
      </div>
    </Layout>
  );
}
