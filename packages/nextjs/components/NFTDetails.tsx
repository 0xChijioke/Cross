import { NFTMetadata } from "./types";
import { motion } from "framer-motion";

interface Props {
  nft: NFTMetadata;
  onBack: () => void;
}

const NFTDetails = ({ nft, onBack }: Props): JSX.Element => {
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center">
      <motion.div
        className="flex flex-col justify-center items-center border border-slate-600 rounded-xl shadow-xl px-4 py-8 max-w-md w-full"
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.5 }}
      >
        <motion.img
          src={nft.image}
          alt={nft.name}
          className="w-full object-cover mb-4 rounded-xl"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />
        <h2 className="text-lg font-semibold">{nft.name}</h2>
        <p className="text-sm text-gray-500 mb-4">{nft.description}</p>
        <div className="mt-2 flex justify-between w-full">
          <p className="text-sm font-semibold">{`Bridge Value: ${nft.attributes.bridgeValue}`}</p>
          <p className="text-sm font-semibold">{`Rarity: ${nft.attributes.rarityValue}`}</p>
        </div>
        <button className="w-full bg-green-700 text-white hover:bg-green-600 rounded-lg tracking-widest p-2 my-3 font-bai-jamjuree font-semibold">
          MINT
        </button>
      </motion.div>
      <button
        onClick={onBack}
        className="mt-8 px-4 py-2 my-9 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
      >
        Back
      </button>
    </div>
  );
};

export default NFTDetails;
