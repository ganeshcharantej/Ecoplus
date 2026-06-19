import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transport, energy, diet, total } = body;

    // Validate request inputs
    if (
      transport === undefined ||
      energy === undefined ||
      diet === undefined ||
      total === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required footprint breakdown metrics." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY environment variable is not configured on the server. Please add it to your environment variables.",
        },
        { status: 500 }
      );
    }

    // Format metrics to 2 decimal places for cleaner prompting
    const transportFormatted = Number(transport).toFixed(2);
    const energyFormatted = Number(energy).toFixed(2);
    const dietFormatted = Number(diet).toFixed(2);
    const totalFormatted = Number(total).toFixed(2);

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // We use the stable gemini-2.5-flash model for fast, high-quality responses
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are an environmental sustainability coach.",
    });

    const prompt = `A user has a carbon footprint of ${totalFormatted} MTCO2e. Breakdown: ${transportFormatted} MTCO2e from driving, ${energyFormatted} MTCO2e from electricity, and ${dietFormatted} MTCO2e from diet. Provide exactly 3 highly actionable, encouraging bullet points to help them reduce their specific highest-emitting areas.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2500,
        temperature: 0.7,
      },
    });

    const text = result.response.text();

    return NextResponse.json({ insights: text });
  } catch (error) {
    console.error("Error in Gemini API route:", error);
    const message = error instanceof Error ? error.message : "An error occurred while generating insights.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
