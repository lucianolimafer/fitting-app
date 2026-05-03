import { useMemo, useRef, useState } from 'react';

import { productCatalog } from '../data/mockCatalog';
import { recolorPreviewWithAI } from '../services/tryOnApi';
import type {
  ColorOption,
  ProductId,
  RecolorPreviewResponse,
  TabBarItem,
  TryOnProduct,
} from '../types/tryOn';

type GeneratedPreviewMap = Partial<Record<ProductId, string>>;
type BooleanByProductMap = Partial<Record<ProductId, boolean>>;
type ErrorByProductMap = Partial<Record<ProductId, string>>;
type PromptByProductMap = Record<ProductId, string>;
type ColorIdByProductMap = Record<ProductId, string>;
type PreviewCache = Partial<Record<string, string>>;

const tabItems: TabBarItem[] = productCatalog.map((product) => ({
  id: product.id,
  label: product.tabLabel,
}));

export function useTryOn() {
  const previewCacheRef = useRef<PreviewCache>({});
  const latestRequestIdRef = useRef(0);

  const [activeTabId, setActiveTabId] = useState<ProductId>(productCatalog[0].id);
  const [selectedColorIds, setSelectedColorIds] = useState<ColorIdByProductMap>(() =>
    Object.fromEntries(
      productCatalog.map((product) => [product.id, product.colors[0].id]),
    ) as ColorIdByProductMap,
  );
  const [promptsByProduct] = useState<PromptByProductMap>(
    () =>
      Object.fromEntries(
        productCatalog.map((product) => [product.id, product.prompts[0]]),
      ) as PromptByProductMap,
  );
  const [generatedPreviewUris, setGeneratedPreviewUris] = useState<GeneratedPreviewMap>({});
  const [isGeneratingByProduct, setIsGeneratingByProduct] = useState<BooleanByProductMap>({});
  const [generationErrors, setGenerationErrors] = useState<ErrorByProductMap>({});

  const selectedProduct = useMemo<TryOnProduct>(
    () => productCatalog.find((product) => product.id === activeTabId) ?? productCatalog[0],
    [activeTabId],
  );
  const selectedColorId =
    selectedColorIds[selectedProduct.id] ?? selectedProduct.colors[0].id;
  const selectedColor =
    selectedProduct.colors.find((color) => color.id === selectedColorId) ??
    selectedProduct.colors[0];
  const prompt = promptsByProduct[selectedProduct.id] ?? selectedProduct.prompts[0];

  async function generatePreviewForColor(
    nextColor: ColorOption,
    product: TryOnProduct = selectedProduct,
    customPrompt: string = prompt,
  ) {
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;

    setIsGeneratingByProduct((current) => ({ ...current, [product.id]: true }));
    setGenerationErrors((current) => ({ ...current, [product.id]: '' }));

    try {
      const cacheKey = `${product.id}:${nextColor.id}`;
      const cachedPreview = previewCacheRef.current[cacheKey];

      if (cachedPreview) {
        if (latestRequestIdRef.current === requestId) {
          setGeneratedPreviewUris((current) => ({ ...current, [product.id]: cachedPreview }));
          setIsGeneratingByProduct((current) => ({ ...current, [product.id]: false }));
        }
        return;
      }

      const result: RecolorPreviewResponse = await recolorPreviewWithAI({
        color: nextColor,
        prompt: customPrompt,
        productId: product.id,
        targetType: product.type,
      });

      previewCacheRef.current[cacheKey] = result.imageDataUrl;

      if (latestRequestIdRef.current === requestId) {
        setGeneratedPreviewUris((current) => ({
          ...current,
          [product.id]: result.imageDataUrl,
        }));
        setIsGeneratingByProduct((current) => ({ ...current, [product.id]: false }));
      }
    } catch (error) {
      if (latestRequestIdRef.current === requestId) {
        setIsGeneratingByProduct((current) => ({ ...current, [product.id]: false }));
        setGenerationErrors((current) => ({
          ...current,
          [product.id]:
            error instanceof Error ? error.message : 'Failed to apply AI recolor.',
        }));
      }
    }
  }

  function handleSelectColor(colorId: string) {
    setSelectedColorIds((current) => ({ ...current, [selectedProduct.id]: colorId }));

    const nextColor =
      selectedProduct.colors.find((color) => color.id === colorId) ??
      selectedProduct.colors[0];

    if (nextColor.isOriginal) {
      latestRequestIdRef.current += 1;
      setGeneratedPreviewUris((current) => {
        const next = { ...current };
        delete next[selectedProduct.id];
        return next;
      });
      setIsGeneratingByProduct((current) => ({ ...current, [selectedProduct.id]: false }));
      setGenerationErrors((current) => ({ ...current, [selectedProduct.id]: '' }));
      return;
    }

    void generatePreviewForColor(nextColor);
  }

  function handleGenerateLook() {
    void generatePreviewForColor(selectedColor);
  }

  return {
    activeTabId,
    setActiveTabId,
    selectedProduct,
    selectedColor,
    generatedPreviewUris,
    isGeneratingByProduct,
    generationErrors,
    tabItems,
    handleSelectColor,
    handleGenerateLook,
  };
}
