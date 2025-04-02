import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Google Generative AI SDK with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const { difficulty, type, wordCount } = await request.json()

    // Select the appropriate model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Create prompt based on the type and difficulty
    let prompt = ""
    let targetWordCount = wordCount || 50 // Default to 50 words if not specified

    // Adjust word count based on difficulty if not explicitly provided
    if (!wordCount) {
      switch (difficulty) {
        case "easy":
          targetWordCount = 20
          break
        case "medium":
          targetWordCount = 50
          break
        case "hard":
          targetWordCount = 100
          break
        case "expert":
          targetWordCount = 150
          break
      }
    }

    // Create appropriate prompts based on content type
    if (type === "quotes") {
      prompt = `Generate an inspiring or thought-provoking quote that is approximately ${targetWordCount} words long. The quote should be coherent, meaningful, and suitable for a typing test. Do not include attribution or quotation marks.`
    } else if (type === "paragraphs") {
      prompt = `Write a coherent paragraph about an interesting topic. The paragraph should be approximately ${targetWordCount} words long and suitable for a typing test. Make it engaging and informative.`
    } else {
      prompt = `Generate a coherent and interesting text that is approximately ${targetWordCount} words long. The text should be suitable for a typing test.`
    }

    // Generate content using Gemini
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ content: text })
  } catch (error) {
    console.error("Error generating text:", error)
    return NextResponse.json(
      {
        error: "Failed to generate text",
        content: "The AI text generation service is currently unavailable. Please try again later.",
      },
      { status: 500 },
    )
  }
}

