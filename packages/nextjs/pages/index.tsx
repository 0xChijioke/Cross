import Head from "next/head";
import type { NextPage } from "next";
import CrossNFTs from "~~/components/CrossNFTs";

const Home: NextPage = () => {
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
