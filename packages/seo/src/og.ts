import { DEFAULT_OG_HEIGHT, DEFAULT_OG_IMAGE, DEFAULT_OG_WIDTH, SITE_NAME } from './site';
import { selfCanonical } from './canonical';

export function openGraph(input: {
  title: string;
  description: string;
  path: string;
  kind?: string;
  image?: string;
  imageAlt?: string;
}) {
  const article = input.kind === 'article' || input.kind === 'guide' || input.kind === 'news' || input.kind === 'solution';
  return {
    type: article ? 'article' : 'website',
    locale: 'ar_SA',
    siteName: SITE_NAME,
    title: input.title,
    description: input.description,
    url: selfCanonical(input.path),
    image: input.image || DEFAULT_OG_IMAGE,
    imageWidth: DEFAULT_OG_WIDTH,
    imageHeight: DEFAULT_OG_HEIGHT,
    imageAlt: input.imageAlt || input.title,
  };
}
