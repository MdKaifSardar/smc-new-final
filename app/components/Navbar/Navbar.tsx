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
    openCartDrawer(); // Open the CartDrawer instantly
  };

  // Close menu when clicking any link
  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="font-play w-full bg-[#f5f5f0] shadow-md px-4 py-2 flex justify-between items-center fixed top-0 z-[10]">
      {/* Logo */}
      <div
        className="flex items-center cursor-pointer"
        onClick={() => (window.location.href = "/")}
      >
        <Image src={"/logo.png"} alt="logo" width={130} height={80} />
      </div>

      {/* Desktop Menu and Icons */}
      <div className="flex items-center space-x-4">
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-2 text-[#4a2b2b] font-bold text-lg">
          <a
            href="#about"
            onClick={scrollToAbout}
            className="hover:text-black hover:bg-gray-200 p-[.5rem] rounded-lg transition-colors"
          >
            About
          </a>
          <Link
            href="/history"
            className="hover:text-black hover:bg-gray-200 p-[.5rem] rounded-lg transition-colors"
          >
            History
          </Link>
          <Link
            href="/fabric-new"
            className="hover:text-black hover:bg-gray-200 p-[.5rem] rounded-lg transition-colors"
          >
            Customise
          </Link>
        </div>

        {/* Wishlist Icon */}
        <div
          className="relative mr-4 cursor-pointer"
          onClick={handleWishlistClick}
        >
          <div className="h-10 w-10 rounded-full bg-[#e8e6da] shadow-lg flex items-center justify-center hover:bg-[#d4d2c6] transition-colors">
            <AiOutlineHeart className="text-[#4a2b2b] h-6 w-6" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                {wishlistCount}
              </span>
            )}
          </div>
        </div>

        {/* Cart Icon */}
        <div className="relative mr-4 cursor-pointer" onClick={handleCartClick}>
          <div className="h-10 w-10 rounded-full bg-[#e8e6da] shadow-lg flex items-center justify-center hover:bg-[#d4d2c6] transition-colors">
            {/* <FaShoppingCart className="text-[#4a2b2b] h-6 w-6" /> Add cart icon */}
            <CartDrawer />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                {cartItems.length}
              </span>
            )}
          </div>
        </div>

        {/* Account Popup */}
        <div className="z-[600]">
          <AccountPopUp />
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={toggleMobileMenu} className="p-2">
            {isMobileMenuOpen ? (
              <AiOutlineClose className="text-[#4a2b2b] h-8 w-8" /> // Close icon
            ) : (
              <GiHamburgerMenu className="text-[#4a2b2b] h-8 w-8" /> // Hamburger icon
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`absolute top-full left-0 w-full bg-[#f5f5f0] shadow-md rounded-b-md z-10 md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
        ref={mobileMenuRef}
      >
        <div className="flex flex-col text-[#4a2b2b] font-medium p-4 space-y-3">
          <a
            href="#about"
            onClick={(e) => {
              scrollToAbout(e);
              closeMenu();
            }}
            className="hover:text-black hover:bg-gray-200 p-[.5rem] rounded-lg transition-colors"
          >
            About
          </a>
          <Link
            href="/history"
            onClick={closeMenu}
            className="hover:text-black hover:bg-gray-200 p-[.5rem] rounded-lg transition-colors"
          >
            History
          </Link>
          <Link
            href="/form-new"
            onClick={closeMenu}
            className="hover:text-black hover:bg-gray-200 p-[.5rem] rounded-lg transition-colors"
          >
            Customise
          </Link>
        </div>
      </div>
    </nav>
  );
}
