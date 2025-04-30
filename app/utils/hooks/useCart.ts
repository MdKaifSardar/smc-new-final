"use client";

import useSWR from "swr";
import { useUser } from "@clerk/nextjs";
import {
  getSavedCartForUser,
  addShirtToCart,
  updateCartItemQuantity,
  deleteShirtFromCart,
  deleteAllCart,
} from "@/lib/database/actions/cart.actions";

export interface CartProductDetails {
  _id: string;
  price: number;
  collarName?: string;
  collarImage?: string;
  collarPrice?: number;
  cuffName?: string;
  cuffImage?: string;
  cuffPrice?: number;
  fabricName?: string;
  fabricImage?: string;
  colorName?: string;
  colorHexCode?: string;
  sleevesName?: string;
  sleevesImage?: string;
  sleevesPrice?: number;
  pocketName?: string;
  pocketImage?: string;
  pocketPrice?: number;
  bottomName?: string;
  bottomImage?: string;
  bottomPrice?: number;
  backName?: string;
  backImage?: string;
  backPrice?: number;
  placketName?: string;
  placketImage?: string;
  placketPrice?: number;
  fitName?: string;
  fitImage?: string;
  fitPrice?: number;
  monogramName?: string;
  monogramImage?: string;
  monogramPrice?: number;
}

export interface CartItem {
  product: CartProductDetails;
  qty: string;
  price: number;
}

export interface CartData {
  _id?: string;
  userId?: string;
  products: CartItem[];
  cartTotal: number;
  totalAfterDiscount?: number;
}

export function useCart() {
  const { user, isLoaded, isSignedIn } = useUser();
  const clerkId = user?.id;

  // SWR automatic cache and revalidation
  const { data, error, isLoading, mutate } = useSWR<CartData | null>(
    isSignedIn && clerkId ? ["cart", clerkId] : null,
    async () => {
      if (!clerkId) return null;
      const res = await getSavedCartForUser(clerkId);
      if (res?.success && res.cart) {
        return res.cart as CartData;
      }
      return null;
    },
    {
      revalidateOnFocus: true,      // Automatically re-checks cart when user switches back to window/tab
      revalidateOnReconnect: true,  // Automatically re-checks cart on internet reconnect
      dedupingInterval: 1500,       // Deduplicate requests within 1.5 seconds across components
    }
  );

  const cartItems: CartItem[] = data?.products || [];
  const cartTotal: number = data?.cartTotal || 0;
  const totalAfterDiscount: number = data?.totalAfterDiscount ?? cartTotal;

  // Total quantity count across all items in cart
  const cartCount: number = cartItems.reduce((acc, item) => {
    const q = parseInt(item.qty, 10);
    return acc + (isNaN(q) ? 1 : Math.max(1, q));
  }, 0);

  // Helper actions with instant optimistic revalidation
  const addItem = async (productId: string, quantity: number = 1) => {
    if (!clerkId) return { success: false, message: "User not authenticated" };
    const res = await addShirtToCart(productId, clerkId, quantity);
    await mutate();
    return res;
  };

  const updateItemQty = async (productId: string, newQty: number) => {
    if (!clerkId) return { success: false, message: "User not authenticated" };
    const res = await updateCartItemQuantity(clerkId, productId, newQty);
    await mutate();
    return res;
  };

  const removeItem = async (productId: string) => {
    if (!clerkId) return { success: false, message: "User not authenticated" };
    const res = await deleteShirtFromCart(clerkId, productId);
    await mutate();
    return res;
  };

  const clearCart = async () => {
    if (!clerkId) return { success: false, message: "User not authenticated" };
    const res = await deleteAllCart(clerkId);
    await mutate();
    return res;
  };

  return {
    cart: data,
    cartItems,
    cartCount,
    cartTotal,
    totalAfterDiscount,
    isLoading: !isLoaded || isLoading,
    isError: !!error,
    mutateCart: mutate,
    addItem,
    updateItemQty,
    removeItem,
    clearCart,
  };
}
