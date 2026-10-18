import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Lazy initialized Gemini client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Natural language meal breakdown endpoint
app.post('/api/analyze-meal', async (req, res) => {
  try {
    const { mealDescription } = req.body;
    if (!mealDescription || typeof mealDescription !== 'string') {
      return res.status(400).json({ error: 'Meal description is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY not configured. Use the manual search or add key in Settings > Secrets.',
      });
    }

    const prompt = `You are a clinical cardiovascular nutritionist. Analyze the following meal description for dietary cholesterol, saturated fat, soluble fiber, total fiber, trans fat, protein, carbs, calories, and sodium.
Meal description: "${mealDescription}"

Break this down into individual food items with realistic estimated portion sizes in grams. For each item and for the meal as a whole, provide accurate USDA-grade nutritional values, paying special clinical attention to:
1. Cholesterol (mg)
2. Saturated Fat (g) - crucial for LDL cholesterol impact
3. Soluble Fiber (g) - crucial for cholesterol lowering
4. Total Fiber (g)
5. Trans Fat (g)
6. Total Calories (kcal)
7. Sodium (mg)
8. Suggested heart-smart swap or modification if high in saturated fat or dietary cholesterol.

Respond ONLY with valid JSON in this exact structure:
{
  "summary": "Brief heart-health nutritional summary of this meal",
  "heartHealthRating": "optimal" | "moderate" | "high-risk",
  "keyAdvice": "1-2 sentences on how this affects LDL/HDL cholesterol",
  "items": [
    {
      "name": "Food Item Name",
      "portion": "e.g., 2 large (100g)",
      "grams": 100,
      "calories": 143,
      "cholesterolMg": 372,
      "saturatedFatG": 3.1,
      "transFatG": 0,
      "solubleFiberG": 0,
      "totalFiberG": 0,
      "proteinG": 12.6,
      "carbsG": 0.7,
      "sodiumMg": 142,
      "swapSuggestion": "Optional heart-healthy swap if high in cholesterol or sat fat"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing meal:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze meal with Gemini API',
    });
  }
});

// Image-based food/nutrition label analyzer endpoint
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY not configured. Use manual search or add key in Settings > Secrets.',
      });
    }

    const prompt = `Analyze this image (which could be a plate of food, a meal, or a nutrition facts label). Identify all food items visible, estimate portion sizes, and calculate detailed nutritional values with clinical focus on cholesterol and cardiovascular health.

Respond ONLY with valid JSON in this exact structure:
{
  "summary": "Brief heart-health summary of the detected food/label",
  "heartHealthRating": "optimal" | "moderate" | "high-risk",
  "keyAdvice": "Heart-health guidance on cholesterol & saturated fat",
  "items": [
    {
      "name": "Food item name",
      "portion": "Estimated portion (e.g. 1 slice, 150g)",
      "grams": 150,
      "calories": 250,
      "cholesterolMg": 45,
      "saturatedFatG": 4.5,
      "transFatG": 0,
      "solubleFiberG": 1.2,
      "totalFiberG": 3.0,
      "proteinG": 18,
      "carbsG": 20,
      "sodiumMg": 320,
      "swapSuggestion": "Heart-smart alternative if applicable"
    }
  ]
}`;

    // Clean base64 string if it contains data URI prefix
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        { text: prompt },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze image with Gemini API',
    });
  }
});

// App configuration and API key status check
app.get('/api/status', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
  res.json({
    status: 'ok',
    hasGeminiKey: hasKey,
    environment: process.env.NODE_ENV || 'development',
  });
});

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
