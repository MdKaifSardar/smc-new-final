"use client";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import {
  getSavedCartForUser,
  updateCartItemQuantity,
  deleteShirtFromCart,
} from "@/lib/database/actions/cart.actions";
import { getShirtByIdInDetails } from "@/lib/database/actions/admin/ShirtArea/Shirt/shirt.actions";
import Image from "next/image";
import { FaMinus, FaPlus, FaTrashAlt } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { openCartDrawer } from "@/app/components/cartDrawer/CartDrawer"; // new import
import { useRouter } from "next/navigation"; // updated import
import React, { Suspense } from "react"; // new import
import { useAtom } from "jotai";
import { wishlistCountState, cartItemsState } from "@/app/utils/data/store"; // Import wishlist count state and cart items state
import { FaHeart } from "react-icons/fa";

interface ShirtDetails {
  _id: string;
  price: number;
  collarName?: string;
  collarImage?: string;
  collarPrice?: number;
  collarButtonName?: string;
  collarButtonImage?: string;
  collarButtonPrice?: number;
  collarHeightName?: string;
  collarHeightImage?: string;
  collarHeightPrice?: number;
  watchCompatible?: string;

  bottomName?: string;
  bottomImage?: string;
  bottomPrice?: number;
  backName?: string;
  backImage?: string;
  backPrice?: number;
  pocketName?: string;
  pocketImage?: string;
  pocketPrice?: number;
  placketName?: string;
  placketImage?: string;
  placketPrice?: number;
  sleevesName?: string;
  sleevesImage?: string;
  sleevesPrice?: number;
  fitName?: string;
  fitImage?: string;
  fitPrice?: number;
  colorName?: string;
  colorHexCode?: string;
  fabricName?: string;
  fabricImage?: string;
  measurementCollar?: number;
  measurementHalfChest?: number;
  measurementHalfWaist?: number;
  measurementHalfHips?: number;
  measurementSleeveLength?: number;
  measurementElbow?: number;
  measurementForearm?: number;
  measurementCuff?: number;
  measurementNeck?: number;
  measurementChest?: number;
  measurementWaist?: number;
  measurementHips?: number;
  measurementElbowWidth?: number;
  measurementUpperArm?: number;
  measurementShoulder?: number;

  cuffName?: string;
  cuffImage?: string;
  cuffPrice?: number;
  collarStandName?: string;
  collarStandImage?: string;
  collarStandPrice?: number;
  patternName?: string;
  patternImage?: string;
  patternPrice?: number;
  monogramName?: string;
  monogramImage?: string;
  monogramPrice?: number;
  contrastFabricName?: string;
  contrastFabricImage?: string;
  contrastFabricPrice?: number;
  shirtCategory?: string;
  shirtDescription?: string;
}

interface CartItem {
  product: ShirtDetails;
  qty: string;
  price: number;
}

interface CartData {
  success: boolean;
  cart?: {
    products: CartItem[];
    cartTotal: number;
    totalAfterDiscount?: number;
  };
  message?: string;
}

const ShirtFeatures = ({ details }: { details: ShirtDetails }) => {
  const features = [
    { label: "Collar Style", value: details.collarName },
    { label: "Collar Button", value: details.collarButtonName },
    { label: "Collar Height", value: details.collarHeightName },
    { label: "Bottom", value: details.bottomName },
    { label: "Back", value: details.backName },
    { label: "Pocket", value: details.pocketName },
    { label: "Placket", value: details.placketName },
    { label: "Sleeves", value: details.sleevesName },
    { label: "Fit", value: details.fitName },
  ].filter((f) => f.value);

  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      {features.map((f, i) => (
        <p key={i}>
          <span className="text-gray-600">{f.label}:</span> {f.value}
        </p>
      ))}
      <p>
        <span className="text-gray-600">Watch Compatible:</span>
        {details.watchCompatible}
      </p>
    </div>
  );
};

const handleButtonClick =
  (callback: (event: React.MouseEvent) => void) =>
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      callback(event);
    };

// First, update the ShirtCompositeImage component to remove back image
const ShirtCompositeImage = ({ details }: { details: ShirtDetails }) => {
  return (
    <div className="relative w-[300px] h-[400px]">
      {/* Layer 1 - Fit */}
      {details.fitImage && (
        <Image
          src={details.fitImage}
          alt="Fit Style"
          fill
          className="object-contain absolute top-0 left-0"
        />
      )}
      {/* Layer 2 - Bottom */}
      {details.bottomImage && (
        <Image
          src={details.bottomImage}
          alt="Bottom Style"
          fill
          className="object-contain absolute top-0 left-0"
        />
      )}
      {/* Layer 3 - Placket */}
      {details.placketImage && (
        <Image
          src={details.placketImage}
          alt="Placket"
          fill
          className="object-contain absolute top-0 left-0"
        />
      )}
      {/* Layer 4 - Pocket */}
      {details.pocketImage && (
        <Image
          src={details.pocketImage}
          alt="Pocket"
          fill
          className="object-contain absolute top-0 left-0"
        />
      )}
      {/* Layer 5 - Sleeves */}
      {details.sleevesImage && (
        <Image
          src={details.sleevesImage}
          alt="Sleeves"
          fill
          className="object-contain absolute top-0 left-0"
        />
      )}
      {/* Layer 6 - Collar */}
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

const CartItem = ({
  item,
  onDelete,
  isUpdating,
  user,
  selectedItems,
  handleSelect,
}: {
  item: CartItem;
  onDelete: (id: string, event: React.MouseEvent) => Promise<void>;
  isUpdating: boolean;
  user: any;
  selectedItems: string[];
  handleSelect: (id: string, checked: boolean) => void;
}) => {
  const [details, setDetails] = useState<ShirtDetails>(item.product);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter(); // updated hook

  useEffect(() => {
    async function fetchDetails() {
      try {
        const response = await getShirtByIdInDetails(item.product._id);
        if (response?.success && response.shirt) {
          setDetails({ ...response.shirt, _id: item.product._id });
        }
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetails();
  }, [item.product]);

  const handleUpdateQuantity = async (user: any, productId: string, newQuantity: number) => {
    if (!user?.id) return;
  
    setUpdatingItem(productId);
    try {
      const response = await updateCartItemQuantity(user.id, productId, newQuantity);
      if (response.success) {
        toast.success("Quantity updated");
        setCart((prevCart) => {
          if (!prevCart) return prevCart;
            const updatedProducts: CartItem[] = prevCart.products.map((item: CartItem) =>
            item.product._id === productId ? { ...item, qty: newQuantity.toString() } : item
            );
          // Update localStorage to reflect the new quantity
          const updatedSelectedItems = updatedProducts.filter((item) =>
            selectedItems.includes(item.product._id)
          );
          localStorage.setItem("selectedCartItems", JSON.stringify(updatedSelectedItems));
          return { ...prevCart, products: updatedProducts, cartTotal: response.cart.cartTotal };
        });
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleEdit = () => {
    const url = new URL('/form-new', window.location.origin);
    url.searchParams.append('fabricName', details.fabricName || '');
    url.searchParams.append('colorHexCode', details.colorHexCode || '');
    url.searchParams.append('colorName', details.colorName || '');
    router.push(url.toString());
  };

  if (isLoading) {
    return (
      <Card className="w-full p-6 flex justify-center">
        <AiOutlineLoading3Quarters className="h-6 w-6 animate-spin" />
      </Card>
    );
  }

  function handleDelete(_id: string, event: Event | undefined) {
    throw new Error("Function not implemented.");
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg">
            {/* Custom Shirt (ID: {item.product._id}) */}
          </h3>
          <input
            type="checkbox"
            className="w-5 h-5 mt-1"
            checked={selectedItems.includes(item.product._id)}
            onChange={(e) => handleSelect(item.product._id, e.target.checked)}
          />
        </div>
        {/* Header with Price */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
          <h3 className="font-semibold text-lg">Custom Shirt (ID: {item.product._id})</h3>
          <div className="text-right">
            {/* <p className="font-bold text-lg">
              ${(item.price * parseInt(item.qty)).toFixed(2)}
            </p> */}
            <p className="text-xl text-gray-700">${item.price.toFixed(2)} each</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Composite Image and Material */}
          <div className="space-y-6">
            {/* Shirt Images Container */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Main Front View */}
                <div className="flex-1">
                  <h4 className="font-medium mb-2 text-sm sm:text-base">Front View</h4>
                  <div className="flex justify-center">
                    <div className="w-[200px] sm:w-[250px] lg:w-[300px] h-[300px] sm:h-[350px] lg:h-[400px] relative">
                      <ShirtCompositeImage details={details} />
                    </div>
                  </div>
                </div>
                
                {/* Back View */}
                {details.backImage && (
                  <div className="w-full sm:w-[150px]">
                    <h4 className="font-medium mb-2">Back View</h4>
                    <div className="relative w-full sm:w-[150px] h-[200px]">
                      <Image
                        src={details.backImage}
                        alt="Shirt Back"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Material & Color */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <h4 className="font-medium mb-2 sm:mb-4 text-sm sm:text-base">Material & Color</h4>
              <div className="flex items-center gap-3 sm:gap-4">
                {details.fabricImage && (
                  <Image
                    src={details.fabricImage}
                    alt={details.fabricName || "Fabric"}
                    width={60}
                    height={60}
                    className="rounded-md object-cover w-[50px] h-[50px] sm:w-[80px] sm:h-[80px]"
                  />
                )}
                <div>
                  <p className="text-sm sm:text-base font-medium">{details.fabricName}</p>
                  {details.colorName && (
                    <div className="flex items-center gap-2 mt-1 sm:mt-2">
                      <div
                        className="w-4 h-4 sm:w-6 sm:h-6 rounded-full border"
                        style={{ backgroundColor: details.colorHexCode }}
                      />
                      <span className="text-sm">{details.colorName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Measurements */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <h4 className="font-medium mb-2 sm:mb-4 text-sm sm:text-base">Measurements</h4>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <h5 className="font-medium mb-1 sm:mb-2 text-xs sm:text-sm">Shirt Measurements</h5>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <p>Collar: {details.measurementCollar}″</p>
                  <p>Half Chest: {details.measurementHalfChest}″</p>
                  <p>Half Waist: {details.measurementHalfWaist}″</p>
                  <p>Half Hips: {details.measurementHalfHips}″</p>
                  <p>Sleeve Length: {details.measurementSleeveLength}″</p>
                  <p>Elbow: {details.measurementElbow}″</p>
                  <p>Forearm: {details.measurementForearm}″</p>
                  <p>Cuff: {details.measurementCuff}″</p>
                  <p>Monogram Name: {details.monogramName}</p>
                  <p>Cuff Name: {details.cuffName}</p>
                  <p>Collar Button Name: {details.collarButtonName}</p>
                  <p>Bottom Name: {details.bottomName}</p>
                  <p>Back Name: {details.backName}</p>
                  <p>Pocket Name: {details.pocketName}</p>
                  <p>Placket Name: {details.placketName}</p>
                  <p>Sleeves Name: {details.sleevesName}</p>
                  <p>Fit Name: {details.fitName}</p>
                  <p>Fabric Name: {details.fabricName}</p>
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-1 sm:mb-2 text-xs sm:text-sm">Body Measurements</h5>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <p>Neck: {details.measurementNeck}″</p>
                  <p>Chest: {details.measurementChest}″</p>
                  <p>Waist: {details.measurementWaist}″</p>
                  <p>Hips: {details.measurementHips}″</p>
                  <p>Elbow Width: {details.measurementElbowWidth}″</p>
                  <p>Upper Arm: {details.measurementUpperArm}″</p>
                  <p>Shoulder: {details.measurementShoulder}″</p>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quantity Update */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const currentQty = parseInt(item.qty);
              if (currentQty <= 1) {
                handleDelete(item.product._id, event);
              } else {
                handleUpdateQuantity(user, item.product._id, currentQty - 1);
              }
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <FaMinus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center">{item.qty}</span>
          <button
            onClick={() => handleUpdateQuantity(user, item.product._id, parseInt(item.qty) + 1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <FaPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Delete Button */}
        <div className="flex justify-end items-center gap-2 sm:gap-4 pt-2 sm:pt-0">
          <Button
            size="icon"
            variant="destructive"
            className="h-8 w-8 sm:h-10 sm:w-10"
            onClick={handleButtonClick((event) => onDelete(item.product._id, event))}
            disabled={isUpdating}
          >
            <FaTrashAlt className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            size="icon"
            variant="default"
            onClick={handleEdit}
            className="play px-10 font-play "
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CartPage() {
  const { user } = useUser();
  const [cart, setCart] = useState<CartData["cart"]>(undefined);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // new state
  const [, setWishlistCount] = useAtom(wishlistCountState); // Use wishlist count state
  const [, setCartItems] = useAtom(cartItemsState); // Use cart items state

  useEffect(() => {
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const response = await getSavedCartForUser(user.id);
      if (response.success && response.cart) {
        setCart(response.cart);
        setCartItems(response.cart.products); // Update cart items state
        
        // Calculate total product count using quantity sums
        const totalCount = response.cart.products.reduce(
          (sum: number, item: { qty: any; }) => sum + Number(item.qty),
          0
        );
        setWishlistCount(totalCount);
        
        localStorage.setItem("wishlistCount", totalCount.toString());
        localStorage.setItem("cartItems", JSON.stringify(response.cart.products));
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  // Update counts on initial load
  useEffect(() => {
    const storedWishlistCount = localStorage.getItem("wishlistCount");
    const storedCartItems = localStorage.getItem("cartItems");

    if (storedWishlistCount) {
      setWishlistCount(parseInt(storedWishlistCount, 10));
    }

    if (storedCartItems) {
      setCartItems(JSON.parse(storedCartItems));
    }
  }, [setWishlistCount, setCartItems]);

  // Refresh wishlist count every 1 sec
  useEffect(() => {
    const interval = setInterval(() => {
      const storedWishlistCount = localStorage.getItem("wishlistCount");
      if (storedWishlistCount) {
        setWishlistCount(parseInt(storedWishlistCount, 10));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [setWishlistCount]);

  const handleButtonClick =
    (callback: (event: React.MouseEvent) => void) =>
      (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        callback(event);
      };

  const handleDelete = async (productId: string, event: React.MouseEvent) => {
    if (!user?.id) return;

    setUpdatingItem(productId);
    try {
      const response = await deleteShirtFromCart(user.id, productId);
      if (response.success) {
        toast.success("Item removed from cart");
        setCart((prevCart) => {
          if (!prevCart) return prevCart;
          const updatedProducts = prevCart.products.filter(
            (item) => item.product._id !== productId
          );
          const updatedCart = {
            ...prevCart,
            products: updatedProducts,
            cartTotal: response.cart.cartTotal,
          };
          // Update localStorage to remove deleted items if they are selected
          const updatedSelectedItems = updatedCart.products.filter((item) =>
            selectedItems.includes(item.product._id)
          );
          localStorage.setItem(
            "selectedCartItems",
            JSON.stringify(updatedSelectedItems)
          );
          return updatedCart;
        });
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleSelect = (productId: string, checked: boolean) => {
    setSelectedItems((prev) =>
      checked ? [...prev, productId] : prev.filter((id) => id !== productId)
    );
  };

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one order to proceed."); // Use toast for the alert message
      localStorage.removeItem("selectedCartItems"); // Clear selected items if none are selected
    } else {
      const filteredItems = cart?.products?.filter((item) =>
        selectedItems.includes(item.product._id)
      ).map((item) => ({
        ...item,
        qty: "1" // Set quantity to 1 by default
      }));

      // Retrieve existing items from localStorage
      const existingItems = JSON.parse(localStorage.getItem("selectedCartItems") || "[]");

      // Merge new selected items with existing items, incrementing quantity if product ID is the same
      const updatedItems = [...existingItems];
      filteredItems?.forEach((newItem) => {
        const existingItemIndex = updatedItems.findIndex(item => item.product._id === newItem.product._id);
        if (existingItemIndex !== -1) {
          updatedItems[existingItemIndex].qty = (parseInt(updatedItems[existingItemIndex].qty) + 1).toString();
        } else {
          updatedItems.push(newItem);
        }
      });

      localStorage.setItem(
        "selectedCartItems",
        JSON.stringify(updatedItems)
      );
      setWishlistCount(updatedItems.length); // Update wishlist count
      openCartDrawer();
    }
  };
  const subtotal = cart?.cartTotal || 0;
  const tax = subtotal * 0.1; // Assuming a 10% tax rate
  const totalWithTax = subtotal + tax;

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!cart?.products?.length) {
    return (
      <div className="min-h-screen pt-16 flex flex-col items-center justify-center">
        <p className="text-lg text-gray-600 mb-4">Your wish list is empty</p>
        <Link href="/customize">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <ToastContainer /> {/* Add ToastContainer here */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center mt-10">
        Shopping Wish list
      </h1>
      <div className="space-y-4 sm:space-y-6">
        {cart.products.map((item) => (
          <Suspense key={item.product._id} fallback={<AiOutlineLoading3Quarters className="h-8 w-8 animate-spin" />}>
            <CartItem
              item={item}
              onDelete={handleDelete}
              isUpdating={updatingItem === item.product._id}
              user={user}
              selectedItems={selectedItems}
              handleSelect={handleSelect}
            />
          </Suspense>
        ))}
        <div className="mt-6 sm:mt-8 border-t pt-4 sm:pt-6">
          <div className="flex flex-col items-end gap-2">
            <p className="text-xl sm:text-2xl font-bold">
              Total: ${cart.cartTotal.toFixed(2)}
            </p>
            {/* {cart.totalAfterDiscount !== undefined && (
              <p className="text-lg sm:text-xl text-green-600">
                Discounted Total: ${cart.totalAfterDiscount.toFixed(2)}
              </p>
            )} */}
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleProceedToCheckout();
              }}
              className="w-full sm:w-auto"
            >
              <Button size="lg" className="mt-4 w-full font-play px-10 font-bold bg-red-700  sm:w-auto">
                Proceed to cartDrawer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function setUpdatingItem(arg0: string | null) {
  throw new Error("Function not implemented.");
}
function setCart(arg0: (prevCart: any) => any) {
  throw new Error("Function not implemented.");
}

