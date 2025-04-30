"use client";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineClose } from "react-icons/ai"; // Close icon
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import CartDrawer, { openCartDrawer } from "../cartDrawer/CartDrawer"; // Import openCartDrawer
import AccountPopUp from "../accountPopUp/AccountPopUp";
import { AiOutlineHeart } from "react-icons/ai"; // Wishlist icon
import { FaShoppingCart } from "react-icons/fa"; // Cart icon
import { FaSearch } from "react-icons/fa";
import { useAtom } from "jotai";
import { wishlistCountState, cartItemsState } from "@/app/utils/data/store"; // Import wishlist count state and cart items state
import { useCart } from "@/app/utils/hooks/useCart";
import Loader from "../Loader";
import { getAllFabrics } from "@/lib/database/actions/admin/ShirtArea/Fabric/fabric.actions";
import { getColorByFabric } from "@/lib/database/actions/admin/ShirtArea/Color/color.actions";

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
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [wishlistCount, setWishlistCount] = useAtom(wishlistCountState); // Wishlist count state
  const [cartItems, setCartItems] = useAtom(cartItemsState); // Cart items state
  const { cartCount } = useCart();
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
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Scroll to "About" section
  const scrollToAbout = (event: React.MouseEvent) => {
    event.preventDefault();
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false); // Close menu after clicking
    }
  };

  // Handle wishlist click
  const handleWishlistClick = () => {
    const storedCount = localStorage.getItem("wishlistCount");
    setWishlistCount(Number(storedCount) || 0);
    window.location.href = "/cart"; // Redirect to cart page
  };

  // Handle cart click
  const handleCartClick = () => {
    const storedItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
    setCartItems(storedItems);
    openCartDrawer(); // Ensure this function is called to open the CartDrawer
  };

  // Close menu when clicking any link
  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    window.location.href = "/";
    localStorage.setItem("visited", "true");
  };

  const handleColorBlobClick = (fabricId: string, color: Color) => {
    setSelectedColorImages((prev) => ({
      ...prev,
      [fabricId]: color.image.url,
    }));
    const fabric = fabrics.find((f) => f._id === fabricId);
    setSelectedFabricName(fabric ? fabric.fabricName : null);
    setSelectedColorName(color.name);
    localStorage.setItem("fabricId", fabricId);
    localStorage.setItem("colorId", color._id);
  };

  useEffect(() => {
    const fetchFabrics = async () => {
      const fabricsData = await getAllFabrics();
      setFabrics(fabricsData);

      const allColors: Color[] = [];
      const colorPromises = fabricsData.map(async (fabric: Fabric) => {
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

  // Filter fabrics based on search query
  const searchedFabrics = fabrics.filter((fabric) => {
    const fabricNameMatch = fabric.fabricName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchingColors = (colors[fabric._id] || []).filter((color) =>
      color.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // If both fabric name and color name are searched, ensure both match
    if (searchQuery.includes(" ")) {
      const [colorQuery, fabricQuery] = searchQuery
        .toLowerCase()
        .split(" ")
        .filter(Boolean);
      const fabricMatch = fabric.fabricName
        .toLowerCase()
        .includes(fabricQuery || "");
      const colorMatch = matchingColors.some((color) =>
        color.name.toLowerCase().includes(colorQuery || "")
      );
      return fabricMatch && colorMatch;
    }

    // Otherwise, match either fabric name or color name
    return fabricNameMatch || matchingColors.length > 0;
  });

  return (
    <>
      <nav className="font-play w-full bg-[#f5f5f0] shadow-md px-4 py-2 flex justify-between items-center fixed top-0 z-[30]">
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer"
          onClick={handleLogoClick}
        >
          <Image src={"/logo.png"} alt="logo" width={130} height={80} />
        </div>

        {/* Search Bar and Links/Icons */}
        <div className="flex flex-col items-end ml-auto space-y-4">
          {/* Search Bar */}
          <div
            onClick={() => setIsSearchModalOpen(true)}
            className="hidden md:flex items-center"
          >
            <input
              type="text"
              placeholder="Search..."
              className="w-64 h-10 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#C40600]"
            />
            <button className="h-10 bg-[#C40600] px-4 rounded-r-md flex items-center justify-center">
              <FaSearch className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Links and Icons */}
          <div className="flex items-center gap-[.3rem]">
            {/* Links */}
            <div className="font-semibold text-lg hidden md:flex flex-row justify-center items-center gap-[.3rem]">
              <a
                href="#about"
                onClick={scrollToAbout}
                className="hover:text-black hover:bg-gray-200 p-[.5rem] rounded-lg transition-colors"
              >
                About Us
              </a>
              <Link
                href="/fabric-new"
                className="hover:text-black hover:bg-gray-200 p-[.5rem] rounded-lg transition-colors"
              >
                Custom Shirts
              </Link>
              <Link
                href="/accessories"
                className="hover:text-black hover:bg-gray-200 p-[.5rem] rounded-lg transition-colors"
              >
                Accessories
              </Link>
              <Link
                href="/faq"
                className="hover:text-black hover:bg-gray-200 p-[.5rem] rounded-lg transition-colors"
              >
                FAQ
              </Link>
              {/* <Link
                href="/history"
                className="font-semibold text-lg hover:text-black hover:bg-gray-200 p-[.5rem] rounded-lg transition-colors"
              >
                History
              </Link> */}
              <span className="text-[#4a2b2b]">|</span>
            </div>
            <div className="font-semibold text-lg cursor-pointer hover:text-black hover:bg-gray-200 p-[.5rem] rounded-lg transition-colors">
              <AccountPopUp />
            </div>
            <div
              className="p-[.5rem] relative cursor-pointer"
              onClick={handleCartClick}
            >
              <FaShoppingCart className="text-[#4a2b2b] h-6 w-6 hover:text-[#C40600] transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#A7120B] text-white text-[11px] font-bold font-mono min-w-5 h-5 px-1 flex items-center justify-center rounded-full shadow-xs">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 flex items-center justify-center"
              >
                {isMobileMenuOpen ? (
                  <AiOutlineClose className="text-[#4a2b2b] h-6 w-6" />
                ) : (
                  <GiHamburgerMenu className="text-[#4a2b2b] h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Search Modal */}
      {isSearchModalOpen && (
        <div className="w-full fixed inset-0 bg-black bg-opacity-50 z-[40] flex justify-center items-center">
          <div className="bg-white w-[90vw] h-[80vh] rounded-lg shadow-lg p-6 relative flex flex-col">
            {/* Close Button */}
            <button
              className="z-[200] absolute top-2 right-2 p-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 focus:outline-none"
              onClick={() => setIsSearchModalOpen(false)} // Close modal
            >
              <AiOutlineClose className="h-6 w-6" />
            </button>

            {/* Search Bar */}
            <div className="relative w-full h-full flex flex-col justify-center items-center">
              <input
                type="text"
                placeholder="Search fabrics or colors..."
                className="mt-[2rem] mb-[1rem] w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C40600]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // Update search query
              />

              {/* Fabric List */}
              <div className="h-full overflow-y-auto w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {searchedFabrics.map((fabric) => {
                    const matchingColors = searchQuery.includes(" ")
                      ? (colors[fabric._id] || []).filter((color) =>
                          color.name
                            .toLowerCase()
                            .includes(searchQuery.split(" ")[0].toLowerCase())
                        )
                      : colors[fabric._id] || [];

                    return (
                      <div
                        key={fabric._id}
                        className="w-full rounded-lg shadow-lg transition duration-300 ease-in-out transform overflow-hidden relative cursor-pointer"
                      >
                        <div className="p-4">
                          <div className="w-full mb-4 relative">
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
                          <div className="mt-2">
                            <div className="flex items-center">
                              <span className="font-bold text-gray-800 mr-2">
                                Fabric Name:
                              </span>
                              <span className="text-base">
                                {fabric.fabricName}
                              </span>
                            </div>
                            {fabric.price && (
                              <div className="flex items-center mt-1">
                                <span className="font-bold text-gray-800 mr-2">
                                  Price:
                                </span>
                                <span className="text-base text-gray-800">
                                  ${fabric.price}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="mt-2 flex items-center">
                            <span className="text-sm font-bold text-gray-800 mr-2">
                              Available Colors:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {matchingColors.map((color) => (
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
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next Button */}
              <div className="absolute bottom-[1rem] right-[1rem] bg-white shadow-lg rounded-lg p-4 flex flex-col items-center space-y-2">
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
                  onClick={() => (window.location.href = "/gender")}
                  className="hover:bg-[#530e0c] bg-[#C40600] text-white py-3 px-6 rounded-lg font-medium transition duration-300"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-[7.7rem] left-0 w-full bg-[#f5f5f0] shadow-md z-[20] md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none"
        }`}
        ref={mobileMenuRef}
      >
        {/* Links in Mobile Menu */}
        <div className="flex flex-col text-[#4a2b2b] font-medium p-4 space-y-3">
          {/* Search Bar in Mobile Menu */}
          <div onClick={() => setIsSearchModalOpen(true)} className="p-4">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search..."
                className="w-full p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#C40600]"
              />
              <button className="bg-[#C40600] p-2 rounded-r-md flex items-center justify-center">
                <FaSearch className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
          <a
            href="#about"
            onClick={scrollToAbout}
            className="hover:text-black hover:bg-gray-200 p-[.5rem] rounded-lg transition-colors"
          >
            About Us
          </a>
          <Link
            href="/fabric-new"
            className="hover:text-black hover:bg-gray-200 p-[.5rem] rounded-lg transition-colors"
          >
            Custom Shirts
          </Link>
          <Link
            href="/accessories"
            className="hover:text-black hover:bg-gray-200 p-[.5rem] rounded-lg transition-colors"
          >
            Accessories
          </Link>
          <Link
            href="/faq"
            className="hover:text-black hover:bg-gray-200 p-[.5rem] rounded-lg transition-colors"
          >
            FAQ
          </Link>
          {/* <Link
            href="/history"
            className="hover:text-black hover:bg-gray-200 p-[.5rem] rounded-lg transition-colors"
          >
            History
          </Link> */}
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}
