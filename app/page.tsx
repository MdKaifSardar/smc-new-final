"use client";

import React, { useState, useEffect } from "react";

import Hero from "./components/hero";
import DiverseShirt from "./components/diverseShirt/DiverseShirt";
import Sponsers from "./components/sponsors/Index";
import Shirts from "./components/shirts/Shirts";
import Preloader from "./components/Preloader";
import DiscountPopup from "./components/newPopup/index";
import Topbar from "./components/topbar";
import { ToastContainer } from "react-toastify";

const Page = () => {
  const [showPreloader, setShowPreloader] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const visited = localStorage.getItem("visited");

    if (!visited || visited === "false") {
      setShowPreloader(true);
      console.log("Preloader enabled, visited:", visited);

      setTimeout(() => {
        localStorage.setItem("visited", "true");
        setShowPreloader(false);
      }, 5000); // Adjust preloader duration as needed
    } else {
      localStorage.setItem("visited", "true"); // Ensures `visited` is "true" on refresh
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setTimeout(() => {
          if (document.visibilityState === "hidden") {
            localStorage.setItem("visited", "false");
          }
        }, 100); // Delay to differentiate between refresh and tab close
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // if (isLoading) return null; // Prevent rendering until localStorage is checked

  return (
    <>
      <ToastContainer />
      <DiscountPopup />
      {showPreloader && <Preloader />}
      <Topbar />
      <Hero />
      <Shirts />
      <DiverseShirt />
      <Sponsers />
    </>
  );
};

export default Page;
