import OpenAI from "openai";
import type { GameRecommendation } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  
  return openaiClient;
}

const fallbackRecommendations: GameRecommendation[] = [
  {
    title: "Poki",
    url: "https://poki.com",
    description: "Free online games platform with thousands of browser games including action, puzzle, and multiplayer titles.",
    genre: "Multi-genre",
    reason: "One of the largest free gaming portals with constantly updated content",
  },
  {
    title: "CrazyGames",
    url: "https://www.crazygames.com",
    description: "Browser-based games featuring .io games, racing, shooting, and sports titles.",
    genre: "Action",
    reason: "Great selection of HTML5 games that run smoothly in any browser",
  },
  {
    title: "Miniclip",
    url: "https://www.miniclip.com",
    description: "Classic gaming portal with iconic titles like 8 Ball Pool and Agar.io.",
    genre: "Casual",
    reason: "Long-running gaming site with beloved classic games",
  },
  {
    title: "Armor Games",
    url: "https://armorgames.com",
    description: "Indie game platform featuring unique strategy, RPG, and adventure games.",
    genre: "Strategy",
    reason: "Known for high-quality indie browser games",
  },
  {
    title: "Kongregate",
    url: "https://www.kongregate.com",
    description: "Gaming community with achievements, chat, and thousands of free games.",
    genre: "RPG",
    reason: "Active community with game ratings and achievements system",
  },
  {
    title: "itch.io",
    url: "https://itch.io",
    description: "Indie game marketplace and platform with unique experimental games.",
    genre: "Indie",
    reason: "Discover creative indie games from independent developers",
  },
];

export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export function getFallbackRecommendations(): GameRecommendation[] {
  return fallbackRecommendations;
}

export async function getGameRecommendations(
  browsingHistory: string[]
): Promise<GameRecommendation[]> {
  const openai = getOpenAIClient();
  
  if (!openai) {
    return fallbackRecommendations;
  }

  try {
    const historyContext = browsingHistory.length > 0
      ? `The user has recently visited these gaming sites: ${browsingHistory.slice(0, 10).join(", ")}`
      : "The user is new and hasn't visited any gaming sites yet.";

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a gaming expert who recommends browser-based gaming websites. 
Based on the user's browsing history, suggest relevant gaming sites they might enjoy.
Return your response as a JSON object with an array called "recommendations".
Each recommendation should have: title, url, description, genre, and reason.
Focus on legitimate, safe, browser-based gaming websites like Poki, CrazyGames, Miniclip, etc.
Provide 6-8 varied recommendations across different genres.`,
        },
        {
          role: "user",
          content: `${historyContext}

Please recommend some gaming websites. Return JSON in this format:
{
  "recommendations": [
    {
      "title": "Site Name",
      "url": "https://example.com",
      "description": "Brief description of the site",
      "genre": "Genre (e.g., Action, Puzzle, Racing)",
      "reason": "Why this is recommended based on history or general appeal"
    }
  ]
}`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return fallbackRecommendations;
    }

    const parsed = JSON.parse(content);
    return parsed.recommendations || fallbackRecommendations;
  } catch (error) {
    console.error("OpenAI error:", error);
    return fallbackRecommendations;
  }
}
