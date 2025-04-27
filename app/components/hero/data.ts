"use strict";

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
}

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    src: "https://res.cloudinary.com/djndrffon/image/upload/v1745778103/hero_1_coz2ir.webp",
    alt: "Gallery Image 1",
  },
  {
    id: 2,
    src: "https://res.cloudinary.com/djndrffon/image/upload/v1745778124/hero_2_mfdnkh.webp",
    alt: "Gallery Image 2",
  },
  {
    id: 3,
    src: "https://res.cloudinary.com/djndrffon/image/upload/v1745778191/hero_3_d3pen7.webp",
    alt: "Gallery Image 3",
  },
  {
    id: 4,
    src: "https://res.cloudinary.com/djndrffon/image/upload/v1745610368/image_3_wpqmvr.jpg",
    alt: "Gallery Image 4",
  },
  {
    id: 5,
    src: "https://res.cloudinary.com/djndrffon/image/upload/v1745610368/image_8_ogss1v.jpg",
    alt: "Gallery Image 5",
  },
  {
    id: 6,
    src: "https://res.cloudinary.com/djndrffon/image/upload/v1745610368/image_7_pqj6wz.jpg",
    alt: "Gallery Image 6",
  },
  {
    id: 7,
    src: "https://res.cloudinary.com/djndrffon/image/upload/v1745610368/image_7_pqj6wz.jpg",
    alt: "Gallery Image 7",
  },
];

export { galleryImages };
