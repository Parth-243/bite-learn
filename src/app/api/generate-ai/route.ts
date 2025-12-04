import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

interface SummaryPoint {
  [key: string]: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
}

interface AIResponse {
  summary: SummaryPoint[] | string[];
  quiz: QuizQuestion[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid text field" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are an educational AI that generates short summaries and MCQ quizzes in JSON. Always respond with ONLY valid JSON, no additional text.",
        },
        {
          role: "user",
          content: `Based on the following educational content, generate a summary and quiz in JSON format:

Content: ${text}

Please respond with ONLY this JSON structure (no markdown, no extra text):
{
  "summary": ["point 1", "point 2", "point 3"],
  "quiz": [
    {
      "question": "Question 1?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0
    }
  ]
}

Generate 3-5 summary points and 3-5 quiz questions. Ensure answerIndex is 0-3.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const rawText = completion.choices[0]?.message?.content;

    if (!rawText) {
      console.error("No content in Groq response");
      return NextResponse.json(
        { error: "Failed to generate AI content" },
        { status: 500 }
      );
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = rawText;
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const parsed: AIResponse = JSON.parse(jsonText);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error generating AI content:", error);
    return NextResponse.json(
      { error: "Failed to generate AI content" },
      { status: 500 }
    );
  }
}
