import Head from "next/head";
import type { NextPage } from "next";
// import { BugAntIcon, SparklesIcon } from "@heroicons/react/24/outline";
import CrossNFTs from "~~/components/CrossNFTs";

// import Hero from "~~/components/Hero";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Cross</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>

      <div className="flex items-center flex-col flex-grow pt-10">
        {/* <Hero /> */}
        <CrossNFTs />
      </div>
    </>
  );
};

export default Home;
