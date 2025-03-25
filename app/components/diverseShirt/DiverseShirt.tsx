import Image from "next/image";

const DiverseShirt = () => {
  const fabrics = [
    {
      src: "https://res.cloudinary.com/djndrffon/image/upload/v1742901632/fabric5_ilns4j.jpg",
      alt: "Fabric 1",
    },
    {
      src: "https://res.cloudinary.com/djndrffon/image/upload/v1742901653/fabric9_f8qesg.jpg",
      alt: "Fabric 2",
    },
    {
      src: "https://res.cloudinary.com/djndrffon/image/upload/v1742901653/fabric6_f2apdy.jpg",
      alt: "Fabric 3",
    },
    {
      src: "https://res.cloudinary.com/djndrffon/image/upload/v1742901632/fabric3_xa8r2j.jpg",
      alt: "Fabric 4",
    },
    {
      src: "https://res.cloudinary.com/djndrffon/image/upload/v1742901632/fabric4_hvmg7w.jpg",
      alt: "Fabric 5",
    },
    {
      src: "https://res.cloudinary.com/djndrffon/image/upload/v1742901631/fabric2_gipdw1.jpg",
      alt: "Fabric 6",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-5xl font-play text-[#646464] mb-10 text-center">
        New Fabrics
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 ">
        {fabrics.map((fabric, index) => (
          <div
            key={index}
            className="group bg-black rounded-lg transition-all duration-500 overflow-hidden relative flex justify-center items-center flex-col"
          >
            <Image
              src={fabric.src}
              alt={fabric.alt}
              width={1200}
              height={1200}
              className="object-cover w-full h-[250px] group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiverseShirt;
