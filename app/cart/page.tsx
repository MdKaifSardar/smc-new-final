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
import { mutate } from "swr";

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
  // Shirt Measurements:
  measurementCollar?: number;
  measurementHalfChest?: number;
  measurementHalfWaist?: number;
  measurementHalfHips?: number;
  measurementYoke?: number;
  measurementHalfArmhole?: number;
  measurementHalfBicep?: number;
  measurementCuff?: number;
  measurementSleeveLength?: number;
  measurementShirtLength?: number;
  // Body Measurements:
  measurementNeck?: number;
  measurementChest?: number;
  measurementWaist?: number;
  measurementHips?: number;
  measurementShoulder?: number;
  measurementArmhole?: number;
  measurementBicep?: number;
  measurementWrist?: number;
  measurementBreastPoint?: number;
  measurementWaistPoint?: number;
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
  onUpdateQuantity,
  isUpdating,
  user,
  selectedItems,
  handleSelect,
}: {
  item: CartItem;
  onDelete: (id: string, event: React.MouseEvent) => Promise<void>;
  onUpdateQuantity: (id: string, newQty: number) => Promise<void>;
  isUpdating: boolean;
  user: any;
  selectedItems: string[];
  handleSelect: (id: string, checked: boolean) => void;
}) => {
  const [details, setDetails] = useState<ShirtDetails>(item.product);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

  const handleEdit = () => {
    const url = new URL("/form-new", window.location.origin);
    url.searchParams.append("fabricName", details.fabricName || "");
    url.searchParams.append("colorHexCode", details.colorHexCode || "");
    url.searchParams.append("colorName", details.colorName || "");
    router.push(url.toString());
  };

  if (isLoading) {
    return (
      <Card className="w-full p-6 flex justify-center">
        <AiOutlineLoading3Quarters className="h-6 w-6 animate-spin" />
      </Card>
    );
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
          <h3 className="font-semibold text-lg">
            Custom Shirt (ID: {item.product._id})
          </h3>
          <div className="text-right">
            {/* <p className="font-bold text-lg">
              ${(item.price * parseInt(item.qty)).toFixed(2)}
            </p> */}
            <p className="text-xl text-gray-700">
              ${item.price.toFixed(2)} each
            </p>
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
                  <h4 className="font-medium mb-2 text-sm sm:text-base">
                    Front View
                  </h4>
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
              <h4 className="font-medium mb-2 sm:mb-4 text-sm sm:text-base">
                Material & Color
              </h4>
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
                  <p className="text-sm sm:text-base font-medium">
                    {details.fabricName}
                  </p>
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
            <h4 className="font-medium mb-2 sm:mb-4 text-sm sm:text-base">
              Measurements
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <h5 className="font-medium mb-1 sm:mb-2 text-xs sm:text-sm">
                  Shirt Measurements
                </h5>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  {[
                    { label: "Collar", value: details.measurementCollar },
                    {
                      label: "Half Chest",
                      value: details.measurementHalfChest,
                    },
                    {
                      label: "Half Waist",
                      value: details.measurementHalfWaist,
                    },
                    { label: "Half Hips", value: details.measurementHalfHips },
                    { label: "Yoke", value: details.measurementYoke },
                    {
                      label: "Half Armhole",
                      value: details.measurementHalfArmhole,
                    },
                    {
                      label: "Half Bicep",
                      value: details.measurementHalfBicep,
                    },
                    { label: "Cuff", value: details.measurementCuff },
                    {
                      label: "Sleeve Length",
                      value: details.measurementSleeveLength,
                    },
                    {
                      label: "Shirt Length",
                      value: details.measurementShirtLength,
                    },
                  ]
                    .filter((m) => m.value != null)
                    .map((m, i) => (
                      <p key={i}>
                        {m.label}: {m.value}″
                      </p>
                    ))}
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-1 sm:mb-2 text-xs sm:text-sm">
                  Body Measurements
                </h5>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  {[
                    { label: "Neck", value: details.measurementNeck },
                    { label: "Chest", value: details.measurementChest },
                    { label: "Waist", value: details.measurementWaist },
                    { label: "Hips", value: details.measurementHips },
                    { label: "Shoulder", value: details.measurementShoulder },
                    { label: "Armhole", value: details.measurementArmhole }, // added
                    { label: "Bicep", value: details.measurementBicep }, // added
                    { label: "Wrist", value: details.measurementWrist },
                    {
                      label: "Breast Point",
                      value: details.measurementBreastPoint,
                    },
                    {
                      label: "Waist Point",
                      value: details.measurementWaistPoint,
                    },
                  ]
                    .filter((m) => m.value != null)
                    .map((m, i) => (
                      <p key={i}>
                        {m.label}: {m.value}″
                      </p>
                    ))}
                </div>
              </div>
            </div>
            {/* Shirt Style Details */}
            <div className="bg-gray-50 mt-[1rem] rounded-lg">
              <h4 className="font-medium mb-[.5rem] text-sm sm:text-base">
                Shirt Style Details
              </h4>
              <ShirtFeatures details={details} />
            </div>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-md bg-white">
              <button
                type="button"
                disabled={isUpdating || (parseInt(item.qty, 10) || 1) <= 1}
                onClick={(e) => {
                  e.preventDefault();
                  const currentQty = parseInt(item.qty, 10) || 1;
                  if (currentQty > 1) {
                    onUpdateQuantity(item.product._id, currentQty - 1);
                  }
                }}
                className="p-2 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                title="Decrease quantity"
              >
                <FaMinus className="w-3 h-3 text-gray-600" />
              </button>
              <span className="px-3 py-1 font-semibold text-sm min-w-[2.5rem] text-center">
                {item.qty}
              </span>
              <button
                type="button"
                disabled={isUpdating}
                onClick={(e) => {
                  e.preventDefault();
                  const currentQty = parseInt(item.qty, 10) || 1;
                  onUpdateQuantity(item.product._id, currentQty + 1);
                }}
                className="p-2 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                title="Increase quantity"
              >
                <FaPlus className="w-3 h-3 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">Item Total: </span>
            <span className="text-base font-bold text-gray-800">
              ${(item.price * (parseInt(item.qty, 10) || 1)).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Delete Button */}
        <div className="flex justify-end items-center gap-2 sm:gap-4 pt-2 sm:pt-0">
          <Button
            size="icon"
            variant="destructive"
            className="h-8 w-8 sm:h-10 sm:w-10"
            onClick={handleButtonClick((event) =>
              onDelete(item.product._id, event)
            )}
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
  const router = useRouter();
  const [cart, setCart] = useState<CartData["cart"]>(undefined);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [, setWishlistCount] = useAtom(wishlistCountState);
  const [, setCartItems] = useAtom(cartItemsState);

  const fetchCart = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const response = await getSavedCartForUser(user.id);
      if (response.success && response.cart) {
        setCart(response.cart);
        setCartItems(response.cart.products);

        // Select all items by default on initial load
        const itemIds = response.cart.products.map((p: any) => p.product._id);
        setSelectedItems(itemIds);

        const totalCount = response.cart.products.reduce(
          (sum: number, item: { qty: any }) => sum + (parseInt(item.qty, 10) || 1),
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

  useEffect(() => {
    fetchCart();
  }, [user]);

  const handleButtonClick =
    (callback: (event: React.MouseEvent) => void) =>
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      callback(event);
    };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (!user?.id) return;

    setUpdatingItem(productId);
    try {
      const response = await updateCartItemQuantity(user.id, productId, newQuantity);
      if (response.success && response.cart) {
        setCart(response.cart);
        setCartItems(response.cart.products);

        const totalCount = response.cart.products.reduce(
          (sum: number, item: any) => sum + (parseInt(item.qty, 10) || 1),
          0
        );
        setWishlistCount(totalCount);
        localStorage.setItem("wishlistCount", totalCount.toString());
        localStorage.setItem("cartItems", JSON.stringify(response.cart.products));

        const updatedSelected = response.cart.products.filter((item: any) =>
          selectedItems.includes(item.product._id)
        );
        localStorage.setItem("selectedCartItems", JSON.stringify(updatedSelected));
        mutate(["cart", user.id]);

        toast.success("Quantity updated");
      } else {
        toast.error(response.message || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleDelete = async (productId: string, event: React.MouseEvent) => {
    if (!user?.id) return;

    setUpdatingItem(productId);
    try {
      const response = await deleteShirtFromCart(user.id, productId);
      if (response.success && response.cart) {
        toast.success("Item removed from cart");
        setCart(response.cart);
        setCartItems(response.cart.products);

        setSelectedItems((prev) => prev.filter((id) => id !== productId));

        const totalCount = response.cart.products.reduce(
          (sum: number, item: any) => sum + (parseInt(item.qty, 10) || 1),
          0
        );
        setWishlistCount(totalCount);
        localStorage.setItem("wishlistCount", totalCount.toString());
        localStorage.setItem("cartItems", JSON.stringify(response.cart.products));

        const updatedSelected = response.cart.products.filter((item: any) =>
          selectedItems.includes(item.product._id) && item.product._id !== productId
        );
        localStorage.setItem("selectedCartItems", JSON.stringify(updatedSelected));
        mutate(["cart", user.id]);
      } else {
        toast.error(response.message || "Failed to remove item");
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
      toast.error("Please select at least one item to proceed to checkout.");
      return;
    }

    const filteredItems = cart?.products?.filter((item) =>
      selectedItems.includes(item.product._id)
    );

    if (!filteredItems || filteredItems.length === 0) {
      toast.error("Selected items not found in cart.");
      return;
    }

    localStorage.setItem("selectedCartItems", JSON.stringify(filteredItems));
    router.push("/checkout");
  };

  // Calculate selected total dynamically
  const selectedTotal =
    cart?.products
      ?.filter((item) => selectedItems.includes(item.product._id))
      ?.reduce(
        (sum, item) => sum + item.price * (parseInt(item.qty, 10) || 1),
        0
      ) || 0;

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
        <p className="text-xl text-gray-600 mb-4 font-play">Your shopping cart is empty</p>
        <Link href="/form-new">
          <Button className="bg-[#C40600] text-white hover:bg-[#a00500] font-play px-8 py-3">
            Start Designing
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8">
      <ToastContainer />
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center mt-10 font-play">
        Shopping Cart
      </h1>
      <div className="space-y-4 sm:space-y-6">
        {cart.products.map((item) => (
          <Suspense
            key={item.product._id}
            fallback={
              <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin" />
            }
          >
            <CartItem
              item={item}
              onDelete={handleDelete}
              onUpdateQuantity={handleUpdateQuantity}
              isUpdating={updatingItem === item.product._id}
              user={user}
              selectedItems={selectedItems}
              handleSelect={handleSelect}
            />
          </Suspense>
        ))}
        <div className="mt-6 sm:mt-8 border-t pt-4 sm:pt-6 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">
                {selectedItems.length} of {cart.products.length} item(s) selected for checkout
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                Selected Total: ${selectedTotal.toFixed(2)}
              </p>
            </div>
            <Button
              size="lg"
              disabled={selectedItems.length === 0}
              onClick={handleProceedToCheckout}
              className="w-full sm:w-auto font-play px-10 font-bold bg-[#C40600] text-white hover:bg-[#a00500] disabled:opacity-50 transition-colors"
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
