"use client"

import React, { Suspense } from "react";
import dynamic from 'next/dynamic';
import { ToastContainer } from "react-toastify";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-[#C40600] mb-4"></div>
      <h2 className="text-2xl font-bold text-gray-800">Loading your customizer...</h2>
      <p className="text-gray-600 mt-2">Please wait while we prepare everything</p>
    </div>
  );
};

// Dynamically import SectionSelector with SSR disabled
const SectionSelector = dynamic(
  () => import("../components/ShirtCustomise/ShirtFeaturesSelect"),
  {
    loading: () => <LoadingScreen />,
    ssr: false
  }
);

const Page = () => {
  return (
    <div className="w-full font-play">
      <ToastContainer/>
      <Suspense fallback={<LoadingScreen />}>
        <SectionSelector />
      </Suspense>
    </div>
  );
};

export default Page;