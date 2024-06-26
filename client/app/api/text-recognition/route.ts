import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { Status } from "@prisma/client";

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
  
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const userUUID = session?.user.id;
    const { uuid, text } = await req.json();
  
    if (!uuid || !text) {
      return NextResponse.json(
        { error: "No UUID nor text provided" },
        { status: 400 }
      );
    }
  
    const updateExtraction = await prisma?.extraction.updateMany({
      where: {
        id: uuid,
        userId: userUUID,
        status: Status.TO_RECOGNIZE,
      },
      data: {
        text,
        status: Status.TO_EXTRACT,
      },
    });
  
    if (!updateExtraction?.count) {
      return NextResponse.json(
        { error: "Extraction not found or not updated" },
        { status: 404 }
      );
    }
  
    return NextResponse.json({ message: "Extraction updated" }, { status: 200 });
  }