import { useCallback, useState } from "react";

type AddToCartInput = {
  id: number;
  name: string;
  quantity?: number;
};

export function useAddToCart(apiBaseUrl: string) {
  const [cartBusyId, setCartBusyId] = useState<number | null>(null);

  const addToCart = useCallback(
    async ({ id, name, quantity = 1 }: AddToCartInput) => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login to add items to your cart.");
        return false;
      }

      setCartBusyId(id);

      try {
        const response = await fetch(`${apiBaseUrl}/api/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ plant_id: id, quantity }),
        });

        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          alert("Your session expired. Please login again.");
          return false;
        }

        if (!response.ok) {
          alert(data.message || "Could not add this item to cart.");
          return false;
        }

        window.dispatchEvent(new Event("cozycare:cart-updated"));
        alert(`${name} added to cart!`);
        return true;
      } catch (error) {
        console.error("Error adding item to cart:", error);
        alert("Something went wrong while adding this item to cart.");
        return false;
      } finally {
        setCartBusyId(null);
      }
    },
    [apiBaseUrl]
  );

  return {
    cartBusyId,
    addToCart,
  };
}
