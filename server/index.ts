import fs from 'node:fs/promises';
import path from 'node:path';

import express, { type NextFunction, type Request, type Response } from 'express';
import OpenAI from 'openai';
import sharp from 'sharp';

type ProductId = 'essential-tee' | 'lipstick-tryon';
type TryOnTargetType = 'tshirt' | 'lipstick';

process.loadEnvFile(path.join(import.meta.dirname, '.env'));

const PORT = Number(process.env.PORT || 3001);
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5';
const SOURCE_IMAGE_PATHS: Record<ProductId, string> = {
  'essential-tee': path.join(import.meta.dirname, 'assets', 'model-tshirt.png'),
  'lipstick-tryon': path.join(import.meta.dirname, 'assets', 'model-lipstick.png'),
};

interface HttpError extends Error {
  statusCode?: number;
  error?: {
    message?: string;
  };
}

interface RecolorPreviewBody {
  colorHex?: string;
  colorLabel?: string;
  prompt?: string;
  productId?: ProductId;
  targetType?: TryOnTargetType;
}

interface BuildEditPromptParams {
  colorHex: string;
  colorLabel: string;
  prompt?: string;
  targetType: TryOnTargetType;
}

const app = express();
app.use(express.json({ limit: '1mb' }));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

function createHttpError(message: string, statusCode: number): HttpError {
  const error = new Error(message) as HttpError;
  error.statusCode = statusCode;
  return error;
}

function ensureApiKey() {
  const apiKey = String(process.env.OPENAI_API_KEY || '')
    .trim()
    .replace(/^['"]|['"]$/g, '');

  if (!apiKey) {
    throw createHttpError('OPENAI_API_KEY is not configured on the server.', 503);
  }

  if (!apiKey.startsWith('sk-')) {
    throw createHttpError('OPENAI_API_KEY is invalid. It should start with "sk-".', 400);
  }

  return new OpenAI({ apiKey });
}

function sanitizeErrorMessage(input: unknown) {
  const message = String(input || 'Failed to recolor the preview with AI.');

  return message.replace(/sk-[A-Za-z0-9_-]+/g, 'sk-***').replace(/vsk-[A-Za-z0-9_-]+/g, '***');
}

function buildEditPrompt({ colorHex, colorLabel, prompt, targetType }: BuildEditPromptParams) {
  if (targetType === 'lipstick') {
    return [
      'Edit the provided cutout portrait image.',
      `Change only the lip color and the visible lipstick product color on the applicator tip to ${colorLabel} (${colorHex}).`,
      'Do not change anything except the lips and the lipstick pigment on the applicator.',
      'Preserve the exact original image dimensions, aspect ratio, resolution, crop, framing, positioning, and transparency mask.',
      'Preserve the exact person identity, skin texture, face shape, eyes, brows, lashes, hair, expression, pose, hands, nails, clothing, highlights, and shadows.',
      'Keep the lip edges realistic, clean, and natural.',
      'Keep the lipstick applicator shape, hand position, and all surrounding details identical.',
      'Preserve the exact original cutout edges and alpha transparency.',
      'The background must remain fully transparent exactly as in the input image.',
      'Do not generate, replace, fill, or invent any background.',
      'Do not alter skin tone, teeth, gums, makeup outside the lips, clothes, accessories, or any object other than the visible lipstick pigment.',
      'Return the exact same image composition and canvas with only the lips and lipstick product recolored.',
      prompt ? `Additional styling note: ${prompt}` : null,
    ]
      .filter(Boolean)
      .join(' ');
  }

  return [
    'Edit the provided cutout portrait image.',
    `Change only the T-shirt fabric color to a solid ${colorLabel} (${colorHex}).`,
    'Do not change anything except the shirt color.',
    'Preserve the exact person identity, face, hair, pose, body proportions, expression, skin tone, pants, hands, framing, garment shape, shirt texture, seams, folds, shadows, and highlights.',
    'Preserve the exact original cutout edges and alpha transparency.',
    'The background must remain fully transparent exactly as in the input image.',
    'Do not generate, replace, fill, or invent any background.',
    'Do not add logos, graphics, text, accessories, extra garments, skin changes, or pose changes.',
    'Return the same image composition with only the shirt recolored.',
    prompt ? `Additional styling note: ${prompt}` : null,
  ]
    .filter(Boolean)
    .join(' ');
}

async function loadSourceImageAsPngBuffer(productId: ProductId) {
  const sourceImagePath = SOURCE_IMAGE_PATHS[productId];

  if (!sourceImagePath) {
    throw createHttpError('Unknown preview product.', 400);
  }

  const original = await fs.readFile(sourceImagePath);
  return sharp(original).png().toBuffer();
}

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    hasApiKey: Boolean(process.env.OPENAI_API_KEY),
    model: OPENAI_IMAGE_MODEL,
  });
});

app.post(
  '/api/recolor-preview',
  async (req: Request<{}, {}, RecolorPreviewBody>, res: Response) => {
    try {
      const { colorHex, colorLabel, prompt, productId, targetType } = req.body ?? {};

      if (!colorHex || !colorLabel || !productId || !targetType) {
        return res.status(400).json({
          error: 'colorHex, colorLabel, productId, and targetType are required.',
        });
      }

      const client = ensureApiKey();
      const sourcePngBuffer = await loadSourceImageAsPngBuffer(productId);
      const sourceFile = await OpenAI.toFile(sourcePngBuffer, `${productId}.png`, {
        type: 'image/png',
      });

      const result = await client.images.edit({
        model: OPENAI_IMAGE_MODEL,
        image: sourceFile,
        prompt: buildEditPrompt({ colorHex, colorLabel, prompt, targetType }),
        size: '1024x1536',
        quality: 'medium',
        input_fidelity: 'high',
        output_format: 'png',
        background: 'transparent',
      });

      const b64 = result.data?.[0]?.b64_json;

      if (!b64) {
        throw new Error('OpenAI did not return an edited image.');
      }

      return res.json({
        imageDataUrl: `data:image/png;base64,${b64}`,
        colorHex,
        colorLabel,
        productId,
        targetType,
        model: OPENAI_IMAGE_MODEL,
      });
    } catch (error) {
      const typedError = error as HttpError;
      const statusCode = typedError.statusCode || 500;
      const message = sanitizeErrorMessage(
        typedError.error?.message || typedError.message || 'Failed to recolor the preview with AI.',
      );

      return res.status(statusCode).json({ error: message });
    }
  },
);

app.listen(PORT, () => {
  console.log(`AI try-on server listening on http://localhost:${PORT}`);
  console.log(`OpenAI key loaded: ${process.env.OPENAI_API_KEY ? 'yes' : 'no'}`);
});
