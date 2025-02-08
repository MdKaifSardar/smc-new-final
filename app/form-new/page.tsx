"use client"

import React, { useState, useEffect } from "react";
import SectionSelector from "../components/ShirtCustomise/ShirtFeaturesSelect";
import { ToastContainer } from "react-toastify";

const Page = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [componentLoaded, setComponentLoaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkLoading = async () => {
      try {
        // Check if component is loaded
        setComponentLoaded(true);

        // Add your data loading checks here
        // For example, if you're fetching data:
        // const data = await fetchYourData();
        // if (data) setDataLoaded(true);

        // For now, we'll simulate data loading
        setTimeout(() => {
          if (mounted) {
            setDataLoaded(true);
          }
        }, 1000);

        // If everything is loaded, stop loading state
        if (componentLoaded && dataLoaded) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error during loading:", error);
      }
    };

    checkLoading();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, [componentLoaded, dataLoaded]);

  return (
    <div className="w-full pt-8 font-play">
      <ToastContainer />
      {isLoading || !componentLoaded || !dataLoaded ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <SectionSelector />
      )}
    </div>
  );
};

export default Page;