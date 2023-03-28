import * as optimismSDK from "@eth-optimism/sdk";
import { ethers } from "ethers";
import { Chain } from "wagmi";

export const config = (
  chain: (Chain & { unsupported?: boolean | undefined }) | undefined,
  address: string | number | undefined,
) => {
  const l1Url = `https://eth-goerli.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_GOERLI_KEY}`;
  const l2Url = `https://opt-goerli.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_OP_GOERLI_KEY}`;

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

  return { crossChainMessenger };
};
