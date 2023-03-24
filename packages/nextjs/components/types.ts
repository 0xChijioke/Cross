export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    bridgeValue: number;
    rarityValue: number;
  };
}
