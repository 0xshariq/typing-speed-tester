import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

// Initialize the Google Generative AI SDK with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const { difficulty, type, language } = await request.json()

    // Select the appropriate model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    // Create prompts based on the type and difficulty
    let prompt = ""
    let wordCount = 0

    // Set word count based on difficulty
    switch (difficulty) {
      case "easy":
        wordCount = 20
        break
      case "medium":
        wordCount = 50
        break
      case "hard":
        wordCount = 100
        break
      case "expert":
        wordCount = 150
        break
      default:
        wordCount = 50
    }

    // Create appropriate prompts based on content type
    if (type === "quotes") {
      prompt = `Generate an inspiring or thought-provoking quote that is approximately ${wordCount} words long. The quote should be coherent, meaningful, and suitable for a typing test. Do not include attribution or quotation marks.`
    } else if (type === "paragraphs") {
      prompt = `Write a coherent paragraph about an interesting topic. The paragraph should be approximately ${wordCount} words long and suitable for a typing test. Make it engaging and informative.`
    } else if (type === "code") {
      prompt = `Generate a code snippet in ${language} that demonstrates a common programming pattern or algorithm. The code should be approximately ${wordCount} words when counted as text and should be syntactically correct. Include comments to explain the code.`
    } else {
      prompt = `Generate a coherent and interesting text that is approximately ${wordCount} words long. The text should be suitable for a typing test.`
    }

    // Generate content using Gemini
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ content: text })
  } catch (error) {
    console.error("Error generating text:", error)
    return NextResponse.json({ error: "Failed to generate text" }, { status: 500 })
  }
}

