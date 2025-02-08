"use client";

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
  onUpdateQuantity,
  onDelete,
  isUpdating,
}: {
  item: CartItem;
  onUpdateQuantity: (
    id: string,
    qty: number,
    event: React.MouseEvent
  ) => Promise<void>;
  onDelete: (id: string, event: React.MouseEvent) => Promise<void>;
  isUpdating: boolean;
}) => {
  const [details, setDetails] = useState<ShirtDetails>(item.product);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const response = await getShirtByIdInDetails(item.product._id);
        if (response?.success && response.shirt) {
          setDetails(response.shirt);
        }
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetails();
  }, [item.product]);

  if (isLoading) {
    return (
      <Card className="w-full p-6 flex justify-center">
        <AiOutlineLoading3Quarters className="h-6 w-6 animate-spin" />
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        {/* Header with Price */}
        <div className="flex justify-between">
          <h3 className="font-semibold text-lg">Custom Shirt</h3>
          <div className="text-right">
            <p className="font-bold text-lg">
              ${(item.price * parseInt(item.qty)).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Composite Image and Material */}
          <div className="space-y-6">
            {/* Shirt Images Container */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex gap-4">
                {/* Main Front View */}
                <div className="flex-1">
                  <h4 className="font-medium mb-2">Front View</h4>
                  <ShirtCompositeImage details={details} />
                </div>
                
                {/* Back View */}
                {details.backImage && (
                  <div className="w-[150px]">
                    <h4 className="font-medium mb-2">Back View</h4>
                    <div className="relative w-[150px] h-[200px]">
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-4">Material & Color</h4>
              <div className="flex items-center gap-4">
                {details.fabricImage && (
                  <Image
                    src={details.fabricImage}
                    alt={details.fabricName || "Fabric"}
                    width={80}
                    height={80}
                    className="rounded-md object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">{details.fabricName}</p>
                  {details.colorName && (
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: details.colorHexCode }}
                      />
                      <span>{details.colorName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Measurements */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-4">Measurements</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Shirt Measurements</h5>
                <div className="space-y-2 text-sm">
                  <p>Collar: {details.measurementCollar}″</p>
                  <p>Half Chest: {details.measurementHalfChest}″</p>
                  <p>Half Waist: {details.measurementHalfWaist}″</p>
                  <p>Half Hips: {details.measurementHalfHips}″</p>
                  <p>Sleeve Length: {details.measurementSleeveLength}″</p>
                  <p>Elbow: {details.measurementElbow}″</p>
                  <p>Forearm: {details.measurementForearm}″</p>
                  <p>Cuff: {details.measurementCuff}″</p>
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-2">Body Measurements</h5>
                <div className="space-y-2 text-sm">
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

        {/* Quantity Controls */}
        <div className="flex justify-end items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={handleButtonClick((event) =>
                onUpdateQuantity(item.product._id, parseInt(item.qty) - 1, event)
              )}
              disabled={isUpdating || parseInt(item.qty) <= 1}
            >
              <FaMinus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center">
              {isUpdating ? (
                <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" />
              ) : (
                item.qty
              )}
            </span>
            <Button
              size="icon"
              variant="outline"
              onClick={handleButtonClick((event) =>
                onUpdateQuantity(item.product._id, parseInt(item.qty) + 1, event)
              )}
              disabled={isUpdating}
            >
              <FaPlus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            size="icon"
            variant="destructive"
            onClick={handleButtonClick((event) => onDelete(item.product._id, event))}
            disabled={isUpdating}
          >
            <FaTrashAlt className="h-4 w-4" />
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
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick =
    (callback: (event: React.MouseEvent) => void) =>
      (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        callback(event);
      };

  const updateQuantity = async (
    productId: string,
    newQty: number,
    event: React.MouseEvent
  ) => {
    if (!user?.id) return;

    setUpdatingItem(productId);
    try {
      const response = await updateCartItemQuantity(user.id, productId, newQty);
      if (response.success && response.cart) {
        setCart((prevCart) => {
          if (!prevCart) return prevCart;
          const updatedProducts = prevCart.products.map((item) =>
            item.product._id === productId
              ? { ...item, qty: newQty.toString() }
              : item
          );
          return {
            ...prevCart,
            products: updatedProducts,
            cartTotal: response.cart.cartTotal,
          };
        });
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
      if (response.success) {
        toast.success("Item removed from cart");
        setCart((prevCart) => {
          if (!prevCart) return prevCart;
          const updatedProducts = prevCart.products.filter(
            (item) => item.product._id !== productId
          );
          return {
            ...prevCart,
            products: updatedProducts,
            cartTotal: response.cart.cartTotal,
          };
        });
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    } finally {
      setUpdatingItem(null);
    }
  };

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
        <p className="text-lg text-gray-600 mb-4">Your cart is empty</p>
        <Link href="/customize">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="space-y-6">
        {cart.products.map((item) => (
          <CartItem
            key={item.product._id}
            item={item}
            onUpdateQuantity={updateQuantity}
            onDelete={handleDelete}
            isUpdating={updatingItem === item.product._id}
          />
        ))}

        <div className="mt-8 border-t pt-6">
          <div className="flex flex-col items-end gap-2">
            <p className="text-2xl font-bold">
              Total: ${cart.cartTotal.toFixed(2)}
            </p>
            {cart.totalAfterDiscount !== undefined && (
              <p className="text-xl text-green-600">
                Discounted Total: ${cart.totalAfterDiscount.toFixed(2)}
              </p>
            )}
            <Link href="/checkout">
              <Button size="lg" className="mt-4">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}