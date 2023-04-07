export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: [
    {
      trait_type: string;
      value: string;
    },
    {
      trait_type: string;
      value: number;
    },
    {
      trait_type: string;
      value: string;
    },
  ];
  uri: string;
}
