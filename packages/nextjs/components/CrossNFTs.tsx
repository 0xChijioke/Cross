import { useEffect, useMemo, useState } from "react";
import cross from "../Metadata/cross.json";
import NFTDetails from "./NFTDetails";
import { Spinner } from "./Spinner";
import { NFTMetadata } from "./types";

// import Hero from "./Hero";

const pinataBaseURI = "https://gateway.pinata.cloud/ipfs/";

const CrossNFTs = (): JSX.Element => {
  // State to hold retrieved NFT data
  const [nftData, setNFTData] = useState<NFTMetadata[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFTMetadata | null>(null);

  // Function to retrieve NFT data from Pinata
  const fetchNFTData = async (): Promise<NFTMetadata[]> => {
    try {
      const metadataList = await Promise.all(
        cross.map(async nft => {
          const response = await fetch(pinataBaseURI + nft.CID);
          const data = await response.json();
          return {
            ...data,
            uri: pinataBaseURI + nft.CID,
          };
        }),
      );
      // Remove any duplicates from the metadataList array
      const filteredMetadataList = metadataList.filter(
        (metadata, index, self) =>
          index ===
          self.findIndex(
            m =>
              m.name === metadata.name &&
              m.description === metadata.description &&
              m.attributes[1].value === metadata.attributes[1].value &&
              m.attributes[2].value === metadata.attributes[2].value,
          ),
      );
      // Shuffle the array randomly
      const shuffledMetadataList = filteredMetadataList.sort(() => Math.random() - 0.5);
      return shuffledMetadataList;
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

  // Function to handle selecting an NFT
  const handleNFTSelect = (nft: NFTMetadata) => {
    setSelectedNFT(nft);
  };

  if (!nftData[0]) {
    return (
      <div className="flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      {selectedNFT ? (
        <NFTDetails nft={selectedNFT} onBack={() => setSelectedNFT(null)} />
      ) : (
        <div className="grid grid-cols-1 my-10 px-14 md:grid-cols-3 gap-8">
          {nftData.map(nft => (
            <div
              key={nft.name}
              className={`nft-cardd rounded-lg lg:w-[260px] card-sm overflow-hidden shadow-2xl`}
              onClick={() => handleNFTSelect(nft)}
            >
              <img className="w-full h-48 object-fit" src={nft.image} alt={nft.name} loading="lazy" />
              <div className="p-4">
                <h2 className="text-lg font-semibold">{nft.name}</h2>
                <p className="text-sm text-gray-500">
                  {nft.description.slice(0, 70) + (nft.description.length > 70 ? "..." : "")}
                </p>

                <div className="mt-4 flex  rounded-lg shadow-xl p-3  justify-between">
                  <div className="flex flex-col space-y-0">
                    <p className="text-sm text-gray-500  uppercase tracking-wider">{nft.attributes[1].trait_type}</p>
                    <p className="text-sm font-semibold">{`Ξ ${nft.attributes[1].value}`}</p>
                  </div>
                  <div className="flex flex-col space-y-0">
                    <p className="text-sm text-gray-500 uppercase tracking-wider">{nft.attributes[2].trait_type}</p>
                    <p className="text-sm font-semibold uppercase tracking-widest">{`${nft.attributes[2].value}`}</p>
                  </div>
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
