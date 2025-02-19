"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAllTopbars } from "@/lib/database/actions/admin/topbar/topbar.actions";

interface TopbarData {
  type: "marquee" | "static";
  text: string;
}

export default function Topbar() {
  const [topbar, setTopbar] = useState<TopbarData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopbar = async () => {
      try {
        const result = await getAllTopbars();

        if (!result.success || !result.topbars || result.topbars.length === 0) {
          setError("No topbar data available.");
          return;
        }

        const topbarData = {
          type: result.topbars[0].type as "marquee" | "static",
          text: result.topbars[0].text
        };
        setTopbar(topbarData);
      } catch (err) {
        setError("Failed to fetch topbar data.");
        console.error("Error fetching topbar:", err);
      }
    };

    fetchTopbar();
  }, []);

  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!topbar) return null;

  return (
    <div className="mt-[8rem] text-white font-play bg-black py-2">
      {topbar.type === "marquee" ? (
        <div className="overflow-hidden whitespace-nowrap relative">
          <motion.div
            className="inline-block px-10 text-xl font-bold"
            initial={{ x: "100%" }}
            animate={{ x: "-100%" }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          >
            {topbar.text}
          </motion.div>
        </div>
      ) : (
        <p className="text-center text-lg font-medium">{topbar.text}</p>
      )}
    </div>
  );
}
