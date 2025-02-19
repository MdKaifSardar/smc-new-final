"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { countries } from "@/app/utils/data/countries";
import { createCustomerDetail } from "@/lib/database/actions/customerDetail.actions";

const ONE_HOUR = 3600000;

const DiscountPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const lastSubmitted = localStorage.getItem("lastSubmitted");
    if (!lastSubmitted || Date.now() - parseInt(lastSubmitted) >= ONE_HOUR) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const customerData = {
      prefix: formData.get("prefix") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      country: formData.get("country") as string,
      mobile: formData.get("mobile") as string,
    };

    try {
      const result = await createCustomerDetail(customerData);
      if (!result.success) {
        throw new Error(result.message);
      }
      localStorage.setItem("lastSubmitted", Date.now().toString());
      toast.success(result.message || "Customer created successfully");
      setLoading(false);
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Error occurred");
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="font-play fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="relative border-[2px] border-black bg-gray-100 rounded-[1.7rem] shadow-lg w-[80%] md:w-[52%] flex">
        <button
          className="absolute top-0 right-0 m-4 text-black lg:text-white text-2xl"
          onClick={handleClose}
        >
          ✕
        </button>
        <div className="flex flex-col justify-start items-center lg:items-start w-full lg:w-[60%] py-[2.5rem] px-[2.5rem]">
          <span className="text-7xl lg:text-5xl xl:text-7xl 2xl:text-8xl font-bold mb-[1.3rem]">25% OFF</span>
          <form onSubmit={handleSubmit} className="flex flex-col justify-centeritems-center gap-[.5rem] space-y-2">
            <div className="flex flex-row justify-center items-center gap-[1rem] space-x-2">
              <select
                name="prefix"
                defaultValue="Pre"
                className="border border-black p-2"
              >
                <option value="Pre">Prefix</option>
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
              </select>
              <input
                type="text"
                name="firstName"
                placeholder="First"
                className="border p-2 text-black placeholder-black border-black w-1/2"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last"
                className="border p-2 text-black placeholder-black border-black w-1/2"
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="eMail"
              className="border p-2 border-black placeholder-black text-black w-full"
            />
            <div className="flex flex-row justify-center items-center gap-[1rem] space-x-2">
              <select
                name="country"
                className="border p-2 border-black text-black w-[35%]"
              >
                <option value="">Country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.code})
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="mobile"
                placeholder="Mobile"
                className="border p-2 border-black text-black placeholder-black w-full"
              />
            </div>
            <div className="flex-row justify-center items-center w-full flex space-x-2 mt-4">
              <button
                type="button"
                className="w-full text-xl bg-gray-500 border border-black text-white p-2"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full text-xl bg-gray-500 border border-black text-white p-2 flex justify-center items-center"
                disabled={loading}
              >
                {loading ? <span>Loading...</span> : "Submit"}
              </button>
            </div>
          </form>
          <p className="text-md leading-[1.2rem] text-gray-500 mt-[1rem] text-center">
            Lorem ipsum dolor sit amet, consectetur adipiscing dolore magna aliqua.
            <br />
            <a href="#" className="text-blue-500">Disclaimer</a>,{" "}
            <a href="#" className="text-blue-500">TC</a>,{" "}
            <Link href="/privacypolicy" className="text-blue-500">Privacy Policy</Link>
          </p>
        </div>
        <div className="w-[40%] h-fit hidden lg:block rounded-r-[1.5rem]">
          <Image
            src="https://res.cloudinary.com/djndrffon/image/upload/v1739971790/newpopupimage_uwpkhl.png"
            alt="Person"
            width={300}
            height={400}
            className="h-[26rem] xl:h-[31rem] w-full object-cover rounded-r-[1.5rem]"
          />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default DiscountPopup;
