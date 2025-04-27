"use client";

import React from "react";
import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const clients = [
  {
    id: 1,
    src: "https://res.cloudinary.com/djndrffon/image/upload/v1745766464/img_1_cv0fhe.jpg",
    alt: "Client 1",
  },
  {
    id: 2,
    src: "https://res.cloudinary.com/djndrffon/image/upload/v1745766463/image_2_lvbbmx.jpg",
    alt: "Client 2",
  },
  {
    id: 3,
    src: "https://res.cloudinary.com/djndrffon/image/upload/v1745766464/image_6_l1hfax.jpg",
    alt: "Client 3",
  },
  {
    id: 4,
    src: "https://res.cloudinary.com/djndrffon/image/upload/v1745766463/image_1_ix5yrl.jpg",
    alt: "Client 4",
  },
//   {
//     id: 5,
//     src: "https://res.cloudinary.com/djndrffon/image/upload/v1745766462/client_3_pk9lso.jpg",
//     alt: "Client 5",
//   },
  {
    id: 6,
    src: "https://res.cloudinary.com/djndrffon/image/upload/v1745766463/image_3_c255lv.jpg",
    alt: "Client 6",
  },
  {
    id: 7,
    src: "https://res.cloudinary.com/djndrffon/image/upload/v1745766463/client_5_soix6b.jpg",
    alt: "Client 7",
  },
  {
    id: 8,
    src: "https://res.cloudinary.com/djndrffon/image/upload/v1745766463/image_5_kvynmk.jpg",
    alt: "Client 8",
  },
  {
    id: 9,
    src: "https://res.cloudinary.com/djndrffon/image/upload/v1745766462/client_2_r5tqa2.webp",
    alt: "Client 9",
  },
  {
    id: 10,
    src: "https://res.cloudinary.com/djndrffon/image/upload/v1745766462/client_4_zhinmx.webp",
    alt: "Client 10",
  },
];

const ClientsListComponent = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto py-8 overflow-hidden">
      <h2 className="text-3xl font-bold text-center text-[#646464] mb-6">
        Our Clients
      </h2>
      <Slider {...settings} className="w-full">
        {clients.map((client) => (
          <div
            key={client.id}
            className="overflow-hidden w-fit h-fit rounded-full px-2 py-2"
          >
            <div className="w-fit h-fit overflow-hidden rounded-full ">
              <div className="rounded-full flex justify-center items-center w-full h-fit overflow-hidden transition-transform duration-300 hover:scale-110">
                <Image
                  src={client.src}
                  alt={client.alt}
                  width={160}
                  height={160}
                  className="scale-[1.4] rounded-full w-full h-[12rem] md:h-[13rem] lg:h-[14.5rem] object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ClientsListComponent;
