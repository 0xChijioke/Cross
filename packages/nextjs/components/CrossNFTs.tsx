import { useEffect, useMemo, useState } from "react";
import NFTDetails from "./NFTDetails";
import { NFTMetadata } from "./types";

const pinataCID = process.env.NEXT_PUBLIC_PINATA_CID;

const CrossNFTs = (): JSX.Element => {
  // State to hold retrieved NFT data
  const [nftData, setNFTData] = useState<NFTMetadata[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFTMetadata | null>(null);
  const [isAnimating] = useState(false);

  // Function to retrieve NFT data from Pinata
  const fetchNFTData = async (): Promise<NFTMetadata[]> => {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${pinataCID}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // Use useMemo to cache retrieved NFT data
  const cachedNFTData = useMemo(async () => {
    return await fetchNFTData();
  }, []);

  // Update state with cached NFT data on component mount
  useEffect(() => {
    cachedNFTData.then(data => setNFTData(data));
  }, [cachedNFTData]);

  // For triggering animation on mobile
  // const handleCardClick = (nft: NFTMetadata) => {
  //   setIsAnimating(true);
  //   setTimeout(() => {
  //     setIsAnimating(false);
  //   }, 1000); // Set timeout to match the duration of the animation
  // }

  // Function to handle selecting an NFT
  const handleNFTSelect = (nft: NFTMetadata) => {
    setSelectedNFT(nft);
  };

  // Render NFT metadata list with Tailwind styling
  return (
    <>
      {selectedNFT ? (
        <NFTDetails nft={selectedNFT} onBack={() => setSelectedNFT(null)} />
      ) : (
        <div className="grid grid-cols-1 my-10 md:grid-cols-3 gap-4">
          {nftData.map(nft => (
            <div
              key={nft.name}
              className={`nft-card rounded-lg overflow-hidden shadow-2xl ${isAnimating ? "animate-pulse" : ""}`}
              onClick={() => handleNFTSelect(nft)}
            >
              <img className="w-full h-48 object-cover" src={nft.image} alt={nft.name} />
              <div className="p-4">
                <h2 className="text-lg font-semibold">{nft.name}</h2>
                <p className="text-sm text-gray-500">{nft.description}</p>
                <div className="mt-4 flex justify-between">
                  <p className="text-sm font-semibold">{`Bridge Value: ${nft.attributes.bridgeValue}`}</p>
                  <p className="text-sm font-semibold">{`Rarity: ${nft.attributes.rarityValue}`}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default CrossNFTs;
