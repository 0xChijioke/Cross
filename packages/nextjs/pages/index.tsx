import Head from "next/head";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import CrossNFTs from "~~/components/CrossNFTs";

const Home: NextPage = () => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="w-full flex my-auto justify-center items-center uppercase tracking-widest">
        Connect your wallet
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Cross</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>

      <div className="flex items-center flex-col min-h-screen my-10 flex-grow pt-10">
        <CrossNFTs />
      </div>
    </>
  );
};

export default Home;
