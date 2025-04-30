import { NextResponse } from "next/server";
import { getSavedCartForUser, updateCartItemQuantity, deleteAllCart } from "@/lib/database/actions/cart.actions";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const clerkId = userId || body.clerkId;
    const { productId, newQty } = body;
    if (!clerkId || !productId || newQty == null) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }
    const result = await updateCartItemQuantity(clerkId, productId, Number(newQty));
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const clerkId = userId || searchParams.get("clerkId");
    if (!clerkId) {
      return NextResponse.json({ success: false, message: "Missing clerkId" }, { status: 401 });
    }
    const result = await getSavedCartForUser(clerkId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const clerkId = userId || searchParams.get("clerkId");
    if (!clerkId) {
      return NextResponse.json({ success: false, message: "Missing clerkId" }, { status: 401 });
    }
    const result = await deleteAllCart(clerkId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}