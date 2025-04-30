"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PayPalButton } from "@/app/components/PayPal/PayPalButton";
import { useUser } from "@clerk/nextjs";
import { FaSpinner } from "react-icons/fa";
import { createOrder } from "@/lib/database/actions/order.actions";
import { toast, ToastContainer } from "react-toast";

const PaypalPage = () => {
  const router = useRouter();
  const { isLoaded, user, isSignedIn } = useUser();
  const [cart, setCart] = useState<any>(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState<string>("");
  const [processingOrder, setProcessingOrder] = useState(false);

  // Load checkout context
  const [deliveryAddress, setDeliveryAddress] = useState<any>(null);
  const [couponInfo, setCouponInfo] = useState<any>(null);
  const [summaryInfo, setSummaryInfo] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedAddress = localStorage.getItem("deliveryAddress");
      if (storedAddress) {
        try {
          setDeliveryAddress(JSON.parse(storedAddress));
        } catch (e) {}
      }

      const storedCoupon = localStorage.getItem("checkoutCoupon");
      if (storedCoupon) {
        try {
          setCouponInfo(JSON.parse(storedCoupon));
        } catch (e) {}
      }

      const storedSummary = localStorage.getItem("checkoutSummary");
      if (storedSummary) {
        try {
          setSummaryInfo(JSON.parse(storedSummary));
        } catch (e) {}
      }
    }
  }, []);

  useEffect(() => {
    async function fetchCart() {
      if (!isLoaded || !user) return;
      try {
        const storedSelected = localStorage.getItem("selectedCartItems");
        if (storedSelected) {
          const items = JSON.parse(storedSelected);
          if (items.length > 0) {
            const cartTotal = items.reduce(
              (sum: number, item: any) =>
                sum + (Number(item.price) || 0) * (parseInt(item.qty, 10) || 1),
              0
            );
            setCart({ products: items, cartTotal });
            setCartLoading(false);
            return;
          }
        }

        const res = await fetch(`/api/cart?clerkId=${user.id}`);
        const data = await res.json();
        if (data.success && data.cart) {
          setCart(data.cart);
        } else {
          setCartError(data.message || "Error fetching cart");
        }
      } catch (error) {
        setCartError("Error fetching cart");
      } finally {
        setCartLoading(false);
      }
    }
    fetchCart();
  }, [isLoaded, user]);

  const handleSuccess = async (paypalOrder: any) => {
    if (!user) return;
    setProcessingOrder(true);
    try {
      const products = cart?.products || [];
      const address = deliveryAddress || {
        name: user.fullName || "Customer",
        phoneNumber: "",
        address1: "Address on file",
        city: "",
        state: "",
        country: "India",
        zipCode: "",
      };

      const subtotal = summaryInfo?.subtotal || cart?.cartTotal || 0;
      const total = summaryInfo?.total || cart?.cartTotal || 0;
      const discount = summaryInfo?.discount || 0;
      const couponCode = couponInfo?.couponCode || "";
      const txnId = paypalOrder?.id || paypalOrder?.purchase_units?.[0]?.payments?.captures?.[0]?.id || "PAYPAL_PAID";

      const orderResponse = await createOrder(
        products,
        address,
        "paypal",
        total,
        subtotal,
        couponCode,
        user.id,
        discount,
        `PayPal Txn: ${txnId}`
      );

      if (orderResponse.success && orderResponse.orderId) {
        localStorage.removeItem("selectedCartItems");
        localStorage.removeItem("checkoutCoupon");
        localStorage.removeItem("checkoutSummary");
        router.push(`/order/${orderResponse.orderId}`);
      } else {
        setCartError(orderResponse.message || "Payment processed, but order creation failed. Please contact support.");
        setProcessingOrder(false);
      }
    } catch (err: any) {
      console.error("Error creating order after PayPal capture:", err);
      setCartError(err.message || "Failed to create order record.");
      setProcessingOrder(false);
    }
  };

  if (!isSignedIn) return <div className="pt-36 text-center font-play">Please sign in to proceed with checkout.</div>;

  if (cartLoading || processingOrder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-play">
        <FaSpinner className="h-10 w-10 animate-spin text-[#C40600] mb-4" />
        <p className="text-gray-600">
          {processingOrder ? "Finalizing your order and generating receipt..." : "Loading payment details..."}
        </p>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-play px-4">
        <p className="text-red-500 mb-4">{cartError}</p>
        <button
          onClick={() => router.push("/checkout")}
          className="bg-[#C40600] text-white px-6 py-2 rounded-lg"
        >
          Return to Checkout
        </button>
      </div>
    );
  }

  // Calculate the amount to charge via PayPal
  const finalAmount = summaryInfo?.total
    ? Number(summaryInfo.total).toFixed(2)
    : cart?.cartTotal
    ? Number(cart.cartTotal).toFixed(2)
    : "0.00";

  return (
    <div className="container mx-auto pt-36 font-play max-w-lg px-4">
      <ToastContainer />
      <h1 className="text-3xl text-center text-[#646464] font-bold mb-4">
        PayPal Payment
      </h1>
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 border">
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold">${(summaryInfo?.subtotal || cart?.cartTotal || 0).toFixed(2)}</span>
        </div>
        {summaryInfo?.discount > 0 && (
          <div className="flex justify-between py-2 border-b text-green-600">
            <span>Discount ({couponInfo?.couponCode})</span>
            <span>-${summaryInfo.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between py-3 text-lg font-bold">
          <span>Amount to Pay</span>
          <span className="text-[#C40600]">${finalAmount}</span>
        </div>
      </div>
      <PayPalButton amount={finalAmount} onSuccess={handleSuccess} />
    </div>
  );
};

export default PaypalPage;