export type BodyType = 'slender' | 'balanced' | 'lively';

export type AvatarConfig = {
  name: string;
  bodyType: BodyType;
  skinTone: string;
  faceShape: string;
  eyeStyle: string;
  eyebrowStyle: string;
  mouthStyle: string;
  hairStyle: string;
  hairColor: string;
  outfitId: string;
  accessoryId: string | null;
};

export type AvatarLayers = Partial<{
  backAccessory: string;
  hairBack: string;
  bodyBase: string;
  legs: string;
  shoes: string;
  outfitBack: string;
  outfitMain: string;
  outfitFront: string;
  faceBase: string;
  eyes: string;
  eyebrows: string;
  mouth: string;
  blush: string;
  hairSide: string;
  hairFront: string;
  headAccessory: string;
  handAccessory: string;
  highlights: string;
}>;

export type AvatarAssetSet = AvatarLayers;
