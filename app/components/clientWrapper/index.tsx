"use client";

import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "../Navbar/Navbar";
import Footer from "../footer/Footer";

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isVisitedFetched, setIsVisitedFetched] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem("visited");
    if (!visited || visited === "false") {
      localStorage.setItem("visited", "true");
    }
    setIsVisitedFetched(true);
  }, []);

  return (
    <>
      {isVisitedFetched && (
        <>
          <Navbar />
          <main>{children}</main>{" "}
          <Toaster />
          <Footer />
        </>
      )}
    </>
  );
};

export default ClientWrapper;
