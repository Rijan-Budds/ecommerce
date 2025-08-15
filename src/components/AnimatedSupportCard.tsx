"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const LETTER_DELAY = 0.025;
const BOX_FADE_DURATION = 0.125;
const FADE_DELAY = 5;
const MAIN_FADE_DURATION = 0.25;
const SWAP_DELAY_IN_MS = 5500;

const Typewrite = ({ examples }: { examples: string[] }) => {
  const [exampleIndex, setExampleIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setExampleIndex((pv) => (pv + 1) % examples.length);
    }, SWAP_DELAY_IN_MS);

    return () => clearInterval(intervalId);
  }, [examples.length]);

  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
      <div className="flex items-center mb-3">
        <div className="w-2 h-2 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-full mr-3 animate-pulse"></div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#0D3B66] dark:text-[#1E5CAF]">
          Common Questions
        </span>
      </div>
      <div className="text-lg font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
        {examples[exampleIndex].split("").map((l, i) => (
          <motion.span
            initial={{
              opacity: 1,
            }}
            animate={{
              opacity: 0,
            }}
            transition={{
              delay: FADE_DELAY,
              duration: MAIN_FADE_DURATION,
              ease: "easeInOut",
            }}
            key={`${exampleIndex}-${i}`}
            className="relative"
          >
            <motion.span
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: i * LETTER_DELAY,
                duration: 0,
              }}
            >
              {l}
            </motion.span>
            <motion.span
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: [0, 1, 0],
              }}
              transition={{
                delay: i * LETTER_DELAY,
                times: [0, 0.1, 1],
                duration: BOX_FADE_DURATION,
                ease: "easeInOut",
              }}
              className="absolute bottom-[2px] left-[1px] right-0 top-[2px] bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-sm"
            />
          </motion.span>
        ))}
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="inline-block w-1 h-6 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] ml-1 rounded-sm"
        />
      </div>
    </div>
  );
};

export const AnimatedSupportCard = () => {
  return (
    <div className="w-full">
      <Typewrite
        examples={[
          "How do I track my order status?",
          "What's your return policy?",
          "Do you ship to all cities in Nepal?",
          "Can I cancel my order before shipping?",
        ]}
      />
    </div>
  );
};
