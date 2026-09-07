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
        error: "Gemini API key is not configured on the server."
      });
    }

    /*
      Keep only recent messages.
      This prevents the conversation from becoming unnecessarily large.
    */
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

    /*
      Gemini model.
      If Google changes the available model, this can be updated here.
    */
    const model = "gemini-2.5-flash";

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text:
                `You are GlobalMedia AI, an intelligent, helpful and professional AI assistant developed by GlobalMedia Development.

Your job is to provide useful, accurate and easy-to-understand answers.

Be friendly and natural in conversation.

When explaining technical topics, explain them clearly and step-by-step.

If the user asks for code, provide clean, properly formatted code.

Do not claim to be a human.

If you are uncertain about something, say so instead of inventing information.`
            }
          ]
        },

        contents: contents,

        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);

      let errorMessage = "Something went wrong while contacting Gemini.";

      if (response.status === 400) {
        errorMessage = "Gemini rejected the request. Please check the message or API configuration.";
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = "Gemini API authentication failed. Please check your API key.";
      } else if (response.status === 429) {
        errorMessage = "Gemini API rate limit reached. Please try again shortly.";
      } else if (response.status >= 500) {
        errorMessage = "Gemini is temporarily unavailable. Please try again.";
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
        error: "Gemini returned an empty response."
      });
    }

    return res.status(200).json({
      reply
    });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Unable to connect to GlobalMedia AI right now."
    });
  }
  }
