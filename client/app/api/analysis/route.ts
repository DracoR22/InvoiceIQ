import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { cardStatementsSchema, invoicesSchema, receiptsSchema } from "@/lib/llm/schema";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { text, category, json } = await req.json();

  if (!text || !category || !json) {
    return NextResponse.json(
      { error: "No text, category, or json provided" },
      { status: 400 }
    );
  }

  let schema = {};

  switch (category) {
    case "receipts":
      schema = receiptsSchema;
      break;
    case "invoices":
      schema = invoicesSchema;
      break;
    case "credit card statements": {
      schema = cardStatementsSchema;
      break;
    }
    default:
      return NextResponse.json(
        { error: "Invalid category provided" },
        { status: 400 }
      );
  }

  const res = await fetch(`http://localhost:3001/v1/organized-data/json/analysis`, {
      method: "POST",
      headers: {
        "X-API-Key": process.env.X_API_KEY as string,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: {
          apiKey: process.env.OPENAI_API_KEY as string,
          name: "gpt-3.5-turbo",
        },
        jsonSchema: JSON.stringify(schema),
        originalText: text,
        jsonOutput: json,
      }),
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: res.statusText }, { status: res.status });
  }
  const { analysis } = await res.json();

  return NextResponse.json(analysis, { status: 200 });
}