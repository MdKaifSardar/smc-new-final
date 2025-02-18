"use client";

import React from "react";

import Hero from "./components/hero";
import DiverseShirt from "./components/diverseShirt/DiverseShirt";
// import Explore from './components/explore/Explore'
import Footer from "./components/footer/Footer";
import Sponsers from "./components/sponsors/Index";
import Shirts from "./components/shirts/Shirts";
import Preloader from "./components/Preloader";
import DiscountPopup from "./components/newPopup/index";
import Topbar from "./components/topbar";
import { ToastContainer } from "react-toastify";

const page = () => {
  return (
    <>
      <ToastContainer />
      <DiscountPopup />
      <Preloader />
      <Topbar />
      <Hero />
      {/* <Explore/> */}
      <Shirts />
      <DiverseShirt />
      {/* <Explore/> */}
      <Sponsers />
      {/* <Footer/> */}
    </>
  );
};

export default page;
