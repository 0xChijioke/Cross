import { useState } from "react";
import { Spinner } from "./Spinner";
import { config } from "./config";
import * as optimismSDK from "@eth-optimism/sdk";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { useAccount, useNetwork, useSigner } from "wagmi";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

interface BridgeProps {
  nftPrice: number;
  uri: string;
}

const Bridge = (props: BridgeProps) => {
  const { nftPrice, uri } = props;
  const amount = ethers.utils.parseEther(nftPrice.toString());
  const feeFromAmt = amount.div(20); // 5% fee
  const fee = ethers.utils.formatEther(feeFromAmt);
  const { writeAsync, isLoading, isSuccess } = useScaffoldContractWrite("Cross", "mint", [amount, uri], fee.toString());

  const [bridgingInProgress, setBridgingInProgress] = useState<boolean>(false);
  const [bridgingSuccess, setBridgingSuccess] = useState<boolean>(false);
  const [bridgingStatus, setBridgingStatus] = useState<string>("");
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { data: signer } = useSigner();

  const resetState = () => {
    setBridgingInProgress(false);
    setBridgingSuccess(false);
    setBridgingStatus("");
  };

  const handleBridging = async () => {
    const { crossChainMessenger } = config(chain, address);
    const start = new Date();
    try {
      setBridgingInProgress(true);

      if (chain?.id === 5) {
        setBridgingStatus("Depositing asset on Ethereum...");

        if (!signer) {
          return null;
        }
        const response = await crossChainMessenger.depositETH(amount, { signer });

        setBridgingStatus("Waiting for transaction to be confirmed on Ethereum...");
        await response.wait();

        setBridgingStatus("Waiting for transaction to be relayed to Optimism...");
        await crossChainMessenger.waitForMessageStatus(response.hash, optimismSDK.MessageStatus.RELAYED);
        const end = new Date();
        const diff = end.getTime() - start.getTime();
        setBridgingSuccess(true);

        setBridgingStatus(`Bridging successful in ${diff / 1000} seconds.`);
      } else if (chain?.id === 420) {
        setBridgingStatus("Withdrawing asset from Optimism...");

        if (!signer) {
          return null;
        }

        const response = await crossChainMessenger.withdrawETH(amount, { signer });

        setBridgingStatus("Waiting for transaction to be confirmed on Optimism...");
        await response.wait();

        setBridgingStatus("Proving message on Ethereum...");
        await crossChainMessenger.proveMessage(response.hash);

        setBridgingStatus("Waiting for message to be relayed to Optimism...");
        await crossChainMessenger.waitForMessageStatus(response.hash, optimismSDK.MessageStatus.READY_FOR_RELAY);

        setBridgingStatus("Finalizing message on Optimism...");
        await crossChainMessenger.finalizeMessage(response.hash);
        const end = new Date();
        const diff = end.getTime() - start.getTime();
        setBridgingSuccess(true);

        setBridgingStatus(`Bridging successful in ${diff / 1000} seconds.`);
      }
    } catch (error: any) {
      console.error(error);
      setBridgingStatus(`Error bridging: ${error.message}`);
      toast.error("An error occurred while bridging.");
    } finally {
      setBridgingInProgress(false);
      // setTimeout(() => afterBridge(), 20000);
    }
  };

  {
    isSuccess && (() => resetState());
  }

  return (
    <div className="flex flex-col justify-center w-full items-center space-y-4">
      {bridgingInProgress && (
        <div className="flex flex-col items-center justify-center">
          <p className="dot tracking-widest ">Bridge Crossing...</p>
          <Spinner />
        </div>
      )}

      {!bridgingSuccess && !bridgingInProgress && (
        <div className="w-full justify-center flex">
          <button
            className="rounded-lg p-2 my-7 px-4 bg-green-700 hover:bg-green-600 text-white uppercase tracking-widest"
            onClick={() => handleBridging()}
          >
            Bridge Now
          </button>
        </div>
      )}

      {bridgingSuccess && (
        <div className="w-full flex justify-center flex-col text-center">
          <p className="uppercase tracking-wider">Bridging successful!</p>
          <p>{bridgingStatus}</p>
          <p>We will charge 5% of the token bridge value to mint you this token.</p>

          {!isLoading && !isSuccess && (
            <button
              className="rounded-lg p-2 my-7 px-4 bg-green-700 hover:bg-green-600 text-white uppercase tracking-widest"
              onClick={writeAsync}
            >
              Continue
            </button>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}
      {!bridgingSuccess && bridgingStatus && (
        <p className="tracking-wider flex justify-center text-center text-lg">{bridgingStatus}</p>
      )}
    </div>
  );
};

export default Bridge;
