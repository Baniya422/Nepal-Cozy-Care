import { useCallback, useEffect, useState } from "react";

type UseWishlistOptions = {
  apiBaseUrl: string;
};

type WishlistItem = {
  plant_id?: number;
  plant?: {
    id?: number;
  };
};

export function useWishlist({ apiBaseUrl }: UseWishlistOptions) {
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [wishlistBusyId, setWishlistBusyId] = useState<number | null>(null);

  const fetchWishlist = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setWishlistIds([]);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/wishlist`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setWishlistIds([]);
        return;
      }

      if (!response.ok) {
        return;
      }

      const data = await response.json().catch(() => ({}));
      const wishlistItems = (data.data?.wishlist ?? []) as WishlistItem[];
      const ids = wishlistItems
        .map((item) => item.plant?.id ?? item.plant_id)
        .filter((id): id is number => typeof id === "number");

      setWishlistIds(ids);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    void fetchWishlist();
  }, [fetchWishlist]);

  useEffect(() => {
    const handleWishlistUpdated = () => {
      void fetchWishlist();
    };

    window.addEventListener(
      "cozycare:wishlist-updated",
      handleWishlistUpdated as EventListener
    );

    return () => {
      window.removeEventListener(
        "cozycare:wishlist-updated",
        handleWishlistUpdated as EventListener
      );
    };
  }, [fetchWishlist]);

  const toggleWishlist = useCallback(
    async (plantId: number) => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login to add items to your wishlist.");
        return;
      }

      const isWishlisted = wishlistIds.includes(plantId);
      setWishlistBusyId(plantId);

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/wishlist${isWishlisted ? `/${plantId}` : ""}`,
          {
            method: isWishlisted ? "DELETE" : "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: isWishlisted ? undefined : JSON.stringify({ plant_id: plantId }),
          }
        );

        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setWishlistIds([]);
          alert("Your session expired. Please login again.");
          return;
        }

        if (!response.ok) {
          alert(data.message || "Could not update wishlist.");
          return;
        }

        setWishlistIds((current) =>
          isWishlisted
            ? current.filter((id) => id !== plantId)
            : [...current, plantId]
        );

        window.dispatchEvent(new Event("cozycare:wishlist-updated"));
      } catch (error) {
        console.error("Error updating wishlist:", error);
        alert("Something went wrong while updating wishlist.");
      } finally {
        setWishlistBusyId(null);
      }
    },
    [apiBaseUrl, wishlistIds]
  );

  return {
    wishlistIds,
    wishlistBusyId,
    fetchWishlist,
    toggleWishlist,
  };
}
