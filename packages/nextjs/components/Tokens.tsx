import { useEffect, useState } from "react";
import crossContract from "../generated/hardhat_contracts.json";
import { Address } from "./scaffold-eth";
import { NFTMetadata } from "./types";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import Spinner from "react-spinner";
import { useAccount, useProvider } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

const Tokens = () => {
  const [tokens, setTokens] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "owned">("owned");
  const [loading, setLoading] = useState(false);
  const provider = useProvider();
  const { address } = useAccount();
  const { data: allTokens } = useScaffoldContractRead("Cross", "getAllTokens");
  const cross = new ethers.Contract(
    crossContract[5][0].contracts.Cross.address,
    crossContract[5][0].contracts.Cross.abi,
    provider,
  );

  const fetchTokens = async () => {
    try {
      setLoading(true);

      const tokens: NFTMetadata[] = [];

      for (const token of allTokens) {
        const tokenId = token.id.toString();
        const { uri } = token;

        try {
          const response = await fetch(uri);
          const data = await response.json();
          const owner = await cross.ownerOf(tokenId);
          tokens.push({ ...data, owner });
        } catch (error) {
          console.error(error);
          continue; // Skip problematic token and continue fetching others
        }
      }
      setTokens(tokens);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  // Fetch tokens on component mount
  useEffect(() => {
    if (allTokens) {
      fetchTokens();
    }
  }, [allTokens]);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tokens</h1>
          <div className="flex items-center space-x-2">
            <button
              className={`${filter === "all" ? "bg-blue-500" : "bg-white text-black"} rounded-md px-4 py-2 font-medium`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`${
                filter === "owned" ? "bg-blue-500" : "bg-white text-black"
              } rounded-md px-4 py-2 font-medium`}
              onClick={() => setFilter("owned")}
            >
              Owned
            </button>
          </div>
        </div>

        {loading || !allTokens ? (
          <div className="flex justify-center items-center h-96">
            <Spinner />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {tokens &&
              tokens
                .filter(token => filter === "all" || token.owner === address)
                .map(token => (
                  <div
                    key={token.name}
                    className="rounded-md shadow-xl p-2 nft-card overflow-hidden flex flex-col justify-between"
                  >
                    <div className="relative">
                      <img src={token.image} alt={token.name} className="w-full h-64 object-cover" />
                      <div className="absolute bottom-0 right-0 bg-blue-500 text-white px-2 py-1 rounded-bl-md">
                        {token.attributes[1].value} ETH
                      </div>
                    </div>
                    <div className="p-4">
                      <h2 className="text-lg font-medium mb-2">{token.name}</h2>
                      <p className="text-gray-500 text-sm mb-4">{token.description}</p>
                      <div className="flex items-center flex-col space-y-2">
                        <span className="text-gray-400 text-sm">Owned by:</span>
                        <span className="font-normal tracking-wide text-sm uppercase">
                          <Address address={filter === "all" ? token.owner : address} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Tokens;
