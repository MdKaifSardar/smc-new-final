"use client"

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DiscountPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      toast.success("Submit success");
      handleClose();
    }, 3000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="relative bg-white rounded-lg shadow-lg w-[80%] md:w-3/5 flex ">
        <button
          className="absolute top-0 right-0 m-4 text-gray-500 text-2xl"
          onClick={handleClose}
        >
          ✕
        </button>
        <div className="w-full md:w-2/3 p-6">
          <h2 className="text-4xl font-bold">25% OFF</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-2">
            <div className="flex space-x-2">
              <select
                name="prefix"
                defaultValue="Pre"
                className="border p-2 rounded w-1/4"
              >
                <option value="Pre">Pre</option>
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
              </select>
              <input
                type="text"
                name="firstName"
                placeholder="First"
                className="border p-2 rounded w-1/2"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last"
                className="border p-2 rounded w-1/2"
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="eMail"
              className="border p-2 rounded w-full"
            />
            <div className="flex space-x-2">
              <input
                type="text"
                name="country"
                placeholder="Country"
                className="border p-2 rounded w-1/2"
              />
              <input
                type="text"
                name="mobile"
                placeholder="Mobile"
                className="border p-2 rounded w-1/2"
              />
            </div>
            <div className="flex space-x-2 mt-4">
              <button
                type="button"
                className="w-1/2 bg-gray-400 text-white p-2 rounded"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 bg-gray-600 text-white p-2 rounded"
              >
                Submit
              </button>
            </div>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Lorem ipsum dolor sit amet, consectetur adipiscing dolore magna aliqua.
            <br />
            <a href="#" className="text-blue-500">
              Disclaimer
            </a>
            ,{" "}
            <a href="#" className="text-blue-500">
              TC
            </a>
            ,{" "}
            <Link href="/privacypolicy" className="text-blue-500">
              Privacy Policy
            </Link>
          </p>
        </div>
        <div className="w-1/3 h-fit hidden md:block">
          <Image
            src="/popupImage.jfif"
            alt="Person"
            width={300}
            height={400}
            className="h-[23rem] w-full object-cover rounded-r-lg"
          />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default DiscountPopup;
