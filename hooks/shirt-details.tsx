import { getBacksByColorAndFabric } from "@/lib/database/actions/admin/ShirtArea/Back/back.actions";
import { getBottomsByColorAndFabric } from "@/lib/database/actions/admin/ShirtArea/Bottom/bottom.actions";
import { getCollarsByColorAndFabric } from "@/lib/database/actions/admin/ShirtArea/Collar/collar.actions";
import { getCuffsByColorAndFabric } from "@/lib/database/actions/admin/ShirtArea/Cuff/cuff.actions";
import { getFitsByColorAndFabric } from "@/lib/database/actions/admin/ShirtArea/Fit/fit.actions";
import { getPlacketsByColorAndFabric } from "@/lib/database/actions/admin/ShirtArea/Placket/placket.actions";
import { getPocketsByColorAndFabric } from "@/lib/database/actions/admin/ShirtArea/Pocket/pocket.actions";
import { getSleevesByColorAndFabric } from "@/lib/database/actions/admin/ShirtArea/Sleeve/sleeve.action";
import { useEffect, useState } from "react";

// Define types for Collar and Cuff
interface Collar {
  _id?: string;
  style?: {
    name: string;
    image: {
      url: string;
      public_id: string;
    };
    icon: {
      url: string;
      public_id: string;
    };
    price: number;
  };
  height?: {
    name: string;
    icon: {
      url: string;
      public_id: string;
    };
    price: number;
  };
  collar_button?: {
    name: string;
    image: {
      url: string;
      public_id: string;
    };
    icon: {
      url: string;
      public_id: string;
    };
    price: number;
  };
}

interface Cuff {
  _id?: string;
  style?: {
    name: string;
    image: {
      url: string;
      public_id: string;
    };
    icon: {
      url: string;
      public_id: string;
    };
    price: number;
  };
  cufflinks?: {
    name: string;
    image: {
      url: string;
      public_id: string;
    };
    icon: {
      url: string;
      public_id: string;
    };
    price: number;
  };
}

// Define the main ProductData interface
interface ProductData {
  back: any[];
  bottom: any[];
  collarStyle: any[];
  collarHeight: any[];
  collarButton: any[];
  cuffStyle: any[];
  cuffLinks: any[];
  fit: any[];
  placket: any[];
  pocket: any[];
  sleeves: any[];
}

const useProductData = () => {
  const [data, setData] = useState<ProductData>({
    back: [],
    bottom: [],
    collarStyle: [],
    collarHeight: [],
    collarButton: [],
    cuffStyle: [],
    cuffLinks: [],
    fit: [],
    placket: [],
    pocket: [],
    sleeves: [],
  });

  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async () => {
    const fabricId = localStorage.getItem("fabricId");
    const colorId = localStorage.getItem("colorId");
    const gender = (localStorage.getItem("gender") || "male").toLowerCase();

    if (fabricId && colorId && gender) {
      setLoading(true);
      try {
        const [back, bottom, collar, cuff, fit, placket, pocket, sleeves] =
          await Promise.all([
            getBacksByColorAndFabric(fabricId, colorId, gender),
            getBottomsByColorAndFabric(fabricId, colorId, gender),
            getCollarsByColorAndFabric(fabricId, colorId, gender),
            getCuffsByColorAndFabric(fabricId, colorId, gender),
            getFitsByColorAndFabric(fabricId, colorId, gender),
            getPlacketsByColorAndFabric(fabricId, colorId, gender),
            getPocketsByColorAndFabric(fabricId, colorId, gender),
            getSleevesByColorAndFabric(fabricId, colorId, gender),
          ]);

        const collarStyle = collar
          ?.filter((collar: Collar) => collar.style?.name)
          .map((collar: Collar) => ({
            ...collar.style,
            _id: collar._id,
          }));

        const collarHeight = collar
          ?.filter((collar: Collar) => collar.height?.name)
          .map((collar: Collar) => ({
            ...collar.height,
            _id: collar._id,
          }));

        const collarButton = collar
          ?.filter((collar: Collar) => collar.collar_button?.name)
          .map((collar: Collar) => ({
            ...collar.collar_button,
            _id: collar._id,
          }));

        const cuffStyle = cuff
          ?.filter((cuff: Cuff) => cuff.style?.name)
          .map((cuff: Cuff) => ({
            ...cuff.style,
            _id: cuff._id,
          }));

        const cuffLinks = cuff
          ?.filter((cuff: Cuff) => cuff.cufflinks?.name)
          .map((cuff: Cuff) => ({ ...cuff.cufflinks, _id: cuff._id }));

        setData({
          back,
          bottom,
          collarStyle,
          collarHeight,
          collarButton,
          cuffStyle,
          cuffLinks,
          fit,
          placket,
          pocket,
          sleeves,
        });
      } catch (error) {
        console.error("Error fetching product data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "gender") {
        fetchData(); // Refetch data when gender changes in localStorage
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return { data, loading };
};

export default useProductData;
