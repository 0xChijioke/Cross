import { useState } from "react";
import { config } from "./config";
import * as optimismSDK from "@eth-optimism/sdk";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAccount, useNetwork } from "wagmi";

interface BridgeProps {
  nftPrice: number;
}

const gwei = BigInt(1e9);
// const eth: bigint = gwei * gwei;   // 10^18
// const centieth = eth / BigInt(100);

const Bridge = (props: BridgeProps) => {
  const { nftPrice } = props;
  const amount = BigInt(nftPrice) * gwei;
  const [bridgeTxHash, setBridgeTxHash] = useState<string>("");
  const [bridgingInProgress, setBridgingInProgress] = useState<boolean>(false);
  const [bridgingSuccess, setBridgingSuccess] = useState<boolean>(false);
  const [bridgingStatus, setBridgingStatus] = useState<string>("");
  const [bridgingProgress, setBridgingProgress] = useState<number>(0);
  const [bridgingTimeTaken, setBridgingTimeTaken] = useState<number>();
  const { chain } = useNetwork();
  const { address } = useAccount();
  // const { data: signer } = useSigner();

  const handleBridging = async () => {
    const { crossChainMessenger } = config(chain, address);
    const start = new Date();
    try {
      setBridgingInProgress(true);

      if (chain?.id === 5) {
        setBridgingStatus("Depositing asset on Ethereum...");

        setBridgingProgress(20);
        const response = await crossChainMessenger.depositETH(Number(amount));
        setBridgeTxHash(response.hash);

        setBridgingStatus("Waiting for transaction to be confirmed on Ethereum...");
        await response.wait();
        setBridgingProgress(50);

        setBridgingStatus("Waiting for transaction to be relayed to Optimism...");
        setBridgingProgress(80);
        await crossChainMessenger.waitForMessageStatus(response.hash, optimismSDK.MessageStatus.RELAYED);
        setBridgingProgress(100);
        console.log(`depositETH took ${(new Date().getTime() - start.getTime()) / 1000} seconds\n\n`);

        setBridgingStatus("Bridging successful!");
        setBridgingSuccess(true);
      } else if (chain?.id === 420) {
        setBridgingProgress(20);
        setBridgingStatus("Withdrawing asset from Optimism...");

        const response = await crossChainMessenger.withdrawETH(Number(amount));
        setBridgeTxHash(response.hash);
        setBridgingProgress(50);

        setBridgingStatus("Waiting for transaction to be confirmed on Optimism...");
        await response.wait();
        setBridgingProgress(70);

        setBridgingStatus("Proving message on Ethereum...");
        await crossChainMessenger.proveMessage(response.hash);

        setBridgingStatus("Waiting for message to be relayed to Optimism...");
        await crossChainMessenger.waitForMessageStatus(response.hash, optimismSDK.MessageStatus.READY_FOR_RELAY);
        setBridgingProgress(90);

        setBridgingStatus("Finalizing message on Optimism...");
        await crossChainMessenger.finalizeMessage(response.hash);
        const end = new Date();
        setBridgingProgress(100);
        console.log(`withdrawETH took ${(new Date().getTime() - start.getTime()) / 1000} seconds\n\n`);
        // Capture gas used and time taken after bridging completes
        const timeTaken = (end.getTime() - start.getTime()) / 1000;
        setBridgingTimeTaken(timeTaken);

        setBridgingStatus("Bridging successful!");
        setBridgingSuccess(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while bridging.");
    } finally {
      setBridgingInProgress(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        <motion.div
          initial={{ y: "-100vh" }}
          animate={{ y: "0" }}
          className="relative z-50 px-8 py-6 bg-white rounded-lg shadow-lg"
        >
          <h2 className="mb-4 font-bold text-xl text-gray-800">Bridge</h2>
          <button
            className="px-4 py-2 font-bold text-white bg-blue-500 rounded-md shadow-lg focus:outline-none hover:bg-blue-600 active:bg-blue-700"
            onClick={() => handleBridging()}
          >
            Bridge
          </button>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${bridgingProgress}%` }}
            style={{ height: 10, backgroundColor: "blue" }}
            className="mb-4 rounded-full"
          />
        </motion.div>
      </div>

      {bridgingInProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          <motion.div
            initial={{ y: "-100vh" }}
            animate={{ y: "0" }}
            className="relative z-50 px-8 py-6 bg-white rounded-lg shadow-lg"
          >
            <h2 className="mb-4 font-bold text-xl text-gray-800">Bridging in progress</h2>
            <p className="mb-4 text-gray-700">Status: {bridgingStatus}</p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${bridgingProgress}%` }}
              style={{ height: 10, backgroundColor: "blue" }}
              className="mb-4 rounded-full"
            />
          </motion.div>
        </div>
      )}
      {/* Success modal */}
      {bridgingSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          <motion.div
            initial={{ y: "-100vh" }}
            animate={{ y: "0" }}
            className="relative z-50 px-8 py-6 bg-white rounded-lg shadow-lg"
          >
            <h2 className="mb-4 font-bold text-xl text-gray-800">Bridging successful</h2>
            <p className="mb-4 text-gray-700">Message hash: {bridgeTxHash}</p>
            <p className="mb-4 text-gray-700">Time taken: {bridgingTimeTaken} seconds</p>
            <button
              className="px-4 py-2 font-bold text-white bg-green-500 rounded-md shadow-lg focus:outline-none hover:bg-green-600 active:bg-green-700"
              onClick={() => setBridgingSuccess(false)}
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Bridge;
