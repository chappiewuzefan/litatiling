import type { Locale } from "@/lib/site-config";

type LocalizedAlt = Record<Locale, string>;

export type GalleryImage = {
  src: string;
  alt: LocalizedAlt;
  originalSource: string;
};

export const heroGallery: GalleryImage[] = [
  {
    src: "/case-studies/selected/hero/living-room-floor.webp",
    alt: {
      en: "Large-format grey floor tiles installed in a bright Canberra living area.",
      zh: "堪培拉住宅客厅的大规格灰色地砖成品效果。",
    },
    originalSource:
      "/public/case-studies/unsorted/微信图片_20260407221155_28339_1476.jpg",
  },
  {
    src: "/case-studies/selected/hero/marble-bathroom.webp",
    alt: {
      en: "Finished marble-look bathroom tiling with shower screen and niche.",
      zh: "带玻璃隔断和壁龛的大理石纹浴室贴砖完工照片。",
    },
    originalSource:
      "/public/case-studies/unsorted/微信图片_20260407221137_28332_1476.jpg",
  },
  {
    src: "/case-studies/selected/hero/feature-stone-wall.webp",
    alt: {
      en: "Tall interior feature wall finished with stacked stone cladding.",
      zh: "室内挑高背景墙的文化石铺贴效果。",
    },
    originalSource:
      "/public/case-studies/unsorted/微信图片_20260407223837_28409_1476.jpg",
  },
];

export const projectGallery: GalleryImage[] = [
  {
    src: "/case-studies/selected/projects/bathroom-tiling.webp",
    alt: {
      en: "Bathroom tiling project with marble-look wall tiles and walk-in shower.",
      zh: "浴室瓷砖案例，包含大理石纹墙砖和步入式淋浴区。",
    },
    originalSource:
      "/public/case-studies/unsorted/微信图片_20260407221137_28332_1476.jpg",
  },
  {
    src: "/case-studies/selected/projects/floor-tiling.webp",
    alt: {
      en: "Completed floor tiling in an open-plan Canberra living space.",
      zh: "堪培拉住宅开放空间的地砖铺贴完工图。",
    },
    originalSource:
      "/public/case-studies/unsorted/微信图片_20260407221155_28339_1476.jpg",
  },
  {
    src: "/case-studies/selected/projects/kitchen-splashback.webp",
    alt: {
      en: "Kitchen splashback tiling with small-format brick tiles.",
      zh: "小规格砖厨房挡水板铺贴案例。",
    },
    originalSource:
      "/public/case-studies/unsorted/微信图片_20260407221145_28335_1476.jpg",
  },
  {
    src: "/case-studies/selected/projects/stone-cladding.webp",
    alt: {
      en: "Stone cladding installed on a residential feature wall and column.",
      zh: "住宅文化石背景墙与柱面铺贴案例。",
    },
    originalSource:
      "/public/case-studies/unsorted/微信图片_20260407223837_28409_1476.jpg",
  },
  {
    src: "/case-studies/selected/projects/pool-tiling.webp",
    alt: {
      en: "Swimming pool tiling with blue mosaic finishes for a residential pool.",
      zh: "住宅泳池蓝色马赛克瓷砖铺贴案例。",
    },
    originalSource:
      "/public/case-studies/unsorted/微信图片_20260407223645_28388_1476.jpg",
  },
  {
    src: "/case-studies/selected/projects/pattern-floor.webp",
    alt: {
      en: "Pattern floor tiles installed in a compact residential room.",
      zh: "小空间花砖地面铺贴案例。",
    },
    originalSource:
      "/public/case-studies/unsorted/微信图片_20260407221143_28334_1476.jpg",
  },
  {
    src: "/case-studies/selected/projects/shower-niche-tiling.webp",
    alt: {
      en: "Grey bathroom tiling with a feature niche and shower fitting set-out.",
      zh: "灰色浴室贴砖与壁龛细节案例。",
    },
    originalSource:
      "/public/case-studies/unsorted/微信图片_20260407223724_28398_1476.jpg",
  },
  {
    src: "/case-studies/selected/projects/hallway-step-tiling.webp",
    alt: {
      en: "Hallway and step floor tiling finished with neat edges and transitions.",
      zh: "走道与台阶地砖铺贴案例。",
    },
    originalSource:
      "/public/case-studies/unsorted/微信图片_20260407223733_28401_1476.jpg",
  },
  {
    src: "/case-studies/selected/projects/white-splashback.webp",
    alt: {
      en: "Glossy white subway splashback installed beneath timber kitchen cabinets.",
      zh: "白色地铁砖厨房挡水板案例。",
    },
    originalSource:
      "/public/case-studies/unsorted/微信图片_20260407223653_28390_1476.jpg",
  },
];

export const processGallery: GalleryImage = {
  src: "/case-studies/selected/process/floor-installation.webp",
  alt: {
    en: "Tiler laying large-format floor tiles during installation.",
    zh: "施工中正在铺贴大规格地砖的现场照片。",
  },
  originalSource:
    "/public/case-studies/unsorted/微信图片_20260407223554_28376_1476.jpg",
};
