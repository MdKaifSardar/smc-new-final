"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getUserOrders } from "@/lib/database/actions/order.actions";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/components/ui/badge"
// Replace lucide-react icons with react-icons
import { FaSpinner, FaBoxOpen } from "react-icons/fa";
import { format } from "date-fns";
import Link from "next/link";

// Types
interface OrderProduct {
  product: {
    _id: string;
    price: number;
    name: string;
    image?: string;
    fabricId?: { name: string; type: string };
    colorId?: { name: string };
    measurementId?: {
      collar: number;
      chest: number;
      waist: number;
      sleevesLength: number;
    };
  };
  qty: string;
  price: number;
}

interface Order {
  _id: string;
  products: OrderProduct[];
  cartTotal: number;
  totalAfterDiscount: number;
  orderConfirmation: boolean;
  deliveryStatus: "pending" | "shipped" | "delivered";
  price: number;
  deliveryCost: number;
  paymentMethod: "credit_card" | "debit_card" | "paypal" | "cash_on_delivery";
  paymentTime: string;
  receipt: string;
  orderAddress: {
    phoneNumber: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    active: boolean;
  };
  createdAt: string;
}

// Status Badge Component
const DeliveryStatusBadge = ({ status }: { status: Order["deliveryStatus"] }) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800"
  };

  return (
    <Badge className={`${statusColors[status]} capitalize`}>
      {status}
    </Badge>
  );
};

// Payment Method Badge Component
const PaymentMethodBadge = ({ method }: { method: Order["paymentMethod"] }) => {
  const displayNames = {
    credit_card: "Credit Card",
    debit_card: "Debit Card",
    paypal: "PayPal",
    cash_on_delivery: "Cash on Delivery"
  };

  return (
    <Badge variant="outline" className="capitalize">
      {displayNames[method]}
    </Badge>
  );
};

// Order Card Component
const OrderCard = ({ order }: { order: Order }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return 'Date not available';
    }
  };

  return (
    <Card key={order._id} className="w-full">
      <CardContent className="p-4 sm:p-6">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row justify-between mb-4 sm:mb-6">
          <div>
            <Link href={`/order/${order._id}`} className="font-medium hover:underline text-sm sm:text-base">
              Order ID: {order._id}
            </Link>
            <p className="text-xs sm:text-sm text-gray-500">
              Placed on {formatDate(order.createdAt)}
            </p>
            <div className="mt-2">
              <DeliveryStatusBadge status={order.deliveryStatus} />
            </div>
          </div>
          <div className="mt-3 sm:mt-0 text-left sm:text-right">
            <p className="font-medium text-sm sm:text-base">Total: ${order.cartTotal.toFixed(2)}</p>
            {order.totalAfterDiscount < order.cartTotal && (
              <p className="text-xs sm:text-sm text-green-600">
                Discounted: ${order.totalAfterDiscount.toFixed(2)}
              </p>
            )}
            <div className="mt-2">
              <PaymentMethodBadge method={order.paymentMethod} />
            </div>
          </div>
        </div>

        {/* Products List */}
        {order.products.map((item, index) => (
          item.product && (
            <div key={index} className="border-t pt-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Left Column - Product & Material Details */}
                <div className="space-y-4">
                  {/* Product Details Card */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-base md:text-lg mb-3">Product Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm md:text-base">
                      <div className="space-y-2">
                        <p className="text-gray-600">Name:</p>
                        <p className="text-gray-600">Quantity:</p>
                        <p className="text-gray-600">Price:</p>
                      </div>
                      <div className="space-y-2 text-right">
                        <p className="font-medium">{item.product.name || 'Custom Shirt'}</p>
                        <p className="font-medium">{item.qty}</p>
                        <p className="font-medium">₹{item.price}</p>
                      </div>
                    </div>
                  </div>

                  {/* Material Details Card */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-base md:text-lg mb-3">Material Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm md:text-base">
                      {item.product.fabricId && (
                        <>
                          <p className="text-gray-600">Fabric:</p>
                          <p className="text-right font-medium">
                            {item.product.fabricId.name} ({item.product.fabricId.type})
                          </p>
                        </>
                      )}
                      {item.product.colorId && (
                        <>
                          <p className="text-gray-600">Color:</p>
                          <p className="text-right font-medium">{item.product.colorId.name}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Measurements */}
                <div className="space-y-4">
                  {/* Measurements Card */}
                  {item.product.measurementId && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-base md:text-lg mb-3">Measurements</h4>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm md:text-base">Collar:</span>
                          <span className="font-medium text-sm md:text-base">
                            {item.product.measurementId.collar}″
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm md:text-base">Chest:</span>
                          <span className="font-medium text-sm md:text-base">
                            {item.product.measurementId.chest}″
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm md:text-base">Waist:</span>
                          <span className="font-medium text-sm md:text-base">
                            {item.product.measurementId.waist}″
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm md:text-base">Sleeves:</span>
                          <span className="font-medium text-sm md:text-base">
                            {item.product.measurementId.sleevesLength}″
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Notes Card */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-base md:text-lg mb-3">Order Notes</h4>
                    <div className="text-sm md:text-base text-gray-600 space-y-1">
                      <p>• All measurements are in inches</p>
                      <p>• Custom alterations available upon request</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        ))}

        {/* Shipping & Payment Details */}
        <div className="border-t pt-4 grid sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h3 className="font-medium mb-2 text-sm sm:text-base">Shipping Address</h3>
            <div className="text-xs sm:text-sm space-y-1">
              <p>{order.orderAddress.address1}</p>
              {order.orderAddress.address2 && <p>{order.orderAddress.address2}</p>}
              <p>{order.orderAddress.city}, {order.orderAddress.state} {order.orderAddress.zipCode}</p>
              <p>{order.orderAddress.country}</p>
              <p>Phone: {order.orderAddress.phoneNumber}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2 text-sm sm:text-base">Payment Details</h3>
            <div className="text-xs sm:text-sm space-y-1">
              <p>Payment Date: {formatDate(order.paymentTime)}</p>
              <p>Delivery Cost: ${order.deliveryCost.toFixed(2)}</p>
              {order.receipt && <p>Receipt Number: {order.receipt}</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main History Page Component
export default function OrderHistory() {
  const { user, isLoaded } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await getUserOrders(user.id);
        if (response.success && response.orders) {
          setOrders(response.orders);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded) {
      fetchOrders();
    }
  }, [user, isLoaded]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <FaSpinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <p className="text-gray-500">Please sign in to view your order history</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <FaBoxOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No orders found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Order History</h1>
      <div className="space-y-4 sm:space-y-6">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </div>
  );
}