"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaSpinner, FaBoxOpen } from "react-icons/fa";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFabricById } from "@/lib/database/actions/admin/ShirtArea/Fabric/fabric.actions";
import { format } from "date-fns";
import { useUser } from "@clerk/nextjs";
import { getUserOrders } from "@/lib/database/actions/order.actions";
<<<<<<< HEAD
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/components/ui/badge"
// Replace lucide-react icons with react-icons
import { FaSpinner, FaBoxOpen } from "react-icons/fa";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { getShirtByIdInDetails } from "@/lib/database/actions/admin/ShirtArea/Shirt/shirt.actions";
=======
import { getMeasurementById } from "@/lib/database/actions/measurement.actions";
>>>>>>> 1bd052d92ad6ea9406c46105092745f901357613

// Types
interface OrderProduct {
  product: {
    _id: string;
    price: number;
    name: string;
    image?: string;
    fabricId?: string | { _id: string; name: string; type: string };
    colorId?: { name: string };
    measurementId?: {
      // Shirt measurements
      collar: number;
      cuff: number;
      elbow: number;
      forearm: number;
      halfChest: number;
      halfHips: number;
      halfWaist: number;
      sleevesLength: number;
      // Body measurements
      chest: number;
      elbowWidth: number;
      hips: number;
      neck: number;
      shoulder: number;
      upperArm: number;
      waist: number;
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
    delivered: "bg-green-100 text-green-800",
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
    cash_on_delivery: "Cash on Delivery",
  };

  return (
    <Badge variant="outline" className="capitalize">
      {displayNames[method]}
    </Badge>
  );
};

// First, add the ShirtCompositeImage component
const ShirtCompositeImage = ({ details }: { details: any }) => {
  return (
    <div className="relative w-[250px] h-[350px]">
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

// Update the OrderCard component
const OrderCard = ({ order }: { order: Order }) => {
<<<<<<< HEAD
  const [shirtDetails, setShirtDetails] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShirtDetails = async () => {
      try {
        const details = await Promise.all(
          order.products.map(async (item) => {
            const response = await getShirtByIdInDetails(item.product._id);
            return {
              id: item.product._id,
              details: response?.success ? response.shirt : null
            };
          })
        );
        
        const detailsMap = details.reduce((acc, curr) => {
          if (curr.details) {
            acc[curr.id] = curr.details;
          }
          return acc;
        }, {} as Record<string, any>);
        
        setShirtDetails(detailsMap);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shirt details:', error);
        setLoading(false);
      }
    };

    fetchShirtDetails();
  }, [order.products]);

  if (loading) {
    return (
      <Card className="w-full p-6">
        <div className="flex justify-center">
          <FaSpinner className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }
=======
  const [fabricDetails, setFabricDetails] = useState<{ [key: string]: any }>({});
  const [measurementDetails, setMeasurementDetails] = useState<{ [key: string]: any }>({});

  // Fetch fabric details for each product using the dedicated function.
  useEffect(() => {
    async function fetchFabricDetails() {
      const details: { [key: string]: any } = {};
      for (const item of order.products) {
        if (item.product && item.product.fabricId) {
          // Extract an id string from fabricId whether it's a string or an object.
          const fabricId =
            typeof item.product.fabricId === "string"
              ? item.product.fabricId
              : item.product.fabricId._id;
          if (!details[fabricId]) {
            try {
              const response = await getFabricById(fabricId);
              if (response.success) {
                details[fabricId] = response.fabric;
              }
            } catch (error) {
              console.error("Error fetching fabric:", error);
            }
          }
        }
      }
      setFabricDetails(details);
    }
    fetchFabricDetails();
  }, [order]);

  // Fetch measurement details for each product using the dedicated function.
  // useEffect(() => {
  //   async function fetchMeasurements() {
  //     const details: { [key: string]: any } = {};
  //     for (const item of order.products) {
  //       if (item.product && item.product.measurementId) {
  //         const measurementId = typeof item.product.measurementId === 'string'
  //           ? item.product.measurementId
  //           : item.product.measurementId._id;

  //         console.log("measurementId : " , measurementId);
  //         if (!details[measurementId]) {
  //           try {
  //             const measurement = await getMeasurementById(measurementId);
  //             details[measurementId] = measurement;
  //           } catch (error) {
  //             console.error("Error fetching measurement:", error);
  //           }
  //         }
  //       }
  //     }
  //     setMeasurementDetails(details);
  //   }
  //   fetchMeasurements();
  // }, [order]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return "Date not available";
    }
  };
>>>>>>> 1bd052d92ad6ea9406c46105092745f901357613

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Keep existing order header */}
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <div>
            <Link href={`/order/${order._id}`} className="font-medium hover:underline">
              Order ID: {order._id}
            </Link>
            <p className="text-sm text-gray-500">
              Placed on {(order.createdAt)}
            </p>
            <div className="mt-2">
              <DeliveryStatusBadge status={order.deliveryStatus} />
            </div>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <p className="font-medium">Total: ₹{order.cartTotal.toFixed(2)}</p>
            {order.totalAfterDiscount < order.cartTotal && (
              <p className="text-sm text-green-600">
                Discounted: ₹{order.totalAfterDiscount.toFixed(2)}
              </p>
            )}
            <div className="mt-2">
              <PaymentMethodBadge method={order.paymentMethod} />
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* Updated Products List */}
        {order.products.map((item, index) => (
          item.product && shirtDetails[item.product._id] && (
            <div key={index} className="border-t pt-4 mb-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Images and Material */}
                <div className="space-y-6">
                  {/* Shirt Images */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex gap-4">
                      {/* Front View */}
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">Front View</h4>
                        <ShirtCompositeImage details={shirtDetails[item.product._id]} />
                      </div>
                      
                      {/* Back View */}
                      {shirtDetails[item.product._id].backImage && (
                        <div className="w-[120px]">
                          <h4 className="font-medium mb-2">Back View</h4>
                          <div className="relative w-[120px] h-[170px]">
                            <Image
                              src={shirtDetails[item.product._id].backImage}
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
                    <h4 className="font-medium mb-2">Material & Color</h4>
                    <div className="flex items-center gap-4">
                      {shirtDetails[item.product._id].fabricImage && (
                        <Image
                          src={shirtDetails[item.product._id].fabricImage}
                          alt={shirtDetails[item.product._id].fabricName || "Fabric"}
                          width={60}
                          height={60}
                          className="rounded-md object-cover"
                        />
                      )}
                      <div>
                        <p>{shirtDetails[item.product._id].fabricName}</p>
                        {shirtDetails[item.product._id].colorName && (
                          <div className="flex items-center gap-2 mt-2">
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: shirtDetails[item.product._id].colorHexCode }}
                            />
                            <span>{shirtDetails[item.product._id].colorName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Measurements */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Measurements</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium mb-1">Shirt Measurements</h5>
                          <div className="space-y-2 text-sm">
                            <p>Collar: {shirtDetails[item.product._id].measurementCollar}″</p>
                            <p>Half Chest: {shirtDetails[item.product._id].measurementHalfChest}″</p>
                            <p>Half Waist: {shirtDetails[item.product._id].measurementHalfWaist}″</p>
                            <p>Half Hips: {shirtDetails[item.product._id].measurementHalfHips}″</p>
                            <p>Sleeve Length: {shirtDetails[item.product._id].measurementSleeveLength}″</p>
                            <p>Elbow: {shirtDetails[item.product._id].measurementElbow}″</p>
                            <p>Forearm: {shirtDetails[item.product._id].measurementForearm}″</p>
                            <p>Cuff: {shirtDetails[item.product._id].measurementCuff}″</p>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium mb-1">Body Measurements</h5>
                          <div className="space-y-2 text-sm">
                            <p>Neck: {shirtDetails[item.product._id].measurementNeck}″</p>
                            <p>Chest: {shirtDetails[item.product._id].measurementChest}″</p>
                            <p>Waist: {shirtDetails[item.product._id].measurementWaist}″</p>
                            <p>Hips: {shirtDetails[item.product._id].measurementHips}″</p>
                            <p>Elbow Width: {shirtDetails[item.product._id].measurementElbowWidth}″</p>
                            <p>Upper Arm: {shirtDetails[item.product._id].measurementUpperArm}″</p>
                            <p>Shoulder: {shirtDetails[item.product._id].measurementShoulder}″</p>
=======
        {/* Products List */}
        {order.products.map((item, index) =>
          item.product ? (
            <div key={index} className="border-t pt-4 mb-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Product Details</h3>
                  <div className="space-y-1 text-sm">
                    <p>Name: {item.product.name || "Custom Shirt"}</p>
                    <p>Quantity: {item.qty}</p>
                    <p>Price per item: ₹{item.price}</p>
                    {item.product.fabricId && (
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const fabricId =
                            typeof item.product.fabricId === "string"
                              ? item.product.fabricId
                              : item.product.fabricId._id;
                          const fabric = fabricDetails[fabricId];
                          return fabric && fabric.image?.url ? (
                            <img
                              src={fabric.image.url}
                              alt={fabric.fabricName}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : null;
                        })()}
                        <p>
                          Fabric:{" "}
                          {(() => {
                            const fabricId =
                              typeof item.product.fabricId === "string"
                                ? item.product.fabricId
                                : item.product.fabricId._id;
                            const fabric = fabricDetails[fabricId];
                            return fabric?.fabricName || (typeof item.product.fabricId !== "string"
                              ? item.product.fabricId.name
                              : "N/A");
                          })()}
                        </p>
                      </div>
                    )}
                    {/* {item.product.colorId && (
                      <p>Color: {item.product.colorId.name}</p>
                    )} */}
                  </div>
                </div>

                {/* Measurements Section */}
                {/* {item.product.measurementId && (() => {
                  const measurementId = typeof item.product.measurementId === 'string'
                    ? item.product.measurementId
                    : item.product.measurementId._id;
                  const measurement = measurementDetails[measurementId];

                  return measurement ? (
                    <div>
                      <h4 className="font-medium mb-1">Measurements</h4>
                      <div className="text-sm grid grid-cols-2 gap-2">
                        <div>
                          <h5 className="font-medium text-gray-600 mb-1">Shirt Measurements</h5>
                          <div className="space-y-1">
                            <p>Collar: {measurement.collar ?? "N/A"}″</p>
                            <p>Cuff: {measurement.cuff ?? "N/A"}″</p>
                            <p>Elbow: {measurement.elbow ?? "N/A"}″</p>
                            <p>Forearm: {measurement.forearm ?? "N/A"}″</p>
                            <p>Half Chest: {measurement.halfChest ?? "N/A"}″</p>
                            <p>Half Hips: {measurement.halfHips ?? "N/A"}″</p>
                            <p>Half Waist: {measurement.halfWaist ?? "N/A"}″</p>
                            <p>Sleeves Length: {measurement.sleevesLength ?? "N/A"}″</p>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-600 mb-1">Body Measurements</h5>
                          <div className="space-y-1">
                            <p>Chest: {measurement.chest ?? "N/A"}″</p>
                            <p>Elbow Width: {measurement.elbowWidth ?? "N/A"}″</p>
                            <p>Hips: {measurement.hips ?? "N/A"}″</p>
                            <p>Neck: {measurement.neck ?? "N/A"}″</p>
                            <p>Shoulder: {measurement.shoulder ?? "N/A"}″</p>
                            <p>Upper Arm: {measurement.upperArm ?? "N/A"}″</p>
                            <p>Waist: {measurement.waist ?? "N/A"}″</p>
>>>>>>> 1bd052d92ad6ea9406c46105092745f901357613
                          </div>
                        </div>
                      </div>
                  </div>

                  {/* Order Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Order Details</h4>
                    <div className="space-y-1 text-sm">
                      <p>Quantity: {item.qty}</p>
                      <p>Price per item: ₹{item.price}</p>
                      <p>Total: ₹{(parseInt(item.qty) * item.price).toFixed(2)}</p>
                    </div>
<<<<<<< HEAD
                  </div>
                </div>
=======
                  ) : (
                    <div className="text-sm text-gray-500">Loading measurements...</div>
                  );
                })()} */}
>>>>>>> 1bd052d92ad6ea9406c46105092745f901357613
              </div>
            </div>
          ) : null
        )}

        {/* Keep existing shipping and payment details */}
        <div className="border-t pt-4 grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Shipping Address</h3>
            <div className="text-sm space-y-1">
              <p>{order.orderAddress.address1}</p>
              {order.orderAddress.address2 && <p>{order.orderAddress.address2}</p>}
              <p>
                {order.orderAddress.city}, {order.orderAddress.state}{" "}
                {order.orderAddress.zipCode}
              </p>
              <p>{order.orderAddress.country}</p>
              <p>Phone: {order.orderAddress.phoneNumber}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div>
            <h3 className="font-medium mb-2">Payment Details</h3>
            <div className="text-sm space-y-1">
              <p>Payment Date: {(order.paymentTime)}</p>
              <p>Delivery Cost: ₹{order.deliveryCost.toFixed(2)}</p>
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
        // Direct call to the server action
        const response = await getUserOrders(user.id);
        if (response.success && response.orders) {
          setOrders(response.orders);
        } else {
          console.error("Failed to fetch orders:", response.message);
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
    <div className="min-h-screen pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </div>
  );
}

