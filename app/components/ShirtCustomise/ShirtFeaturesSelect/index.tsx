"use client";
import useProductData from "@/hooks/shirt-details";
import { createShirt } from "@/lib/database/actions/admin/ShirtArea/Shirt/shirt.actions";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { getFabricById } from "@/lib/database/actions/admin/ShirtArea/Fabric/fabric.actions";
import { getColorById } from "@/lib/database/actions/admin/ShirtArea/Color/color.actions";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai";

const sections = [
  "bottom",
  "back",
  "placket",
  "pocket",
  "sleeves",
  "fit",
  "collarStyle",
  "collarHeight",
  "collarButton",
  "cuffStyle",
  "cuffLinks",
];

interface ProductItem {
  _id: string;
  name: string;
  icon?: { url: string };
  image?: { url: string };
  price?: number;
}

interface ProductData {
  bottom?: ProductItem[];
  back?: ProductItem[];
  placket?: ProductItem[];
  pocket?: ProductItem[];
  sleeves?: ProductItem[];
  fit?: ProductItem[];
  collarStyle?: ProductItem[];
  collarHeight?: {
    _id: string;
    name: string;
    icon: { url: string };
    price: number;
  }[];
  collarButton?: ProductItem[];
  cuffStyle?: ProductItem[];
  cuffLinks?: ProductItem[];
  watchCompatible?: ProductItem[];
}
interface ShirtItem {
  name: string;
  image: string;
  price: number;
}

interface Shirt {
  bottom?: ShirtItem;
  back?: ShirtItem;
  placket?: ShirtItem;
  pocket?: ShirtItem;
  collarStyle?: ShirtItem;
  collarHeight?: ShirtItem;
  collarButton?: ShirtItem;
  cuffStyle?: ShirtItem;
  cuffLinks?: ShirtItem;
  fit?: ShirtItem;
  sleeves?: ShirtItem;
  watchCompatible?: ShirtItem;
}

const ShirtCustomizer = () => {
  const [totalPrice, setTotalPrice] = useState(0);
  const { data, loading } = useProductData() as {
    data: ProductData;
    loading: boolean;
  };
  const { user } = useUser();
  const [selectedItems, setSelectedItems] = useState<{
    [key in keyof ProductData]?: ProductItem;
  }>({});
  const [watchCompatible, setWatchCompatible] = useState("No");
  const handleWatchCompatibleChange = (value: string) => {
    setWatchCompatible(value);
  };
  const [isCollarOpen, setIsCollarOpen] = useState(true);
  const [isCuffOpen, setIsCuffOpen] = useState(true);
  const [longSleeveSelected, setLongSleeveSelected] = useState(false);
  const [isBackPopupOpen, setIsBackPopupOpen] = useState(false);
  const [selectedBackImage, setSelectedBackImage] = useState<string | null>(
    null
  );
  const [shirt, setShirt] = useState<Shirt>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showMonogramOptions, setShowMonogramOptions] = useState(false);
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<keyof ProductData | null>(
    null
  );
  const [isPleatSelected, setIsPleatSelected] = useState(false);
  const [fabricName, setFabricName] = useState<string | null>(null);
  const [fabricDescription, setFabricDescription] = useState<string | null>(
    null
  );
  const [colorName, setColorName] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<
    keyof ProductData | null
  >(null);
  const [gender, setGender] = useState<"male" | "female">(
    (localStorage.getItem("gender")?.toLowerCase() as "male" | "female") ||
      "male"
  );

  const toggleAccordion = (section: keyof ProductData) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const handleCancelAccordion = () => {
    setExpandedSection(null); // Close the current accordion
  };

  const handleProceedAccordion = () => {
    if (expandedSection !== null) {
      const currentIndex = sections.indexOf(expandedSection);

      if (currentIndex !== -1) {
        let nextIndex = currentIndex + 1;

        // Skip sections based on conditions (e.g., long sleeves or pleat selection)
        while (
          nextIndex < sections.length &&
          ((!longSleeveSelected &&
            ["cuffStyle", "cuffLinks"].includes(sections[nextIndex])) ||
            (isPleatSelected && sections[nextIndex] === "pocket"))
        ) {
          nextIndex++;
        }

        if (nextIndex < sections.length) {
          setExpandedSection(sections[nextIndex] as keyof ProductData); // Open the next accordion
        } else {
          setExpandedSection(null); // Close all accordions if it's the last section
        }
      }
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCreateShirt = async () => {
    const price = totalPrice;
    try {
      const colorId = localStorage.getItem("colorId");
      const fabricId = localStorage.getItem("fabricId");

      if (!colorId || !fabricId) {
        toast.error("Color ID and Fabric ID are required.");
        return;
      }

      if (!user?.id) {
        toast.error("Please login first");
        return;
      }

      const shirtData = {
        bottom: shirt.bottom || {},
        back: shirt.back || {},
        sleeves: shirt.sleeves || {},
        cuffStyle: shirt.cuffStyle || {},
        cuffLinks: shirt.cuffLinks || {},
        collarStyle: shirt.collarStyle || {},
        collarHeight: shirt.collarHeight || {},
        collarButton: shirt.collarButton || {},
        placket: shirt.placket || {},
        pocket: shirt.pocket || {},
        fit: shirt.fit || {},
      };

      console.log(shirtData);

      const response = await createShirt(
        price,
        shirtData.bottom,
        shirtData.back,
        shirtData.sleeves,
        shirtData.cuffStyle,
        shirtData.cuffLinks,
        shirtData.collarStyle,
        shirtData.collarHeight,
        shirtData.collarButton,
        shirtData.placket,
        shirtData.pocket,
        shirtData.fit,
        watchCompatible,
        colorId,
        fabricId,
        user.id
      );

      if (response.success) {
        localStorage.setItem("shirtId", response.shirt._id); // Save shirtId
        toast.success("Shirt created successfully!");
        setIsSubmitted(true);
      } else {
        toast.error(response.message || "Failed to create the shirt.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred.");
    }
  };

  const assignItemToSection = (
    section: keyof Shirt,
    item: ProductItem | null
  ) => {
    setShirt((prev) => {
      const updatedShirt = { ...prev };
      if (item === null) {
        delete updatedShirt[section];
      } else {
        updatedShirt[section] = {
          name: item.name,
          image: item.image?.url ?? "",
          price: item.price ?? 0,
        };
      }
      return updatedShirt;
    });
  };

  const calculateTotalPrice = (items: Record<string, ProductItem>) => {
    return Object.values(items).reduce(
      (total, item) => total + (item.price || 0),
      0
    );
  };

  useEffect(() => {
    console.log(shirt);
  }, [shirt]);

  useEffect(() => {
    // Reset selected items and shirt model when data changes
    setSelectedItems({});
    setShirt({});
  }, [data]);

  useEffect(() => {
    // Set default selections without localStorage
    sections.forEach((section) => {
      if (section === "cuffStyle" || section === "cuffLinks") return;

      if (data && data[section as keyof ProductData]?.length) {
        let defaultItem = data[section as keyof ProductData]![0];

        // Skip assigning pocket if the default placket is pleat
        if (section === "pocket") {
          const defaultPlacket = data?.placket?.[0];
          if (
            defaultPlacket &&
            defaultPlacket.name.toLowerCase().includes("pleat")
          ) {
            return;
          }
        }

        if (section === "collarStyle") {
          const regularCollar = data.collarStyle?.find((item) =>
            item.name.toLowerCase().includes("regular")
          );

          if (regularCollar) {
            defaultItem = regularCollar;

            // Assign and set selected items similar to 'sleeves'
            assignItemToSection("collarStyle", regularCollar);
            setSelectedItems((prev) => ({
              ...prev,
              collarStyle: regularCollar,
            }));
          }
        }

        assignItemToSection(section as keyof Shirt, defaultItem); // Assign to the shirt object

        if (
          section === "sleeves" &&
          defaultItem.name.toLowerCase().includes("long")
        ) {
          setLongSleeveSelected(true);

          // Assign default cuffStyle and cuffLinks if sleeves are long
          const cuffStyleDefault = data?.cuffStyle?.[0];
          const cuffLinksDefault = data?.cuffLinks?.[0];

          if (cuffStyleDefault) {
            assignItemToSection("cuffStyle", cuffStyleDefault);
          }
          if (cuffLinksDefault) {
            assignItemToSection("cuffLinks", cuffLinksDefault);
          }

          setSelectedItems((prev) => ({
            ...prev,
            cuffStyle: cuffStyleDefault || prev.cuffStyle,
            cuffLinks: cuffLinksDefault || prev.cuffLinks,
            sleeves: defaultItem,
          }));
        }

        if (
          section === "placket" &&
          defaultItem.name.toLowerCase().includes("pleat")
        ) {
          setIsPleatSelected(true);
        }

        if (section !== "back") {
          setSelectedItems((prev) => {
            const updatedItems = { ...prev, [section]: defaultItem };
            const newTotalPrice = calculateTotalPrice(updatedItems);
            setTotalPrice(newTotalPrice);
            return updatedItems;
          });
        }
      }
    });
  }, [data]);

  const handleSelect = (section: keyof ProductData, item: ProductItem) => {
    assignItemToSection(section as keyof Shirt, item);

    if (section === "sleeves") {
      const isLongSleeve = item.name.toLowerCase().includes("long");
      setLongSleeveSelected(isLongSleeve);

      setSelectedItems((prev) => {
        const updatedItems = { ...prev, sleeves: item };

        if (isLongSleeve) {
          const cuffStyleDefault = data?.cuffStyle?.[0];
          const cuffLinksDefault = data?.cuffLinks?.[0];

          if (cuffStyleDefault)
            assignItemToSection("cuffStyle", cuffStyleDefault);
          if (cuffLinksDefault)
            assignItemToSection("cuffLinks", cuffLinksDefault);

          return {
            ...updatedItems,
            cuffStyle: cuffStyleDefault,
            cuffLinks: cuffLinksDefault,
          };
        }

        // Remove cuffStyle, cuffLinks, and set watchCompatible to "No" for short sleeves
        assignItemToSection("cuffStyle", null);
        assignItemToSection("cuffLinks", null);
        setWatchCompatible("No");
        assignItemToSection("watchCompatible", null);
        delete updatedItems["cuffStyle"];
        delete updatedItems["cuffLinks"];

        return updatedItems;
      });
    }

    if (section === "placket") {
      const isPleat = item.name.toLowerCase().includes("pleat");
      setIsPleatSelected(isPleat);

      setSelectedItems((prev) => {
        const updatedItems = { ...prev };

        if (isPleat) {
          delete updatedItems["pocket"]; // Completely remove pocket when pleat is selected
          assignItemToSection("pocket", null);
        } else {
          const defaultPocket = data?.pocket?.[0]; // Restore default pocket
          if (defaultPocket) {
            updatedItems["pocket"] = defaultPocket;
            assignItemToSection("pocket", defaultPocket);
          }
        }

        return updatedItems;
      });
    }

    if (section === "back") {
      setIsBackPopupOpen(true);
      setSelectedBackImage(item.image?.url ?? null);
      assignItemToSection(section as keyof Shirt, item);
      return;
    }

    setSelectedItems((prev) => {
      const updatedItems = { ...prev, [section]: item };
      setTotalPrice(calculateTotalPrice(updatedItems));
      return updatedItems;
    });
  };

  const toggleCollarSection = () => {
    setIsCollarOpen((prev) => !prev);
  };

  const toggleCuffSection = () => {
    setIsCuffOpen((prev) => !prev);
  };

  const getZIndex = (section: string, index: number) => {
    if (section === "collarStyle") return 5;
    if (section === "collarButton") return 6;
    if (section === "cuffStyle") return 7;
    if (section === "cuffLinks") return 8;
    if (section === "placket" || section === "pocket") return 4;
    if (section === "sleeves") return 3;
    if (section === "fit") return 2;
    if (section === "bottom") return 3;
    return index;
  };

  const closeBackPopup = () => {
    setIsBackPopupOpen(false);
    setSelectedBackImage(null);
  };

  useEffect(() => {
    const fetchFabricAndColorDetails = async () => {
      const fabricId = localStorage.getItem("fabricId");
      const colorId = localStorage.getItem("colorId");

      if (fabricId) {
        const fabricResponse = await getFabricById(fabricId);
        if (fabricResponse.success) {
          setFabricName(fabricResponse.fabric.fabricName);
          setFabricDescription(
            fabricResponse.fabric.description || "No description available."
          );
        }
      }

      if (colorId) {
        const colorResponse = await getColorById(colorId);
        if (colorResponse.success) {
          setColorName(colorResponse.color.name);
        }
      }
    };

    fetchFabricAndColorDetails();
  }, []);

  const handleGenderChange = (selectedGender: "male" | "female") => {
    const normalizedGender = selectedGender.toLowerCase() as "male" | "female";
    localStorage.setItem("gender", normalizedGender);
    window.location.reload(); // Reload the page
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-center w-full mt-4 mb-6">
        Custom Shirt
      </h1>
      <div className="gap-[1rem] md:gap-0 flex-col md:flex-row justify-start md:justify-between items-start mb-10 flex w-full h-fit">
        <div className="w-full h-fit flex flex-col justify-center items-center">
          <div className="relative lg:pt-[5rem] xl:pt-[0rem] pt-[0rem] flex justify-center items-center w-full h-[87vh]">
            {Object.entries(selectedItems).map(([section, item], index) =>
              item.image?.url ? (
                <img
                  key={index}
                  src={item.image.url}
                  alt={item.name}
                  className="absolute top-auto bottom-auto left-auto right-auto w-[80rem] sm:w-[70vw] md:w-[50vw] 2xl:w-[37vw] xl:w-[35vw] h-auto object-cover rounded-none"
                  style={{
                    zIndex: getZIndex(section, index),
                  }}
                />
              ) : null
            )}
          </div>

          <div className="shadow-md rounded-[1rem] p-[1rem] bg-white w-full h-fit flex flow-row justify-between items-start">
            <div className="w-full h-fit flex flex-col justify-start items-start">
              {/* Fabric Details Section */}
              {fabricName && (
                <h2 className="text-3xl font-bold text-gray-800">
                  {fabricName}
                </h2>
              )}
              {fabricDescription && (
                <p className="text-lg text-gray-600 mt-2">
                  {fabricDescription}
                </p>
              )}
              {colorName && (
                <p className="text-xl font-semibold text-gray-800 mt-4">
                  Color: {colorName}
                </p>
              )}
            </div>

            <div className="w-full h-fit flex flex-col justify-center items-end">
              <div className="text-xl font-bold">
                Price: ${totalPrice.toFixed(2)}
              </div>
              <button
                onClick={handleOpenModal}
                className="bg-[#C40600] text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-300 hover:text-black text-semibold transition duration-300"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {isModalOpen && (
          <div className="z-[100] fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96 space-y-4 relative">
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl font-bold"
              >
                &times; {/* Cross Icon */}
              </button>

              <h2 className="text-2xl font-bold mb-4 text-center">
                Confirm Shirt Details
              </h2>

              <div className="space-y-2">
                {Object.entries(shirt).map(
                  ([key, value]) =>
                    value && (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium capitalize">{key}:</span>
                        <span>{value.name}</span>
                      </div>
                    )
                )}
                <div className="flex justify-between text-lg font-bold mt-4">
                  <span>Total Price:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {!isSubmitted ? (
                <div className="flex justify-between space-x-4">
                  <button
                    onClick={handleCreateShirt}
                    className="bg-[#C40600] text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-200 hover:text-black text-semibold transition duration-300"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-[#C40600] text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-200 hover:text-black text-semibold transition duration-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="w-full gap-[.4rem] flex flex-row justify-center items-center">
                  {!showMonogramOptions && (
                    <div className="w-full gap-[.4rem] flex flex-row items-center justify-center">
                      <Link
                        className="bg-[#C40600] text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-200 hover:text-black text-semibold transition duration-300"
                        href="/monogram"
                      >
                        Add Monogram
                      </Link>
                      <Link
                        href="/measurement"
                        className="bg-[#C40600] text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-200 hover:text-black text-semibold transition duration-300"
                      >
                        No Monogram
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {isBackPopupOpen && selectedBackImage && (
          <div className="absolute w-fit h-fit top-auto left-auto right-auto bottom-auto bg-opacity-50 flex justify-center items-center z-[100]">
            <div className="bg-white rounded-lg">
              <h3 className="text-xl font-bold">Selected Back</h3>
              <img
                src={selectedBackImage}
                alt="Selected Back"
                className="w-[30rem] h-auto object-cover"
              />
              <button
                onClick={closeBackPopup}
                className="mt-4 py-2 px-4 bg-red-500 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div className="w-full gap-[1rem] flex flex-col justify-center items-center md:w-[40%] xl:w-[40%] h-fit">
          <div className="bg-white p-[1rem] rounded-[1rem] shadow-md gap-[.3rem] flex flex-col justify-center items-center md:items-start w-full h-fit">
            <Link href="/cart" className="bg-[#C40600] text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-200 hover:text-black transition duration-300">
              Apply Style from History
            </Link>
            {/* Gender Selection */}
            <div className="text-[1.5rem] font-semibold">Gender Selection</div>
            <div className="flex space-x-4">
              <button
                onClick={() => handleGenderChange("male")}
                className={`py-3 px-6 rounded-lg font-medium transition duration-300 ${
                  gender === "male"
                    ? "bg-[#C40600] text-white"
                    : "bg-gray-200 text-black hover:bg-gray-300"
                }`}
              >
                Male
              </button>
              <button
                onClick={() => handleGenderChange("female")}
                className={`py-3 px-6 rounded-lg font-medium transition duration-300 ${
                  gender === "female"
                    ? "bg-[#C40600] text-white"
                    : "bg-gray-200 text-black hover:bg-gray-300"
                }`}
              >
                Female
              </button>
            </div>
          </div>

          <div className="p-4 w-full bg-white h-full flex flex-col justify-start items-center shadow-lg rounded-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Shirt Customizer
            </h2>

            <div className="flex flex-col justify-center w-full">
              {sections.map((section) => {
                const isDisabled =
                  (section === "pocket" && isPleatSelected) ||
                  ((section === "cuffStyle" || section === "cuffLinks") &&
                    !longSleeveSelected);

                return (
                  <div key={section} className="mb-4">
                    <button
                      onClick={() =>
                        toggleAccordion(section as keyof ProductData)
                      }
                      className={`w-full text-left p-3 border rounded-lg flex justify-between items-center ${
                        isDisabled
                          ? "bg-gray-200 cursor-not-allowed opacity-50"
                          : "hover:bg-gray-100"
                      }`}
                      disabled={isDisabled}
                    >
                      <span>
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                      </span>
                      {expandedSection === section ? (
                        <AiOutlineUp className="text-gray-600" />
                      ) : (
                        <AiOutlineDown className="text-gray-600" />
                      )}
                    </button>

                    {expandedSection === section && (
                      <div className="relative mt-2 border rounded-lg bg-gray-50">
                        <div className="max-h-[300px] overflow-y-auto p-4">
                          {data[section]?.length === 0 ? (
                            <p className="text-center text-gray-500">
                              No items available in {section}.
                            </p>
                          ) : (
                            <div className="grid grid-cols-2 gap-4">
                              {data[section]?.map((item) => (
                                <div
                                  key={item._id}
                                  onClick={() =>
                                    handleSelect(
                                      section as keyof ProductData,
                                      item
                                    )
                                  }
                                  className={`p-4 border rounded-lg cursor-pointer transition shadow-sm ${
                                    selectedItems[section]?._id === item._id
                                      ? "bg-blue-100 border-blue-500 ring-2 ring-blue-400"
                                      : "hover:bg-gray-100"
                                  }`}
                                >
                                  {item.icon?.url && (
                                    <img
                                      src={item.icon.url}
                                      alt={item.name}
                                      className="w-20 h-20 object-cover mx-auto rounded-md"
                                    />
                                  )}
                                  <p className="text-center font-semibold text-gray-800 mt-2">
                                    {item.name}
                                  </p>
                                  <p className="text-center text-sm text-gray-600">
                                    ${item.price || 0}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-between">
                          <button
                            onClick={handleCancelAccordion}
                            className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition duration-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleProceedAccordion}
                            className="bg-[#C40600] text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-200 hover:text-black transition duration-300"
                          >
                            Proceed
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Watch Compatible Option */}
              <div className="w-full">
                <button
                  onClick={() =>
                    toggleAccordion("watchCompatible" as keyof ProductData)
                  }
                  className={`w-full text-left p-3 border rounded-lg ${
                    !longSleeveSelected
                      ? "bg-gray-200 cursor-not-allowed opacity-50"
                      : "hover:bg-gray-100"
                  }`}
                  disabled={!longSleeveSelected}
                >
                  Watch Compatible
                </button>

                {expandedSection === "watchCompatible" &&
                  longSleeveSelected && (
                    <div className="relative mt-2 border rounded-lg bg-gray-50">
                      <div className="max-h-[300px] overflow-y-auto p-4">
                        <select
                          value={watchCompatible}
                          onChange={(e) =>
                            handleWatchCompatibleChange(e.target.value)
                          }
                          className="w-full p-3 border rounded-lg"
                        >
                          <option value="No">No</option>
                          <option value="Left">Left</option>
                          <option value="Right">Right</option>
                        </select>
                      </div>
                      <div className="sticky bottom-0 bg-white p-4 border-t flex justify-between">
                        <button
                          onClick={handleCancelAccordion}
                          className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition duration-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleProceedAccordion}
                          className="bg-[#C40600] text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-200 hover:text-black transition duration-300"
                        >
                          Proceed
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShirtCustomizer;
