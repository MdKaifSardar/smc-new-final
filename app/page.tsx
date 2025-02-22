"use client";

import React, { useEffect } from "react";

import Hero from "./components/hero";
import DiverseShirt from "./components/diverseShirt/DiverseShirt";
import Sponsers from "./components/sponsors/Index";
import Shirts from "./components/shirts/Shirts";
import Preloader from "./components/Preloader";
import DiscountPopup from "./components/newPopup/index";
import Topbar from "./components/topbar";
import { ToastContainer } from "react-toastify";

const Page = () => {
  useEffect(() => {
    localStorage.setItem("visited", "false");
  }, []); // Runs on every reload

  const visited = localStorage.getItem("visited");

  return (
    <>
      <ToastContainer />
      <DiscountPopup />
      {!(visited === "true") && <Preloader />}
      <Topbar />
      <Hero />
      <Shirts />
      <DiverseShirt />
      <Sponsers />
    </>
  );
};

export default Page;
