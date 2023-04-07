import { motion } from "framer-motion";
import { Cursor, useTypewriter } from "react-simple-typewriter";

const Hero = () => {
  const animation = {
    initial: { x: "100vw" },
    animate: { x: 0 },
    exit: { x: "-100vw" },
  };

  const [text] = useTypewriter({
    words: [
      "Welcome to Cross! Your safe, seccure and fast bridge between ethereum and optimism.",
      "Connect to Ethereum, bridge your assets to Optimism, and mint unique and rare Cross NFTs.",
      "Bridge assets and collect our rare tokens with appriciating value.",
    ],
    loop: true,
    delaySpeed: 3000,
  });

  return (
    <motion.div className="typing-text" variants={animation} initial="initial" animate="animate" exit="exit">
      <h1 className="text-xl lg:text-2xl font-semibold px-10">
        <span className="mr-3">{text}</span>
        <Cursor cursorColor="#FFFFFF" />
      </h1>
    </motion.div>
  );
};

export default Hero;
