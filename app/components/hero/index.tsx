import React from "react";
import { galleryImages } from "./data";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  // Define Tailwind classes for grid item placement for each image
  const gridClasses = [
    "col-span-3 row-span-2", // div1
    "col-span-2 col-start-4", // div2
    "col-span-3 row-span-2 col-start-3 row-start-5", // div4
    "col-span-2 col-start-1 row-start-6", // div5
    "row-span-2 col-start-3 row-start-3", // div6
    "col-span-2 row-span-3 col-start-4 row-start-2", // div7
    "col-span-2 row-span-3 col-start-1 row-start-3" // div8
  ];

  return (
    <div className="bg-[#f5f5f0] font-play">
      {/* Gallery images section as a grid */}
      <div className="grid grid-cols-5 grid-rows-6 gap-[.4rem] lg:gap-[17px] w-full h-[20rem] md:h-[100vh] lg:h-[150vh]">
        {gridClasses.map((gridClass, index) => {
          const image = galleryImages[index];
          return (
            <Image
              key={`grid-${index}`}
              src={image.src}
              alt={image.alt}
              className={`w-full h-full object-cover rounded-2xl ${gridClass}`}
              width={1000}
              height={1000}
            />
          );
        })}
      </div>
      {/* ...existing code for text and button... */}
      {/* <div className="mt-10 mb-10 flex flex-col items-center justify-center">
        <div className="text-center md:max-w-5xl max-w-3xl space-y-8">
          <h1 className="text-4xl font-bold text-[#646464]">
            Craft Your Perfect shirt
          </h1>
          <p className="text-3xl text-[#505050] mb-8">Today</p>
          <p className="text-[#505050] text-lg leading-relaxed mb-7">
            Welcome to Stitch My Clothes, the ultimate destination for custom
            shirt enthusiasts! Our platform offers an extensive range of
            customization options, allowing you to create a shirt that truly
            represents your personal style and taste. From selecting the perfect
            fabric to choosing unique patterns and colors, we provide a seamless
            experience for crafting your ideal shirt. Our commitment to quality
            and attention to detail ensures that each piece is tailored to
            perfection. Explore our user-friendly interface and start designing
            your custom shirt today. Experience the satisfaction of wearing a
            garment that is uniquely yours.
          </p>
          <Link href="/fabric-new">
            <button className="bg-[#C40600] mt-6 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-200 hover:text-black transition duration-300">
              Start Designing
            </button>
          </Link>
        </div>
      </div> */}
    </div>
  );
}
