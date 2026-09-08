import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Helper to select a beautiful high-res Unsplash beauty image based on simple keyword search
function getBeautyFallbackImage(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('ongle') || p.includes('nail') || p.includes('manucure') || p.includes('pédicure') || p.includes('pedicure') || p.includes('vernis')) {
    return 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800';
  }
  if (p.includes('massage') || p.includes('corps') || p.includes('body') || p.includes('spa') || p.includes('zen') || p.includes('modelage') || p.includes('détente') || p.includes('méridien') || p.includes('meridien')) {
    return 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=800';
  }
  if (p.includes('visage') || p.includes('face') || p.includes('facial') || p.includes('peau') || p.includes('skin') || p.includes('ride') || p.includes('rajeunissement') || p.includes('éclat') || p.includes('crème') || p.includes('creme')) {
    return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800';
  }
  if (p.includes('cil') || p.includes('sourcil') || p.includes('regard') || p.includes('lash') || p.includes('brow') || p.includes('yeux') || p.includes('épilation') || p.includes('epilation') || p.includes('cire')) {
    return 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?q=80&w=800';
  }
  return 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=800'; // Default beauty elements
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser middleware
  app.use(express.json({ limit: '50mb' }));

  // API Proxy Route for Gemini Image Generation
  app.post('/api/generate-image', async (req, res) => {
    const { prompt, imageSize } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Le prompt est requis.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        imageUrl: getBeautyFallbackImage(prompt),
        fallback: true,
        reason: "missing_key",
        originalError: "Configuration requise : la clé API GEMINI_API_KEY n'est pas définie."
      });
    }

    try {
      // Connect to Gemini API using the official modern GoogleGenAI SDK
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Try primary model gemini-3.1-flash-image, fallback to gemini-3.1-flash-lite-image if quota/rate limited
      let response: any = null;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              imageSize: imageSize || '1K',
              aspectRatio: '1:1',
            },
          },
        });
      } catch (primaryErr: any) {
        const errString = String(primaryErr).toLowerCase();
        if (errString.includes('429') || errString.includes('quota') || errString.includes('limit')) {
          // Attempt with flash-lite image model
          try {
            response = await ai.models.generateContent({
              model: 'gemini-3.1-flash-lite-image',
              contents: {
                parts: [{ text: prompt }],
              },
            });
          } catch (secondaryErr) {
            throw primaryErr;
          }
        } else {
          throw primaryErr;
        }
      }

      let imageUrl: string | null = null;
      if (response?.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (imageUrl) {
        return res.json({ imageUrl, fallback: false });
      } else {
        throw new Error("Aucune image n'a été retournée par l'API.");
      }

    } catch (error: any) {
      const errorStr = String(error).toLowerCase();
      const isQuotaOrLimit = errorStr.includes('quota') || 
                            errorStr.includes('limit') || 
                            errorStr.includes('exhausted') || 
                            errorStr.includes('429') || 
                            errorStr.includes('billing');
      
      const fallbackUrl = getBeautyFallbackImage(prompt);
      return res.json({ 
        imageUrl: fallbackUrl, 
        fallback: true,
        reason: isQuotaOrLimit ? "quota_exceeded" : "api_error",
        originalError: error.message || 'Une erreur est survenue lors de la génération de l\'image.' 
      });
    }
  });

  // Serve static/development files via Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
