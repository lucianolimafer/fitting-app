import type { TryOnProduct } from '../types/tryOn';

const modelTshirtImage = require('../assets/model-tshirt.png');
const modelLipstickImage = require('../assets/model-lipstick.png');

export const productCatalog: TryOnProduct[] = [
  {
    id: 'essential-tee',
    type: 'tshirt',
    name: 'Essential Tee',
    tabLabel: 'T-Shirt',
    brand: 'Studio Core',
    price: 49.9,
    discountLabel: '12% off',
    description:
      'Minimalist tee designed for clean fit validation — highlights drape, color, and proportion in the virtual studio.',
    subtitle: 'Select a color and the AI recolors the T-shirt.',
    studioImage: modelTshirtImage,
    detailImage: modelTshirtImage,
    thumbnail: modelTshirtImage,
    gallery: [modelTshirtImage, modelTshirtImage, modelTshirtImage, modelTshirtImage],
    colors: [
      { id: 'original', label: 'Original', hex: 'transparent', isOriginal: true },
      { id: 'butter', label: 'Butter', hex: '#f3dd8c' },
      { id: 'ivory', label: 'Ivory', hex: '#f3efe7' },
      { id: 'sage', label: 'Sage', hex: '#8ca287' },
      { id: 'ocean', label: 'Ocean', hex: '#4d78a8' },
      { id: 'charcoal', label: 'Charcoal', hex: '#2f3136' },
    ],
    prompts: [
      'Clean portrait with neutral pose and focus on shirt color.',
      'Front-facing fit validation with minimal distractions.',
      'Simple try-on view with emphasis on color selection.',
    ],
  },
  {
    id: 'lipstick-tryon',
    type: 'lipstick',
    name: 'Lipstick Try-On',
    tabLabel: 'Lipstick',
    brand: 'Studio Core',
    price: 29.9,
    discountLabel: 'New',
    description:
      'Lipstick try-on focused on changing only the lip color while preserving skin, hair, and cutout transparency.',
    subtitle: 'Select a lipstick shade and the AI recolors the lips.',
    studioImage: modelLipstickImage,
    detailImage: modelLipstickImage,
    thumbnail: modelLipstickImage,
    gallery: [modelLipstickImage, modelLipstickImage, modelLipstickImage, modelLipstickImage],
    colors: [
      { id: 'original', label: 'Original', hex: 'transparent', isOriginal: true },
      { id: 'nude-rose', label: 'Nude Rose', hex: '#b87677' },
      { id: 'soft-coral', label: 'Soft Coral', hex: '#d97b6c' },
      { id: 'classic-red', label: 'Classic Red', hex: '#b72f3a' },
      { id: 'berry-wine', label: 'Berry Wine', hex: '#7d3657' },
      { id: 'deep-plum', label: 'Deep Plum', hex: '#5a2749' },
    ],
    prompts: [
      'Keep the portrait untouched and only change the lipstick shade.',
      'Refine the lip color while preserving natural skin and makeup.',
      'Apply a realistic lipstick tone with clean edges on the lips only.',
    ],
  },
];
