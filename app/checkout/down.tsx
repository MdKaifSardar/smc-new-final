import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { getShirtById } from "@/lib/database/actions/admin/ShirtArea/Shirt/shirt.actions";

interface OrderAddress {
  address1: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderProduct {
  _id?: string;
  productId?: string;
  product?: string;
  name?: string;
  qty: string;
  price: string | number;
  options?: { [key: string]: string };
}

interface Order {
  _id: string; // Ensure order ID is included
  orderConfirmation: boolean;
  deliveryStatus: string;
  price: number;
  deliveryCost: number;
  paymentMethod: string;
  paymentTime: string;
  receipt: string;
  orderAddress?: OrderAddress;
  products: OrderProduct[];
}

// Dummy productDetails lookup; replace with your actual data source
const productDetails: Record<string, any> = {
  // ...existing product details...
};

export const downloadPDF = async (order: Order) => {
  // Get detailed shirt information for each product
  const detailedProducts = await Promise.all(
    order.products.map(async (product) => {
      const shirtDetails = await getShirtById(product.product?.toString() ?? '');
      return {
        ...product,
        shirtDetails: shirtDetails.success ? shirtDetails.shirt : null,
      };
    })
  );

  const doc = new jsPDF();

  // Title and header section remains the same
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Clouth My Shirt", 105, 20, { align: "center" });

  doc.setFontSize(18);
  doc.setFont("helvetica", "normal");
  doc.text("Order Details", 105, 30, { align: "center" });

  // Order details
  doc.setFontSize(12);
  let yPosition = 40;

  // Basic order information
  const orderInfo = [
    [`Order ID: ${order._id}`],
    [`Order Status: ${order.orderConfirmation ? "Confirmed" : "Not Confirmed"}`],
    [`Delivery Status: ${order.deliveryStatus}`],
    [`Total Amount: ₹${order.price}`],
    [`Delivery Cost: ₹${order.deliveryCost}`],
    [`Payment Method: ${order.paymentMethod}`],
    [`Payment Time: ${new Date(order.paymentTime).toLocaleString()}`],
  ];

  orderInfo.forEach((info) => {
    doc.text(info[0], 20, yPosition);
    yPosition += 10;
  });

  // Shipping address
  if (order.orderAddress) {
    yPosition += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Shipping Address:", 20, yPosition);
    yPosition += 10;
    doc.setFont("helvetica", "normal");
    const address = [
      order.orderAddress.address1,
      order.orderAddress.address2,
      `${order.orderAddress.city}, ${order.orderAddress.state}`,
      `${order.orderAddress.zipCode}, ${order.orderAddress.country}`,
      `Phone: ${order.orderAddress.phoneNumber}`,
    ].filter(Boolean);

    address.forEach(line => {
      doc.text(line, 20, yPosition);
      yPosition += 7;
    });
  }

  // Product details
  detailedProducts.forEach((product, index) => {
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Product ${index + 1} Details`, 20, yPosition);
    yPosition += 15;

    console.log(product);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    const shirtDetails = product.product;

    if (shirtDetails) {
      const shirtInfo = [
        ["Base Price", `₹${product.price}`],
        ["Quantity", product.qty],
        ["Collar Style", shirtDetails.collarStyle?.name],
        ["Collar Height", shirtDetails.collarHeight?.name],
        ["Collar Button", shirtDetails.collarButton?.name],
        ["Bottom Style", shirtDetails.bottom?.name],
        ["Back Style", shirtDetails.back?.name],
        ["Pocket Style", shirtDetails.pocket?.name],
        ["Sleeve Style", shirtDetails.sleeves?.name],
        ["Fit Type", shirtDetails.fit?.name],
        ["Watch Compatible", shirtDetails.watchCompatible ? "Yes" : "No"],
        ["Total Price", `₹${Number(product.price) * Number(product.qty)}`],
      ].filter(([_, value]) => value !== undefined);

      shirtInfo.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, 20, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(`${value}`, 80, yPosition);
        yPosition += 10;
      });

      // Add price breakdown
      yPosition += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Price Breakdown:", 20, yPosition);
      yPosition += 10;
      doc.setFont("helvetica", "normal");

      const priceDetails = [
        ["Collar Style", shirtDetails.collarStyle?.price],
        ["Collar Height", shirtDetails.collarHeight?.price],
        ["Collar Button", shirtDetails.collarButton?.price],
        ["Bottom Style", shirtDetails.bottom?.price],
        ["Back Style", shirtDetails.back?.price],
        ["Pocket", shirtDetails.pocket?.price],
        ["Sleeves", shirtDetails.sleeves?.price],
        ["Fit", shirtDetails.fit?.price],
      ].filter(([_, price]) => price !== undefined);

      priceDetails.forEach(([component, price]) => {
        doc.text(`${component}: ₹${price}`, 20, yPosition);
        yPosition += 7;
      });
    }
  });

  // Footer
  doc.addPage();
  yPosition = 20;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Thank you for shopping with us!", 105, yPosition, { align: "center" });
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("For any queries, please contact our customer support.", 105, yPosition, { align: "center" });

  // Save the PDF
  doc.save(`order-${order._id}.pdf`);
};
