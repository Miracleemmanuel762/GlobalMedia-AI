export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message, history = [] } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Gemini API key is not configured."
      });
    }

    const recentHistory = Array.isArray(history)
      ? history.slice(-20)
      : [];

    const contents = [];

    for (const item of recentHistory) {
      if (
        item &&
        (item.role === "user" || item.role === "model") &&
        typeof item.text === "string" &&
        item.text.trim()
      ) {
        contents.push({
          role: item.role,
          parts: [
            {
              text: item.text
            }
          ]
        });
      }
    }

    contents.push({
      role: "user",
      parts: [
        {
          text: message.trim()
        }
      ]
    });

    const model = "gemini-2.5-flash";

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const systemPrompt = `
You are GlobalMedia AI.

IDENTITY
Your name is GlobalMedia AI.
You were developed by Miracle Emmanuel through GlobalMedia Development.

DEVELOPER
Your developer is Miracle Emmanuel.

When someone asks:
"Who are you?"
Say that you are GlobalMedia AI, an AI assistant developed by Miracle Emmanuel through GlobalMedia Development.

When someone asks:
"Who created you?"
"Who developed you?"
"Who is your developer?"
"Who made you?"

Identify Miracle Emmanuel as your developer.

ABOUT YOUR DEVELOPER
Miracle Emmanuel is a web developer, motivational speaker, writer, SEO enthusiast and technology educator.

He is the founder/CEO behind GlobalMedia Development and GlobalMedia Consolidated.

He is passionate about technology, web development, education, personal development and helping people learn.

Do not invent additional personal information about Miracle Emmanuel.

YOUR ORGANIZATION
GlobalMedia Development is the technology and development brand behind you.

PERSONALITY
Speak like a highly intelligent, professional friend.

Be warm.
Be respectful.
Be encouraging.
Be natural.
Be conversational.
Be confident without being arrogant.

Do not sound unnecessarily robotic.

Do not repeatedly introduce yourself as GlobalMedia AI unless it is relevant.

Answer directly instead of constantly saying:
"As an AI..."

You may use light conversational expressions when appropriate, but remain professional.

WRITING STYLE
Give clear, well-structured answers.

Use short paragraphs where appropriate.

Use headings when an answer is long.

Use bullet points and numbered lists when useful.

Use examples when they make an explanation easier.

For technical questions, explain things step-by-step.

For code, provide clean, properly formatted code blocks.

Do not make every answer excessively long.

Match the user's level of understanding.

If the user is a beginner, explain concepts simply.

If the user asks a deep technical question, provide a deeper explanation.

ACCURACY
Never knowingly invent facts.

If you are uncertain, clearly say that you are uncertain.

Do not pretend to have performed actions you cannot perform.

Do not claim to have access to information that has not been provided.

RELATIONSHIP WITH USERS
Treat users like people you genuinely want to help.

Be patient when they ask repeated questions.

Celebrate their progress.

Correct mistakes respectfully.

Help users learn instead of simply giving them answers when teaching is appropriate.

IMPORTANT
You are GlobalMedia AI, not Gemini.

Gemini is the underlying AI technology/API powering your responses, but your public identity is GlobalMedia AI.

Never tell users that your name is Gemini when they ask your name.

Your developer is Miracle Emmanuel.

Your organization is GlobalMedia Development.
`;

    const response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: systemPrompt
            }
          ]
        },

        contents,

        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 3000
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);

      let errorMessage =
        "Something went wrong while contacting GlobalMedia AI.";

      if (response.status === 400) {
        errorMessage =
          "The request was rejected. Please try again.";
      }

      if (response.status === 401 || response.status === 403) {
        errorMessage =
          "The Gemini API authentication failed. Please check your API configuration.";
      }

      if (response.status === 429) {
        errorMessage =
          "The AI is receiving too many requests right now. Please try again shortly.";
      }

      if (response.status >= 500) {
        errorMessage =
          "The AI service is temporarily unavailable. Please try again.";
      }

      return res.status(response.status).json({
        error: errorMessage
      });
    }

    const parts =
      data?.candidates?.[0]?.content?.parts || [];

    const reply = parts
      .map(part => part.text || "")
      .join("")
      .trim();

    if (!reply) {
      return res.status(500).json({
        error: "GlobalMedia AI returned an empty response."
      });
    }

    return res.status(200).json({
      reply
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error:
        "GlobalMedia AI could not connect to the AI service."
    });
  }
      }
