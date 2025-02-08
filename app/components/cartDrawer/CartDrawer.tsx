"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/components/ui/sheet";
import { FaShoppingCart } from "react-icons/fa";
import { AiOutlineClose, AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import Link from "next/link";
import { useAtom, useStore } from "jotai";
import { cartMenuState } from "@/app/utils/data/store";
import { useUser } from "@clerk/nextjs";
import { getShirtById, getShirtByIdInDetails } from "@/lib/database/actions/admin/ShirtArea/Shirt/shirt.actions";
import Image from "next/image";

interface CartItem {
  product: string | {
    id?: string;
    _id?: string;
  };
  qty: string;
  price: number;
  shirt?: {
    price: number;
    collarStyle?: object;
    bottom?: object;
    id?: string;
  };
}

const MiniShirtPreview = ({ details }: { details: any }) => {
  return (
    <div className="relative w-16 h-20 sm:w-20 sm:h-24">
      {details.fitImage && (
        <Image
          src={details.fitImage}
          alt="Fit Style"
          fill
          className="object-contain absolute top-0 left-0"
        />
      )}
      {details.bottomImage && (
        <Image
          src={details.bottomImage}
          alt="Bottom Style"
          fill
          className="object-contain absolute top-0 left-0"
        />
      )}
      {details.placketImage && (
        <Image
          src={details.placketImage}
          alt="Placket"
          fill
          className="object-contain absolute top-0 left-0"
        />
      )}
      {details.pocketImage && (
        <Image
          src={details.pocketImage}
          alt="Pocket"
          fill
          className="object-contain absolute top-0 left-0"
        />
      )}
      {details.sleevesImage && (
        <Image
          src={details.sleevesImage}
          alt="Sleeves"
          fill
          className="object-contain absolute top-0 left-0"
        />
      )}
      {details.collarImage && (
        <Image
          src={details.collarImage}
          alt="Collar"
          fill
          className="object-contain absolute top-0 left-0"
        />
      )}
    </div>
  );
};

let setCartMenuOpenGlobal: (open: boolean) => void;

const CartDrawer = () => {
  const [cartMenuOpen, setCartMenuOpen] = useAtom(cartMenuState, { store: useStore() });
  setCartMenuOpenGlobal = setCartMenuOpen;
  const { user, isLoaded } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isShirtEnriched, setIsShirtEnriched] = useState(false);

  function getProductId(item: CartItem): string {
    if (!item.product) return "";
    if (typeof item.product === "object") {
      return item.product._id ? item.product._id.toString() : (item.product.id ? item.product.id.toString() : "");
    }
    return item.product;
  }

  useEffect(() => {
    async function fetchCart() {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }
      const clerkId = user.id;
      if (!clerkId) {
        console.error("Clerk ID is undefined");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/cart?clerkId=${clerkId}`);
        const data = await res.json();
        if (data.success && data.cart?.products) {
          setCartItems(data.cart.products);
          setIsShirtEnriched(false);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error("Error fetching cart", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, [isLoaded, user]);

  useEffect(() => {
    if (cartItems.length > 0 && !isShirtEnriched) {
      async function enrichCartItems() {
        const enrichedItems = await Promise.all(
          cartItems.map(async (item) => {
            if (item.shirt) return item;
            const productId = getProductId(item);
            try {
              const data = await getShirtByIdInDetails(productId);
              return data.success ? { ...item, shirt: data.shirt } : item;
            } catch (error) {
              console.error("Error fetching shirt details", error);
              return item;
            }
          })
        );
        setCartItems(enrichedItems);
        setIsShirtEnriched(true);
      }
      enrichCartItems();
    }
  }, [cartItems, isShirtEnriched]);

  const handleOnClickCartMenu = () => {
    if (user) setCartMenuOpen(true);
  };

  const removeItem = (productId: string) => {
    setCartItems(cartItems.filter((item) => getProductId(item) !== productId));
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (!user) return;
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: user.id, productId, newQty: newQuantity }),
      });
      const data = await res.json();
      if (data.success && data.cart) {
        setCartItems(data.cart.products);
        setIsShirtEnriched(false);
      }
    } catch (error) {
      console.error("Error updating quantity", error);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * Number(item.qty), 0);

  return (
    <div className="relative flex items-center">
      <Sheet open={cartMenuOpen} onOpenChange={setCartMenuOpen}>
        <SheetTrigger asChild>
          <button onClick={handleOnClickCartMenu}>
            <FaShoppingCart className="text-[#4a2b2b] w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg h-screen overflow-y-auto">
          <SheetHeader className="sticky top-0 bg-white z-10">
            <SheetTitle className="subHeading text-xl sm:text-2xl px-4 py-6 border-b">
              SHOPPING CART
            </SheetTitle>
          </SheetHeader>
          
          <div className="px-4 pb-24"> {/* Added padding-bottom for checkout section */}
            {!user ? (
              <div className="p-4 text-center">
                <p>Please log in to view your cart.</p>
              </div>
            ) : loading ? (
              <div className="p-4 text-center">
                <p>Loading cart...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <p className="p-4 text-center">Your cart is empty.</p>
            ) : (
              cartItems.map((item, index) => {
                const productId = getProductId(item);
                return productId ? (
                  <div key={index} className="flex gap-4 py-4 border-b">
                    <div className="flex-shrink-0">
                      {item.shirt && <MiniShirtPreview details={item.shirt} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate">
                        Custom Shirt
                      </h3>
                      
                      {item.shirt && (
                        <div className="mt-1 text-xs sm:text-sm text-gray-600">
                          <p>₹{item.shirt.price.toFixed(2)}</p>
                          <p className="text-gray-500 truncate">
                            {item.shirt.fabricName} - {item.shirt.colorName}
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(productId, Number(item.qty) - 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <AiOutlineMinus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.qty}</span>
                          <button
                            onClick={() => updateQuantity(productId, Number(item.qty) + 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <AiOutlinePlus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-semibold text-sm sm:text-base">
                          ₹{(item.price * Number(item.qty)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(productId)}
                      className="self-start text-gray-400 hover:text-gray-600"
                    >
                      <AiOutlineClose className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                ) : null;
              })
            )}
          </div>

          {user && cartItems.length > 0 && (
            <div className="sticky bottom-0 bg-white border-t">
              <div className="p-4 space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Subtotal:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-center text-gray-500">
                  Tax included. Shipping calculated at checkout.
                </p>
                <Link href="/checkout" className="block" onClick={() => setCartMenuOpen(false)}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 h-12 text-lg">
                    Checkout Now
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export const openCartDrawer = () => {
  setCartMenuOpenGlobal?.(true);
};

export default CartDrawer;