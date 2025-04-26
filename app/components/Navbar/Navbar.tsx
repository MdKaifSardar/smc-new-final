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

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [wishlistCount, setWishlistCount] = useAtom(wishlistCountState); // Wishlist count state
  const [cartItems, setCartItems] = useAtom(cartItemsState); // Cart items state

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
          <div className="hidden md:flex items-center">
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
            <div className="p-[.5rem] relative cursor-pointer" onClick={handleCartClick}>
              <FaShoppingCart className="text-[#4a2b2b] h-6 w-6 hover:text-[#C40600] transition-colors" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full">
                  {cartItems.length}
                </span>
              )}
            </div>
            {/* <div
              className="relative cursor-pointer"
              onClick={handleWishlistClick}
            >
              <AiOutlineHeart className="text-[#4a2b2b] h-6 w-6 hover:text-[#C40600] transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                  {wishlistCount}
                </span>
              )}
            </div> */}
            {/* Mobile Menu Toggle */}
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
          <div className="p-4">
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
