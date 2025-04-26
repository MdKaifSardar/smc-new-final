"use client";

import React, { useEffect, useState } from "react";

import Hero from "./components/hero";
import DiverseShirt from "./components/diverseShirt/DiverseShirt";
import Sponsers from "./components/sponsors/Index";
import Shirts from "./components/shirts/Shirts";
import Preloader from "./components/Preloader";
import DiscountPopup from "./components/newPopup/index";
// import Topbar from "./components/topbar";
import { ToastContainer } from "react-toastify";

const Page = () => {
  const [visited, setVisited] = useState<string>("");

  useEffect(() => {
    const temp = localStorage.getItem("visited") ?? "false"; // Ensure it's never null
    setVisited(temp);
    localStorage.setItem("visited", "false"); // Reset visited on reload
  }, []);

  return (
    <>
      <ToastContainer />
      <DiscountPopup />
      {visited !== "true" && <Preloader />}
      <Hero />
      <Shirts />
      <DiverseShirt />
      {/* <Sponsers /> */}
    </>
  );
};

export default Page;
