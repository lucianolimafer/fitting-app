import { Platform } from 'react-native';

import type { RecolorPreviewRequest, RecolorPreviewResponse } from '../types/tryOn';

const DEFAULT_API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3001',
  ios: 'http://127.0.0.1:3001',
  default: 'http://localhost:3001',
});

const API_BASE_URL = process.env.EXPO_PUBLIC_TRYON_API_URL || DEFAULT_API_BASE_URL;

export async function recolorPreviewWithAI({
  color,
  prompt,
  productId,
  targetType,
}: RecolorPreviewRequest): Promise<RecolorPreviewResponse> {
  const response = await fetch(`${API_BASE_URL}/api/recolor-preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      colorHex: color.hex,
      colorLabel: color.label,
      prompt,
      productId,
      targetType,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as Partial<RecolorPreviewResponse> & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error || 'Failed to generate the recolored preview.');
  }

  return payload as RecolorPreviewResponse;
}
