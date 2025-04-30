"use server";

import { connectToDatabase } from "../connect";
import Cart from "../models/cart.model";
import User from "../models/user.model";
import ShirtModel from "../models/shirtModel/ShirtModel";
import mongoose from "mongoose";
import { getShirtById } from "./admin/ShirtArea/Shirt/shirt.actions";
import { getUserById } from "@/lib/database/actions/user.actions";

export async function addShirtToCart(shirtId: string, clerkId: string, quantity: number = 1) {
  try {
    await connectToDatabase();

    if (!clerkId) {
      throw new Error("ClerkId is required");
    }

    // Find or create user record to guarantee user is registered in MongoDB
    let userRecord = await User.findOne({ clerkId });
    if (!userRecord) {
      userRecord = await User.create({
        clerkId,
        firstName: "User",
        lastName: "",
        email: `${clerkId}@clouth.local`,
      });
    }

    // Verify shirt exists
    const shirtResponse = await getShirtById(shirtId);
    if (!shirtResponse || !shirtResponse.success || !shirtResponse.shirt) {
      throw new Error("Shirt not found");
    }

    const shirtPrice = Number(shirtResponse.shirt.price) || 0;
    const qtyToAdd = Math.max(1, Number(quantity) || 1);

    // Find or create cart for user
    let cart = await Cart.findOne({ user: userRecord._id });
    if (!cart) {
      cart = new Cart({
        user: userRecord._id,
        products: [],
        cartTotal: 0,
      });
    }

    // Check if product already in cart
    const existingIndex = cart.products.findIndex((item: any) => {
      const id = item.product?._id ? item.product._id.toString() : item.product?.toString();
      return id === shirtId;
    });

    if (existingIndex > -1) {
      const currentQty = parseInt(cart.products[existingIndex].qty || "1", 10) || 1;
      cart.products[existingIndex].qty = (currentQty + qtyToAdd).toString();
      cart.products[existingIndex].price = shirtPrice;
    } else {
      cart.products.push({
        product: shirtId,
        qty: qtyToAdd.toString(),
        price: shirtPrice,
      });
    }

    // Recalculate cart total
    cart.cartTotal = cart.products.reduce(
      (total: number, item: any) =>
        total + (Number(item.price) || 0) * (parseInt(item.qty, 10) || 1),
      0
    );

    await cart.save();

    return {
      success: true,
      message: "Added to cart successfully",
      cart: JSON.parse(JSON.stringify(cart)),
    };
  } catch (error: any) {
    console.error("Error in addShirtToCart:", error);
    return {
      success: false,
      message: error.message || "Failed to add to cart",
    };
  }
}

export async function getSavedCartForUser(clerkId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId }).lean();
    if (!user) {
      return { success: true, cart: { products: [], cartTotal: 0 } };
    }

    const cart: any = await Cart.findOne({ user: (user as any)._id })
      .populate({
        path: "products.product",
        model: "Shirt",
        populate: [
          { path: "colorId" },
          { path: "fabricId" },
          { path: "monogramId" },
          { path: "measurementId" },
        ],
      })
      .lean();

    if (!cart) {
      return { success: true, cart: { products: [], cartTotal: 0 } };
    }

    // Clean valid populated products
    const validProducts = (cart.products || []).filter(
      (item: any) => item && item.product != null
    );

    cart.products = validProducts;
    cart.cartTotal = validProducts.reduce(
      (total: number, item: any) =>
        total + (Number(item.price) || 0) * (parseInt(item.qty, 10) || 1),
      0
    );

    const plainCart = JSON.parse(JSON.stringify(cart));
    return { success: true, cart: plainCart };
  } catch (error: any) {
    console.error("Error fetching cart:", error);
    return { success: false, message: error.message || "Error fetching cart" };
  }
}

export async function updateCartItemQuantity(
  clerkId: string,
  productId: string,
  newQty: number
) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId }).lean();
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const cart = await Cart.findOne({ user: (user as any)._id });
    if (!cart) {
      return { success: true, cart: null };
    }

    const index = cart.products.findIndex((item: any) => {
      const prodId = item.product?._id
        ? item.product._id.toString()
        : item.product?.toString();
      return prodId === productId;
    });

    if (index === -1) {
      return { success: false, message: "Product not in cart" };
    }

    if (newQty <= 0) {
      cart.products.splice(index, 1);
    } else {
      cart.products[index].qty = Math.floor(newQty).toString();
    }

    cart.cartTotal = cart.products.reduce(
      (total: number, item: any) =>
        total + (Number(item.price) || 0) * (parseInt(item.qty, 10) || 1),
      0
    );

    await cart.save();
    return { success: true, cart: JSON.parse(JSON.stringify(cart)) };
  } catch (error: any) {
    return { success: false, message: error.message || "Error updating cart" };
  }
}

export async function deleteShirtFromCart(clerkId: string, productId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      return { success: false, message: "Cart not found" };
    }

    cart.products = cart.products.filter((item: any) => {
      const prodId = item.product?._id
        ? item.product._id.toString()
        : item.product?.toString();
      return prodId !== productId;
    });

    cart.cartTotal = cart.products.reduce(
      (total: number, item: any) =>
        total + (Number(item.price) || 0) * (parseInt(item.qty, 10) || 1),
      0
    );

    await cart.save();
    return { success: true, cart: JSON.parse(JSON.stringify(cart)) };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Error removing product from cart",
    };
  }
}

export async function removeOrderedItemsFromCart(clerkId: string, productIds: string[]) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      return { success: true, cart: null };
    }

    const idSet = new Set(productIds.map((id) => id.toString()));

    cart.products = cart.products.filter((item: any) => {
      const prodId = item.product?._id
        ? item.product._id.toString()
        : item.product?.toString();
      return !idSet.has(prodId);
    });

    cart.cartTotal = cart.products.reduce(
      (total: number, item: any) =>
        total + (Number(item.price) || 0) * (parseInt(item.qty, 10) || 1),
      0
    );

    if (cart.products.length === 0) {
      cart.totalAfterDiscount = 0;
    }

    await cart.save();
    return { success: true, cart: JSON.parse(JSON.stringify(cart)) };
  } catch (error: any) {
    console.error("Error removing ordered items from cart:", error);
    return { success: false, message: error.message || "Error updating cart" };
  }
}

export async function deleteAllCart(clerkId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      return { success: false, message: "Cart not found" };
    }

    cart.products = [];
    cart.cartTotal = 0;
    cart.totalAfterDiscount = 0;

    await cart.save();

    return {
      success: true,
      message: "Cart cleared successfully",
      cart: JSON.parse(JSON.stringify(cart)),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Error clearing cart",
    };
  }
}
