import { useEffect, useState } from "react";
import Bridge from "./Bridge";
import { NFTMetadata } from "./types";
import { motion } from "framer-motion";

// import { useDeployedContractInfo, useScaffoldContractRead } from "~~/hooks/scaffold-eth";

interface Props {
  nft: NFTMetadata;
  onBack: () => void;
}

const NFTDetails = ({ nft, onBack }: Props): JSX.Element => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [onConfirmBridge, setOnConfirmBridge] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleConfirm = () => {
    setIsLoading(true);
    setOnConfirmBridge(true);
  };

  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      setOnConfirmBridge(false);
    }
  }, [isOpen]);

  const container = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 2,
        duration: 2.5,
      },
    },
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center my-28 items-center">
      <motion.div
        className="flex flex-col justify-center items-center border border-slate-600 rounded-xl my-28 shadow-xl px-4 py-8 max-w-md w-full"
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
        <h2 className="text-lg uppercase font-semibold">{nft.name}</h2>
        <p className="text-sm text-gray-500 mb-4">{nft.description}</p>
        <div className="flex space-y-0 justify-center items-center flex-col">
          <p className="uppercase text-gray-600 text-sm tracking-wider">{nft.attributes[0].trait_type}</p>
          <p className="uppercase text-sm tracking-widest">{nft.attributes[0].value}</p>
        </div>
        <div className="mt-2 flex justify-between w-full">
          <p className="text-sm tracking-widest uppercase font-semibold">{`Bridge Value: Ξ${nft.attributes[1].value}`}</p>
          <p className="text-sm tracking-widest uppercase font-semibold">{`Rarity: ${nft.attributes[2].value}`}</p>
        </div>
        <div className="flex flex-row w-full my-9 justify-between">
          <button
            onClick={onBack}
            className=" w-fit rounded-lg border-hidden text-white bg-red-700 hover:bg-red-600 py-3 px-[19%] btn justify-start tracking-widest"
          >
            BACK
          </button>
          <label
            htmlFor="my-modal"
            onClick={handleModalToggle}
            className={`btn ${
              isLoading ? "loading" : ""
            } w-fit py-3 px-[19%] rounded-lg border-hidden text-white bg-green-700 hover:bg-green-600 tracking-widest`}
          >
            MINT
          </label>
        </div>

        {/* Put this part before </body> tag */}
        <input type="checkbox" id="my-modal" className="modal-toggle" />
        <div className="modal">
          <div className="modal-box">
            <label
              htmlFor="my-modal"
              onClick={handleModalToggle}
              className="btn btn-sm btn-circle text-white absolute bg-red-600 right-2 top-2"
            >
              ✕
            </label>
            <h3 className="font-bold text-center uppercase text-lg">
              Bridge {nft.attributes[1].value} ETH and Mint {nft.name}!
            </h3>
            {onConfirmBridge && (
              <div className="w-full">
                <Bridge nftPrice={nft.attributes[1].value} uri={nft.uri} />
              </div>
            )}
            <div className="modal-action flex justify-center">
              {!onConfirmBridge && (
                <div className="flex flex-col space-y-5">
                  <motion.div
                    className="border border-blue-400 px-4 py-3 rounded relative"
                    initial="hidden"
                    animate="visible"
                    variants={container}
                  >
                    <p className="text-lg text-center tracking-wide">
                      You are about to bridge tokens to Optimism and collect our bridge token!
                    </p>
                  </motion.div>
                  <button
                    className="rounded-lg p-2 my-7 bg-green-700 hover:bg-green-600 text-white uppercase tracking-wider"
                    onClick={() => handleConfirm()}
                  >
                    Confirm brige
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NFTDetails;
