const CUBE_IMAGE = "/photos/cube.png";

const product = {
  id: "prod_R0hPDaQLgiQsP",
  title: "ZenithGlows Cube",
  slug: "zenithglows-cube",
  headline: "Light that moves like water",
  description:
    "A textured glass cube on a wood base. Switch it on and the glow projects water ripples across your ceiling.",
  image: CUBE_IMAGE,
  gallery: [CUBE_IMAGE, "/photos/room-blue.jpg", "/photos/desk-amber.jpg", "/photos/cube-hold.jpg"],
  planId: "plan_ZNGSf9CWGkLki",
  priceCents: 3900,
  priceLabel: "$39.00",
};

const products = [product];

const reviews = [
  {
    photos: [
      { src: "/photos/reviews/es-1.jpg", alt: "Green water light across the ceiling" },
      { src: "/photos/reviews/es-2.jpg", alt: "Purple water light across the ceiling" },
      { src: "/photos/reviews/es-3.jpg", alt: "Red water light across the ceiling" },
      { src: "/photos/reviews/es-4.jpg", alt: "Blue water light across the ceiling" },
    ],
    quote:
      "I loved it — especially that you can change the tone and the intensity of the light. It arrived very quickly.",
    original: "Me encantó, sobre todo que se pueda cambiar el tono y la intensidad de luz. Llegó muy rápido.",
  },
  {
    photos: [
      { src: "/photos/reviews/ua1-1.jpg", alt: "Purple glow from the cube" },
      { src: "/photos/reviews/ua1-2.jpg", alt: "Red glow from the cube" },
      { src: "/photos/reviews/ua1-3.jpg", alt: "Pink glow from the cube" },
      { src: "/photos/reviews/ua1-4.jpg", alt: "Blue glow from the cube" },
    ],
    quote:
      "The lamp is really cool — I recommend it. The colors are great, everything works perfectly, and delivery was fast. It arrived in two weeks. I bought it and I still can’t stop being happy with it.",
    original:
      "Светильник очень крутой, советую! Цвета классные, все четко работает, доставка быстрая, в Украину за 2 недели прибыл. Купила и не нарадуюсь, очень довольна.",
  },
  {
    photos: [
      { src: "/photos/reviews/ua2-1.jpg", alt: "Cube glowing blue with the remote" },
      { src: "/photos/reviews/ua2-2.jpg", alt: "Cube glowing purple with the remote" },
      { src: "/photos/reviews/ua2-3.jpg", alt: "Cube glowing red with the remote" },
      { src: "/photos/reviews/ua2-4.jpg", alt: "Cube glowing green with the remote" },
    ],
    quote:
      "Super! We are very happy with this purchase. Delivery was very fast. I will definitely buy again. I recommend the product and the seller.",
    original:
      "Супер! Мы очень довольны этой покупкой. Доставка очень быстрая. Куплю ещё обязательно! Рекомендую товар и продавца!",
  },
  {
    photos: [
      { src: "/photos/reviews/au-1.jpg", alt: "Green ripple light from the cube" },
      { src: "/photos/reviews/au-3.jpg", alt: "Purple water light on the wall" },
      { src: "/photos/reviews/au-4.jpg", alt: "Ripple light across the ceiling" },
      { src: "/photos/reviews/au-5.jpg", alt: "The cube on a wooden table" },
    ],
    quote:
      "Beautiful! Very dynamic and bright light, has a cool ripple effect — just like watching waves at the beach. Definitely a mood-setter, highly recommend!",
    original: "",
  },
];

function listProducts() {
  return products.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    image: item.image,
    priceLabel: item.priceLabel,
    priceCents: item.priceCents,
    planId: item.planId,
  }));
}

function getBySlug(slug) {
  return products.find((item) => item.slug === slug) || null;
}

function getByPlanId(planId) {
  return products.find((item) => item.planId === planId) || null;
}

function getById(id) {
  return products.find((item) => item.id === id) || null;
}

module.exports = {
  products,
  reviews,
  listProducts,
  getBySlug,
  getByPlanId,
  getById,
};
