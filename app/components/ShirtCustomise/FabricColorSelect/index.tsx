"use client";
import { useState, useEffect } from "react";
import { getAllFabrics } from "@/lib/database/actions/admin/ShirtArea/Fabric/fabric.actions";
import { getColorByFabric } from "@/lib/database/actions/admin/ShirtArea/Color/color.actions";
import { FaSpinner } from "react-icons/fa";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai";
import Loader from "@/app/components/Loader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ITEMS_PER_PAGE = 24; // 8 rows of 3 fabrics

interface Color {
  _id: string;
  name: string;
  hexCode: string;
  image: {
    url: string;
    public_id: string;
  };
}

interface Fabric {
  _id: string;
  fabricName: string;
  price?: number; // <-- added optional price field
  discount?: number; // <-- added optional discount field
}

const FabricsWithColors = () => {
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [colors, setColors] = useState<{ [fabricId: string]: Color[] }>({});
  const [selectedColorImages, setSelectedColorImages] = useState<{
    [fabricId: string]: string | undefined;
  }>({});
  const [isNextEnabled, setIsNextEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  // New filter states as arrays
  const [selectedFabricTypes, setSelectedFabricTypes] = useState<string[]>([]);
  const [selectedFabricColors, setSelectedFabricColors] = useState<string[]>(
    []
  );
  const [availableColors, setAvailableColors] = useState<Color[]>([]); // <-- New state for available colors
  const [selectedFabricName, setSelectedFabricName] = useState<string | null>(
    null
  );
  const [selectedColorName, setSelectedColorName] = useState<string | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isFabricTypeCollapsed, setIsFabricTypeCollapsed] = useState(false);
  const [isFabricColorCollapsed, setIsFabricColorCollapsed] = useState(false);

  useEffect(() => {
    const fetchFabrics = async () => {
      try {
        const fabricsData = await getAllFabrics();
        setFabrics(fabricsData);

        const allColors: Color[] = [];
        const colorPromises = fabricsData.map(async (fabric: Fabric) => {
          try {
            const colorData = await getColorByFabric(fabric._id);
            setColors((prev) => ({
              ...prev,
              [fabric._id]: colorData,
            }));
            allColors.push(...colorData);
            if (colorData.length > 0) {
              setSelectedColorImages((prev) => ({
                ...prev,
                [fabric._id]: colorData[0].image.url,
              }));
            }
          } catch (error) {
            toast.error(
              `Failed to fetch colors for fabric: ${fabric.fabricName}`
            );
          }
        });

        // Wait for all color data to be fetched
        await Promise.all(colorPromises);

        // Extract unique colors by name (case-insensitive) across all fabrics
        const uniqueColors = Array.from(
          new Map(
            allColors.map((color) => [color.name.toLowerCase(), color]) // Use Map to ensure uniqueness by lowercase name
          ).values()
        );
        setAvailableColors(uniqueColors);

        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch fabrics. Please try again later.");
        setLoading(false);
      }
    };
    fetchFabrics();
  }, []);

  useEffect(() => {
    setIsNextEnabled(
      selectedFabricTypes.length > 0 && selectedFabricColors.length > 0
    );
  }, [selectedFabricTypes, selectedFabricColors]);

  // Filter fabrics based on selected types and if any color filter is applied, fabrics must have at least one matching color.
  const filteredFabrics = fabrics.filter((fabric) => {
    const typeMatch =
      selectedFabricTypes.length > 0
        ? selectedFabricTypes.includes(fabric.fabricName)
        : true;
    const fabricColors = colors[fabric._id] || [];
    const colorMatch =
      selectedFabricColors.length > 0
        ? fabricColors.some((c) =>
            selectedFabricColors.some(
              (selectedColorId) =>
                c._id === selectedColorId ||
                c.name.toLowerCase() ===
                  availableColors
                    .find((ac) => ac._id === selectedColorId)
                    ?.name.toLowerCase()
            )
          )
        : true;
    return typeMatch && colorMatch;
  });

  // Handlers for type checkboxes
  const handleFabricTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedFabricTypes((prev) =>
      checked ? [...prev, value] : prev.filter((t) => t !== value)
    );
  };

  // Handlers for color checkboxes
  const handleFabricColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedFabricColors((prev) =>
      checked ? [...prev, value] : prev.filter((c) => c !== value)
    );
  };

  // Handler for color blob clicks
  const handleColorBlobClick = (fabricId: string, color: Color) => {
    setSelectedColorImages((prev) => ({
      ...prev,
      [fabricId]: color.image.url,
    }));
    // Save the clicked color ID to localStorage
    localStorage.setItem("fabricId", fabricId);
    localStorage.setItem("colorId", color._id);
  };

  useEffect(() => {
    const fabricId = localStorage.getItem("fabricId");
    const colorId = localStorage.getItem("colorId");

    if (fabricId) {
      const fabric = fabrics.find((f) => f._id === fabricId);
      setSelectedFabricName(fabric ? fabric.fabricName : null);
    }

    if (colorId) {
      const color = Object.values(colors)
        .flat()
        .find((c) => c._id === colorId);
      setSelectedColorName(color ? color.name : null);
    }
  }, [fabrics, colors, selectedColorImages]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredFabrics.length / ITEMS_PER_PAGE);

  // Get fabrics for the current page
  const paginatedFabrics = filteredFabrics.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const toggleFabricTypeCollapse = () => {
    setIsFabricTypeCollapsed(!isFabricTypeCollapsed);
  };

  const toggleFabricColorCollapse = () => {
    setIsFabricColorCollapsed(!isFabricColorCollapsed);
  };

  return (
    <div className="min-h-screen pt-[2rem] w-[90%] md:w-full font-play">
      {loading ? (
        <div className="flex flex-col items-center w-full h-[100vh] justify-center">
          <FaSpinner className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="pb-[2rem] px-[0rem] md:px-[1rem] w-full flex flex-col justify-center items-center mx-auto">
          {/* Updated top heading */}
          <h2 className="text-4xl font-semibold text-[#646464] mb-6 text-center">
            Fabric Selection
          </h2>
          <div className="w-full flex flex-col md:flex-row gap-8">
            {/* Left panel: Filters wrapped in a styled box */}
            <div className="w-full md:w-[20%]">
              <div className="bg-white w-full shadow-md rounded-lg p-4 space-y-6">
                {/* New heading for filter box */}
                <h3 className="text-2xl font-bold text-[#646464] mb-4 text-center">
                  Filters
                </h3>
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={toggleFabricTypeCollapse}
                  >
                    <h3 className="font-bold text-xl text-[#505050] mb-2">
                      Fabric Type
                    </h3>
                    {isFabricTypeCollapsed ? (
                      <AiOutlineUp className="text-[#505050]" />
                    ) : (
                      <AiOutlineDown className="text-[#505050]" />
                    )}
                  </div>
                  {!isFabricTypeCollapsed && (
                    <div>
                      {Array.from(
                        new Set(fabrics.map((f) => f.fabricName))
                      ).map((type) => (
                        <div key={type} className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            value={type}
                            checked={selectedFabricTypes.includes(type)}
                            onChange={handleFabricTypeChange}
                            className="mr-2 form-checkbox h-5 w-5 text-[#C40600]"
                          />
                          <label>{type}</label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={toggleFabricColorCollapse}
                  >
                    <h3 className="font-bold text-xl text-[#505050] mb-2">
                      Fabric Color
                    </h3>
                    {isFabricColorCollapsed ? (
                      <AiOutlineUp className="text-[#505050]" />
                    ) : (
                      <AiOutlineDown className="text-[#505050]" />
                    )}
                  </div>
                  {!isFabricColorCollapsed && (
                    <div>
                      {availableColors.length > 0 ? (
                        availableColors.map((color: any) => (
                          <div
                            key={color._id}
                            className="flex items-center mb-1"
                          >
                            <input
                              type="checkbox"
                              value={color._id}
                              checked={selectedFabricColors.includes(color._id)}
                              onChange={handleFabricColorChange}
                              className="mr-2 form-checkbox h-5 w-5 text-[#C40600]"
                            />
                            <div
                              className="w-4 h-4 rounded-full mr-2"
                              style={{ backgroundColor: color.hexCode }}
                            ></div>
                            <label>{color.name}</label>
                          </div>
                        ))
                      ) : (
                        <p>No colors available</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Right panel: Fabrics display */}
            <div className="w-full md:w-[80%]">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {paginatedFabrics.map((fabric) => {
                  // If no color filter is selected, show all colors; otherwise, show only filtered ones.
                  const displayedColors = (colors[fabric._id] || []).filter(
                    (color) =>
                      selectedFabricColors.length > 0
                        ? selectedFabricColors.includes(color._id)
                        : true
                  );
                  return (
                    <div
                      key={fabric._id}
                      className={`w-full rounded-lg shadow-lg transition duration-300 ease-in-out transform overflow-hidden relative cursor-pointer`}
                    >
                      {/* Fabric header */}
                      <div className="p-4">
                        <div className="w-full relative">
                          {selectedColorImages[fabric._id] ? (
                            <img
                              src={selectedColorImages[fabric._id]}
                              alt="Selected Color"
                              className="w-full h-[15rem] lg:h-[20rem] object-cover rounded-lg shadow-lg transition-opacity duration-500 ease-in-out"
                              style={{
                                opacity: selectedColorImages[fabric._id]
                                  ? 1
                                  : 0.5,
                              }}
                            />
                          ) : (
                            <Loader /> // Use Loader when fabric details are loading
                          )}
                        </div>
                      </div>
                      <div className="px-4 pb-4 flex justify-between items-start">
                        {/* Fabric Name and Colors */}
                        <div>
                          <div className="flex items-center">
                            <span className="font-bold text-gray-800 mr-2">
                              Fabric Name:
                            </span>
                            <span className="text-base">
                              {fabric.fabricName}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center">
                            <span className="text-sm font-bold text-gray-800 mr-2">
                              Available Colors:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {(colors[fabric._id] || [])
                                .filter((color) =>
                                  selectedFabricColors.length > 0
                                    ? selectedFabricColors.some(
                                        (selectedColorId) =>
                                          color._id === selectedColorId ||
                                          color.name.toLowerCase() ===
                                            availableColors
                                              .find(
                                                (ac) =>
                                                  ac._id === selectedColorId
                                              )
                                              ?.name.toLowerCase()
                                      )
                                    : true
                                )
                                .map((color) => (
                                  <div
                                    key={color._id}
                                    className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                                      selectedColorImages[fabric._id] ===
                                      color.image.url
                                        ? "border-blue-500"
                                        : "border-transparent"
                                    }`}
                                    style={{ backgroundColor: color.hexCode }}
                                    onClick={() =>
                                      handleColorBlobClick(fabric._id, color)
                                    }
                                  ></div>
                                ))}
                            </div>
                          </div>
                        </div>

                        {/* Price Section */}
                        <div className="text-right">
                          {fabric.price && (
                            <>
                              <div className="text-sm text-gray-500 line-through">
                                ${fabric.price.toFixed(2)}
                              </div>
                              <div className="text-lg font-bold text-gray-800">
                                ${(fabric.price * (1 - (fabric.discount || 0) / 100)).toFixed(2)}{" "}
                                {(fabric.discount ?? 0) > 0 && (
                                  <span className="text-sm text-red-500">
                                    ({fabric.discount}% off)
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center items-center space-x-2">
            {currentPage > 1 && (
              <button
                onClick={handlePrevPage}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Prev
              </button>
            )}
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageClick(index + 1)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === index + 1
                    ? "bg-[#C40600] text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
            {currentPage < totalPages && (
              <button
                onClick={handleNextPage}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Next
              </button>
            )}
          </div>

          {/* Next Button Container */}
          <div className="fixed bottom-[1rem] right-[1rem] bg-white shadow-lg rounded-lg p-4 flex flex-col items-center space-y-2">
            <div className="text-center">
              <p className="text-sm font-bold text-gray-800">
                Selected Fabric:{" "}
                <span className="text-[#C40600]">
                  {selectedFabricName || "None"}
                </span>
              </p>
              <p className="text-sm font-bold text-gray-800">
                Selected Color:{" "}
                <span className="text-[#C40600]">
                  {selectedColorName || "None"}
                </span>
              </p>
            </div>
            <button
              onClick={() => (window.location.href = "/form-new")}
              className="hover:bg-[#530e0c] bg-[#C40600] text-white py-3 px-6 rounded-lg font-medium transition duration-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FabricsWithColors;
