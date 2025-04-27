import Image from "next/image";

const Shirts = () => {
  const fabrics = [
    {
      src: "https://res.cloudinary.com/djndrffon/image/upload/v1742900920/shirt8_xi9kkk.jpg",
      alt: "Fabric 1",
    },
    {
      src: "https://res.cloudinary.com/djndrffon/image/upload/v1742900919/shirt7_scodtr.jpg",
      alt: "Fabric 2",
    },
    {
      src: "https://res.cloudinary.com/djndrffon/image/upload/v1742900919/shirt10_yo4quj.jpg",
      alt: "Fabric 3",
    },
    {
      src: "https://res.cloudinary.com/djndrffon/image/upload/v1742900919/shirt6_octdmt.jpg",
      alt: "Fabric 4",
    },
    {
      src: "https://res.cloudinary.com/djndrffon/image/upload/v1742900919/shirt5_xnwlin.jpg",
      alt: "Fabric 5",
    },
    {
      src: "https://res.cloudinary.com/djndrffon/image/upload/v1742900919/shirt4_g9nsok.jpg",
      alt: "Fabric 6",
    },
    {
      src: "https://res.cloudinary.com/djndrffon/image/upload/v1742900918/shirt3_bmqrtj.jpg",
      alt: "Fabric 3",
    },
    {
      src: "https://res.cloudinary.com/djndrffon/image/upload/v1742900918/shirt2_z3jgq0.jpg",
      alt: "Fabric 4",
    },
    // {
    //   src: "https://res.cloudinary.com/djndrffon/image/upload/v1742900918/shirt1_vd4in4.jpg",
    //   alt: "Fabric 5",
    // },
    // {
    //   src: "https://res.cloudinary.com/djndrffon/image/upload/v1742900899/shirt9_o1xdni.avif",
    //   alt: "Fabric 6",
    // },
  ];

  return (
    <div className="max-w-7xl mt-[2rem] mx-auto p-4 font-play" id="about">
      <h1 className="text-4xl text-[#646464] font-bold font-play mb-10 text-center">
        Promotional Text
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 ">
        {fabrics.map((fabric, index) => (
          <div
            key={index}
            className="group bg-black rounded-lg transition-all duration-500 overflow-hidden relative flex justify-center items-center flex-col"
          >
            <Image
              src={fabric.src}
              alt={fabric.alt}
              width={500}
              height={500}
              className="object-cover w-full h-[250px] group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
          </div>
        ))}
      </div>
      {/* <div className="mt-12 mb-10 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-[#646464] mb-4">
          New Shirts available
        </h1>
        <p className="max-w-5xl text-[#505050] text-lg leading-relaxed text-center mb-7">
          From selecting the perfect fabric to choosing unique patterns and
          colors, we provide a seamless experience for crafting your ideal
          shirt. Our commitment to quality and attention to detail ensures that
          each piece is tailored to perfection. Explore our user-friendly
          interface and start designing your custom shirt today. Experience the
          satisfaction of wearing a garment that is uniquely yours.{" "}
        </p>
        <button className="bg-[#c40600] text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-200 hover:text-black text-semibold transition duration-300">
          Buy
        </button>
      </div> */}
    </div>
  );
};

export default Shirts;
