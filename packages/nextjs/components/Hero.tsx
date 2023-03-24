import { motion } from "framer-motion";
import { useDarkMode } from "usehooks-ts";

const Hero = () => {
  const { isDarkMode } = useDarkMode(false);

  const textColor = isDarkMode ? "text-white" : "text-gray-900";
  const bgColor = isDarkMode ? "bg-gray-800" : "bg-white";

  return (
    <section className={`relative light:bg-black ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight ${textColor}`}
          >
            Bridge your assets to{" "}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 0.5, duration: 0.5 },
              }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500"
            >
              optimism
            </motion.span>{" "}
            and get{" "}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 1, duration: 0.5 },
              }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500"
            >
              rare NFTs
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className={`mt-4 text-base md:text-lg font-normal max-w-3xl ${textColor}`}
          >
            Connect to the Ethereum network, bridge your assets to Optimism, and mint unique and rare Cross NFTs.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.5 }}
            className="bg-indigo-500 text-white rounded-lg px-6 py-3 mt-8 font-medium tracking-wide shadow-lg"
          >
            Connect Wallet
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
