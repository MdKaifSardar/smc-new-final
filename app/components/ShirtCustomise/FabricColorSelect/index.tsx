"use client";
import { useState, useEffect } from "react";
import { getAllFabrics } from "@/lib/database/actions/admin/ShirtArea/Fabric/fabric.actions";
import { getColorByFabric } from "@/lib/database/actions/admin/ShirtArea/Color/color.actions";
import { FaSpinner } from "react-icons/fa";

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
}

const FabricsWithColors = () => {
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [colors, setColors] = useState<{ [fabricId: string]: Color[] }>({});
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedColorImages, setSelectedColorImages] = useState<{
    [fabricId: string]: string | null;
  }>({});
  const [isNextEnabled, setIsNextEnabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFabrics = async () => {
      const fabricsData = await getAllFabrics();
      setFabrics(fabricsData);

      fabricsData.forEach(async (fabric: Fabric) => {
        const colorData = await getColorByFabric(fabric._id);
        setColors((prev) => ({
          ...prev,
          [fabric._id]: colorData,
        }));

        if (colorData.length > 0) {
          setSelectedColorImages((prev) => ({
            ...prev,
            [fabric._id]: colorData[0].image.url,
          }));
        }
      });

      setLoading(false);
    };

    fetchFabrics();
  }, []);

  useEffect(() => {
    const storedFabricId = localStorage.getItem("fabricId");
    const storedColorId = localStorage.getItem("colorId");
    if (storedFabricId && storedColorId) {
      setSelectedFabric(storedFabricId);
      setSelectedColor(storedColorId);
      setIsNextEnabled(true);
    }
  }, []);

  useEffect(() => {
    setIsNextEnabled(!!selectedFabric && !!selectedColor);
  }, [selectedFabric, selectedColor]);

  useEffect(() => {
    if (!selectedFabric && fabrics.length > 0) {
      const firstFabricId = fabrics[0]._id;
      const fabricColors = colors[firstFabricId];
      if (fabricColors && fabricColors.length > 0) {
        const defaultColor = fabricColors[0];
        setSelectedFabric(firstFabricId);
        setSelectedColor(defaultColor._id);
        localStorage.setItem("fabricId", firstFabricId);
        localStorage.setItem("colorId", defaultColor._id);
      }
    }
  }, [fabrics, colors, selectedFabric]);

  const handleFabricClick = (fabricId: string) => {
    setSelectedFabric(fabricId);
    setSelectedColor(null);
  };

  const handleColorClick = (fabricId: string, color: Color) => {
    setSelectedColorImages((prev) => ({
      ...prev,
      [fabricId]: color.image.url,
    }));

    setSelectedFabric(fabricId);
    setSelectedColor(color._id);

    localStorage.setItem("colorId", color._id);
    localStorage.setItem("fabricId", fabricId);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredFabrics = fabrics.filter((fabric) => {
    // Check if fabric name includes searchTerm
    const matchesFabricName = fabric.fabricName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Check if any associated color name includes searchTerm
    const fabricColors = colors[fabric._id] || [];
    const matchesColorName = fabricColors.some((color) =>
      color.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return matchesFabricName || matchesColorName;
  });

  return (
    <div className="min-h-screen pt-[2rem] font-play">
      <div className="container mx-auto p-8">
        <div className="flex flex-col items-center justify-center space-y-6">
          <h2 className="text-4xl font-semibold text-[#646464]">Fabrics</h2>
          <input
            type="text"
            placeholder="Search Fabrics"
            value={searchTerm}
            onChange={handleSearchChange}
            className="p-2 border border-gray-300 rounded-lg mb-4"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFabrics.map((fabric) => {
              const currColor =
                colors[fabric._id] &&
                (fabric._id === selectedFabric
                  ? colors[fabric._id].find((c) => c._id === selectedColor)
                  : colors[fabric._id][0]);
              return (
                <div
                  key={fabric._id}
                  className={`w-full rounded-lg shadow-lg transition duration-300 ease-in-out transform overflow-hidden relative cursor-pointer ${
                    selectedFabric === fabric._id
                      ? "border-[2px] border-blue-500"
                      : ""
                  }`}
                  onClick={() => handleFabricClick(fabric._id)}
                >
                  <div className="absolute top-0 left-0 w-full flex justify-between items-center bg-white p-2 font-semibold text-gray-800 z-10">
                    <span>{fabric.fabricName}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium mb-2">
                      {fabric.fabricName}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <div className="w-full mb-4 relative">
                        <img
                          src={
                            selectedColorImages[fabric._id] || "/loading.gif"
                          }
                          alt="Selected Color"
                          className="w-full h-[15rem] lg:h-[20rem] object-cover rounded-lg shadow-lg transition-opacity duration-500 ease-in-out"
                          style={{
                            opacity: selectedColorImages[fabric._id] ? 1 : 0.5,
                          }}
                        />
                      </div>
                      {colors[fabric._id]?.map((color) => (
                        <div
                          key={color._id}
                          className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                            selectedColor === color._id
                              ? "border-blue-500"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: color.hexCode }}
                          onClick={() => handleColorClick(fabric._id, color)}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="fixed bottom-[1rem] right-[1rem]">
            <button
              onClick={() => (window.location.href = "/gender")}
              className="hover:bg-[#530e0c] bg-[#C40600] mt-10 text-white py-3 px-6 rounded-lg font-medium transition duration-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FabricsWithColors;
