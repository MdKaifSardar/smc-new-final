import { NextResponse } from "next/server";
import { createShirt } from "@/lib/database/actions/admin/ShirtArea/Shirt/shirt.actions";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Extract necessary fields from the request body
    const {
      price,
      bottom,
      back,
      sleeves,
      cuffstyle,
      cufflinks,
      collarstyle,
      collarheight,
      collarbutton,
      placket,
      pocket,
      fit,
      watchCompatible,
      colorId,
      fabricId,
    } = body;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const result = await createShirt(
      price,
      bottom,
      back,
      sleeves,
      cuffstyle,
      cufflinks,
      collarstyle,
      collarheight,
      collarbutton,
      placket,
      pocket,
      fit,
      watchCompatible,
      colorId,
      fabricId,
      userId
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error creating shirt." },
      { status: 500 }
    );
  }
}