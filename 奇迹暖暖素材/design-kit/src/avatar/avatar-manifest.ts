import type { AvatarConfig, AvatarLayers } from './avatar-types';

export type {
  AvatarAssetSet,
  AvatarConfig,
  AvatarLayers,
  BodyType,
} from './avatar-types';

export const AVATAR_LAYER_ORDER: (keyof AvatarLayers)[] = [
  'backAccessory',
  'hairBack',
  'bodyBase',
  'legs',
  'shoes',
  'outfitBack',
  'outfitMain',
  'outfitFront',
  'faceBase',
  'eyes',
  'eyebrows',
  'mouth',
  'blush',
  'hairSide',
  'hairFront',
  'headAccessory',
  'handAccessory',
  'highlights',
];

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  name: '',
  bodyType: 'balanced',
  skinTone: 'skin-03',
  faceShape: 'soft-oval',
  eyeStyle: 'soft-oval-violet',
  eyebrowStyle: 'gentle-01',
  mouthStyle: 'soft-smile-01',
  hairStyle: 'cloud-curl',
  hairColor: 'silver-lilac',
  outfitId: 'star-scholar',
  accessoryId: 'star-book',
};

export function resolveAvatarLayers(config: AvatarConfig): AvatarLayers {
  const base = '/assets/avatar';
  return {
    bodyBase: `${base}/base/${config.bodyType}/body-${config.skinTone}.webp`,
    faceBase: `${base}/base/${config.bodyType}/face-${config.faceShape}-${config.skinTone}.webp`,
    eyes: `${base}/faces/eyes/${config.eyeStyle}.webp`,
    eyebrows: `${base}/faces/eyebrows/${config.eyebrowStyle}.webp`,
    mouth: `${base}/faces/mouths/${config.mouthStyle}.webp`,
    hairBack: `${base}/hair/${config.hairStyle}/${config.hairColor}-back.webp`,
    hairSide: `${base}/hair/${config.hairStyle}/${config.hairColor}-side.webp`,
    hairFront: `${base}/hair/${config.hairStyle}/${config.hairColor}-front.webp`,
    outfitBack: `${base}/outfits/${config.outfitId}/${config.bodyType}-back.webp`,
    outfitMain: `${base}/outfits/${config.outfitId}/${config.bodyType}-main.webp`,
    outfitFront: `${base}/outfits/${config.outfitId}/${config.bodyType}-front.webp`,
    shoes: `${base}/outfits/${config.outfitId}/${config.bodyType}-shoes.webp`,
    headAccessory: config.accessoryId
      ? `${base}/accessories/${config.accessoryId}/head.webp`
      : undefined,
    handAccessory: config.accessoryId
      ? `${base}/accessories/${config.accessoryId}/hand.webp`
      : undefined,
    highlights: `${base}/effects/soft-highlights.webp`,
  };
}
