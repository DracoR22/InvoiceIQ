import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contentType = req.headers.get('content-type')

    if (!contentType?.includes("multipart/form-data")) {
        return NextResponse.json({ error: "Content type must be multipart form data" }, { status: 400 })
    }

    try {
        const formData = await req.formData()
        const file = formData.get("file")

        if (!file) {
            return NextResponse.json({ error: "No file" }, { status: 400 })
        }

        return NextResponse.json({ message: "File uplaoded" }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: "Could not parse content as formData" }, { status: 500 })
    }
}