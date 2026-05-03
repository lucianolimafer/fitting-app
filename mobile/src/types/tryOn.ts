import type { ImageSourcePropType } from 'react-native';

export type TryOnTargetType = 'tshirt' | 'lipstick';

export type ProductId = 'essential-tee' | 'lipstick-tryon';

export interface ColorOption {
  id: string;
  label: string;
  hex: string;
  isOriginal?: boolean;
}

export interface TryOnProduct {
  id: ProductId;
  type: TryOnTargetType;
  name: string;
  tabLabel: string;
  brand: string;
  price: number;
  discountLabel: string;
  description: string;
  subtitle: string;
  studioImage: ImageSourcePropType;
  detailImage: ImageSourcePropType;
  thumbnail: ImageSourcePropType;
  gallery: ImageSourcePropType[];
  colors: ColorOption[];
  prompts: string[];
}

export interface RecolorPreviewRequest {
  color: ColorOption;
  prompt: string;
  productId: ProductId;
  targetType: TryOnTargetType;
}

export interface RecolorPreviewResponse {
  imageDataUrl: string;
  colorHex: string;
  colorLabel: string;
  productId: ProductId;
  targetType: TryOnTargetType;
  model: string;
}

export interface TabBarItem {
  id: ProductId;
  label: string;
}
