import { useState } from "react";
import * as optimismSDK from "@eth-optimism/sdk";
import { ethers } from "ethers";
import { useAccount, useNetwork } from "wagmi";

const Bridge = () => {
  const [bridgeTxHash, setBridgeTxHash] = useState("");
  const { chain } = useNetwork();
  const { address } = useAccount();
  // const { data: signer } = useSigner();
  const [amount, setAmount] = useState(0);

  const handleBridging = async (amount: number) => {
    const start = new Date();

    try {
      const l1Url = `https://${chain}-goerli.g.alchemy.com/v2/${process.env.GOERLI_ALCHEMY_KEY}`;
      const l2Url = `https://opt-${chain}-goerli.g.alchemy.com/v2/${process.env.OPTIMISM_GOERLI_ALCHEMY_KEY}`;

      const l1RpcProvider = new ethers.providers.JsonRpcProvider(l1Url);
      const l2RpcProvider = new ethers.providers.JsonRpcProvider(l2Url);

      const l1Wallet = l1RpcProvider.getSigner(address);
      const l2Wallet = l2RpcProvider.getSigner(address);

      const crossChainMessenger = new optimismSDK.CrossChainMessenger({
        l1ChainId: chain?.name === "mainnet" ? 1 : 5,
        l2ChainId: chain?.name === "mainnet" ? 10 : 420,
        l1SignerOrProvider: l1Wallet,
        l2SignerOrProvider: l2Wallet,
        bedrock: true,
      });

      if (chain?.name === "mainnet") {
        // user is connected to Ethereum, deposit the asset
        const response = await crossChainMessenger.depositETH(amount);
        setBridgeTxHash(response.hash);
        console.log(`Transaction hash (on L1): ${response.hash}`);
        await response.wait();
        console.log("Waiting for status to change to RELAYED");
        await crossChainMessenger.waitForMessageStatus(response.hash, optimismSDK.MessageStatus.RELAYED);
        console.log(`depositETH took ${(new Date().getTime() - start.getTime()) / 1000} seconds\n\n`);
      } else if (chain?.name === "optimism") {
        // user is connected to Optimism, withdraw the asset
        const response = await crossChainMessenger.withdrawETH(amount);
        setBridgeTxHash(response.hash);
        console.log(`Transaction hash (on L2): ${response.hash}`);
        console.log(`\tFor more information: https://${chain}-optimism.etherscan.io/tx/${response.hash}`);
        await response.wait();
        console.log("Waiting for status to be READY_TO_PROVE");
        await crossChainMessenger.waitForMessageStatus(response.hash, optimismSDK.MessageStatus.READY_TO_PROVE);
        await crossChainMessenger.proveMessage(response.hash);
        console.log("In the challenge period, waiting for status READY_FOR_RELAY");
        await crossChainMessenger.waitForMessageStatus(response.hash, optimismSDK.MessageStatus.READY_FOR_RELAY);
        console.log("Ready for relay, finalizing message now");
        await crossChainMessenger.finalizeMessage(response.hash);
        console.log("Waiting for status to change to RELAYED");
        await crossChainMessenger.waitForMessageStatus(response.hash, optimismSDK.MessageStatus.RELAYED);
        console.log(`withdrawETH took ${(new Date().getTime() - start.getTime()) / 1000} seconds\n\n\n`);
      } else {
        console.log("Invalid network selected!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(parseFloat(event.target.value));
  };

  return (
    <div className="bg-gray-200 p-4 rounded-lg">
      <h2 className="text-lg font-bold mb-4">Bridge ETH</h2>
      <div className="flex mb-4">
        <input
          type="number"
          className="w-full border border-gray-400 p-2 mr-2 rounded-lg"
          value={amount}
          onChange={handleAmountChange}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          onClick={() => handleBridging(amount)}
        >
          Bridge
        </button>
      </div>
      {bridgeTxHash && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg mb-4">
          Bridge transaction submitted, hash: {bridgeTxHash}
        </div>
      )}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        data-modal="#myModal"
      >
        Show Modal
      </button>
      <div className="modal" id="myModal">
        <div className="modal__overlay"></div>
        <div className="modal__content p-4 rounded-lg bg-white">
          <h2 className="text-lg font-bold mb-4">Modal Title</h2>
          <p className="mb-4">Modal content goes here</p>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            data-modal-close
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Bridge;
