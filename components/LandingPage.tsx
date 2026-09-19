"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Image as ImageIcon,
  Wand2,
  BadgePoundSterling,
  Balloon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  // Framer Motion variants for a staggered entrance
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4">
      {/* Hero Text */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mb-12"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
          Studio photography, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
            without the studio.
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Transform raw product snapshots into 8K commercial catalog assets in
          seconds. No lighting gear, no location scouting, zero cost.
        </p>
        <Link href="/studio">
          <Button
            size="lg"
            className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
        <p className="text-sm text-gray-400 mt-4">
          No login or credit card required.
        </p>
      </motion.div>

      {/* Animated Visual Demonstration */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
      >
        {/* Step 1: Raw Image */}
        <motion.div
          variants={item}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900">1. Raw Photo</h3>
          <p className="text-sm text-gray-500 mt-2">
            Upload a quick phone snapshot of your product.
          </p>
        </motion.div>

        {/* Step 2: The Prompt */}
        <motion.div
          variants={item}
          className="bg-zinc-900 p-6 rounded-2xl shadow-lg border border-zinc-800 flex flex-col items-center relative transform md:scale-110 z-10"
        >
          <div className="absolute -top-3 -right-3 bg-blue-500 text-white p-1.5 rounded-full animate-bounce">
            <Balloon className="w-4 h-4" />
          </div>
          <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center mb-4">
            <Wand2 className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="font-semibold text-white">2. Describe Scene</h3>
          <p className="text-sm text-zinc-400 mt-2">
            "Resting on a mossy rock in a sunlit forest."
          </p>
        </motion.div>

        {/* Step 3: Final Output */}
        <motion.div
          variants={item}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-4 border border-blue-100">
            <ImageIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">3. Studio Asset</h3>
          <p className="text-sm text-gray-500 mt-2">
            Download your 8K photorealistic composition.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
