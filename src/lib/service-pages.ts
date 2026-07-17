import type { Locale } from "@/lib/site-config";

export const serviceSlugs = [
  "bathroom-tiling-canberra",
  "waterproofing-canberra",
  "floor-and-wall-tiling-canberra",
  "kitchen-splashback-tiling-canberra",
  "tile-repairs-regrouting-canberra",
  "stone-cladding-canberra",
  "pool-tiling-canberra",
] as const;

export type ServiceSlug = (typeof serviceSlugs)[number];

type ServiceCopy = {
  name: string;
  metadataTitle: string;
  description: string;
  eyebrow: string;
  title: string;
  intro: string;
  idealFor: string[];
  scope: string[];
  quoteFactors: string[];
  process: Array<{ title: string; description: string }>;
  faq: Array<{ question: string; answer: string }>;
};

type ServiceDefinition = {
  slug: ServiceSlug;
  heroImage: string;
  relatedGuideKeys: string[];
  en: ServiceCopy;
  zh: ServiceCopy;
};

export type ServicePage = ServiceCopy & {
  slug: ServiceSlug;
  locale: Locale;
  heroImage: string;
  relatedGuideKeys: string[];
};

const serviceDefinitions: ServiceDefinition[] = [
  {
    slug: "bathroom-tiling-canberra",
    heroImage: "/case-studies/selected/projects/bathroom-tiling.webp",
    relatedGuideKeys: [
      "bathroom-waterproofing-canberra",
      "bathroom-renovation-order",
      "bathroom-floor-tiles",
    ],
    en: {
      name: "Bathroom tiling",
      metadataTitle: "Bathroom Tiling Canberra | Wet Areas & Finishing",
      description:
        "Bathroom tiling for Canberra homes, including wall and floor tiles, shower niches, set-out, grout and silicone finishing coordinated with wet-area preparation.",
      eyebrow: "Bathroom tiling Canberra",
      title: "Bathroom tiling planned around the whole wet area.",
      intro:
        "A bathroom is a connected system rather than a collection of separate surfaces. Tile size, floor falls, niches, fittings, waterproofing and junctions all affect the finished set-out. LITA Tiling handles residential bathroom wall and floor tiling with the preparation and finishing considered from the start.",
      idealFor: [
        "Main bathrooms, ensuites and shower rooms",
        "Bathroom renovations with new wall and floor tiles",
        "Feature niches, tiled baths and detailed fitting layouts",
        "Smaller wet-area upgrades where the existing condition can be assessed",
      ],
      scope: [
        "Review of the substrate, tile format, layout and wet-area interfaces",
        "Wall and floor set-out around drains, niches, fixtures and openings",
        "Tile installation, grouting and flexible silicone junctions",
        "Coordination of tiling with the agreed waterproofing and trade sequence",
      ],
      quoteFactors: [
        "Room dimensions and how much existing material must be removed",
        "Tile size, pattern, edge detail and the number of penetrations",
        "Substrate condition, floor falls and waterproofing scope",
        "Site access, waste removal and coordination with other trades",
      ],
      process: [
        {
          title: "Review the brief",
          description:
            "Confirm the room, tile selection, photos, plans and the work being completed by other trades.",
        },
        {
          title: "Check the base",
          description:
            "Assess the substrate, wet-area preparation, levels and set-out constraints before tile installation.",
        },
        {
          title: "Set out and tile",
          description:
            "Plan visible lines and cuts around key features, then install the wall and floor finishes.",
        },
        {
          title: "Grout and finish",
          description:
            "Complete grout and flexible junctions, then review the agreed finish at handover.",
        },
      ],
      faq: [
        {
          question: "Can waterproofing and tiling be quoted together?",
          answer:
            "Yes. The quote can define both parts where they are within the agreed scope, while still identifying the sequence and any work by other trades.",
        },
        {
          question: "Do I need to choose tiles before asking for a quote?",
          answer:
            "Not always, but tile dimensions, material and layout can change preparation and labour. A shortlist or product link makes the first assessment more useful.",
        },
        {
          question: "Can you tile a shower niche?",
          answer:
            "Yes. The niche position, waterproofing, tile module and edge finish should be considered together before the final set-out is locked in.",
        },
      ],
    },
    zh: {
      name: "浴室贴砖",
      metadataTitle: "堪培拉浴室贴砖 | 墙地砖、湿区与细节收边",
      description:
        "面向堪培拉住宅的浴室墙地砖施工，包括淋浴壁龛、排版、勾缝和 Silicone 收边，并与湿区基层和防水流程协调。",
      eyebrow: "堪培拉浴室贴砖",
      title: "从整个湿区出发规划浴室贴砖。",
      intro:
        "浴室不是几块互不相关的表面。砖的规格、地面坡度、壁龛、五金、防水和交界位置都会影响最终排版。LITA Tiling 承接住宅浴室墙地砖，并从施工前就把基层、排版和收边一起考虑。",
      idealFor: [
        "主浴室、套间浴室和淋浴间",
        "更换墙砖和地砖的浴室翻新",
        "带壁龛、浴缸包砖或较多五金细节的项目",
        "需要先评估现状的小型湿区升级",
      ],
      scope: [
        "检查基层、瓷砖规格、排版和湿区交界条件",
        "围绕地漏、壁龛、五金和门口安排墙地砖排版",
        "铺贴、勾缝以及转角和交界处的柔性 Silicone 收边",
        "按已确认范围协调防水、贴砖和其他工种的先后顺序",
      ],
      quoteFactors: [
        "房间尺寸以及旧材料需要拆除到什么程度",
        "瓷砖大小、铺贴方式、边角做法和开孔数量",
        "基层状态、地面坡度和防水范围",
        "现场进出、垃圾处理和其他工种配合",
      ],
      process: [
        {
          title: "确认需求",
          description: "先确认房间、瓷砖选择、照片、图纸和其他工种负责的内容。",
        },
        {
          title: "检查基层",
          description: "铺砖前评估基层、湿区准备、水平和排版限制。",
        },
        {
          title: "排版铺贴",
          description: "围绕重点位置规划可见线条和切砖，再完成墙地砖。",
        },
        {
          title: "勾缝收尾",
          description: "完成勾缝和柔性接口，并按确认范围检查完工效果。",
        },
      ],
      faq: [
        {
          question: "防水和贴砖可以一起报价吗？",
          answer:
            "可以。若都在承接范围内，报价可以分别写清防水和贴砖，同时说明施工顺序及其他工种负责的部分。",
        },
        {
          question: "询价前一定要先选好砖吗？",
          answer:
            "不一定，但砖的尺寸、材质和排版会影响基层准备和工时。有产品链接或初步选择，第一次评估会更准确。",
        },
        {
          question: "可以做淋浴壁龛贴砖吗？",
          answer:
            "可以。壁龛位置、防水、砖的模数和边角收口需要在最终排版前一起考虑。",
        },
      ],
    },
  },
  {
    slug: "waterproofing-canberra",
    heroImage: "/case-studies/selected/projects/shower-niche-tiling.webp",
    relatedGuideKeys: [
      "bathroom-waterproofing-canberra",
      "bathroom-renovation-order",
      "bathroom-floor-tiles",
    ],
    en: {
      name: "Wet-area waterproofing",
      metadataTitle: "Bathroom Waterproofing Canberra | Wet-Area Preparation",
      description:
        "Canberra bathroom and laundry waterproofing coordinated with substrate preparation, penetrations, junctions, floor wastes and the following tile installation.",
      eyebrow: "Waterproofing Canberra",
      title:
        "Wet-area waterproofing prepared for the tile finish that follows.",
      intro:
        "Waterproofing sits behind the visible finish, so decisions about substrates, junctions, penetrations and floor wastes need to be made before tiles hide the work. LITA Tiling assesses waterproofing as part of the complete wet-area sequence and documents the scope in the quote.",
      idealFor: [
        "Bathroom and ensuite renovations",
        "Laundry and other residential wet areas",
        "Shower rebuilds where the existing system is being removed",
        "Projects combining waterproofing with new tiling",
      ],
      scope: [
        "Review and preparation of the agreed wall and floor substrates",
        "Treatment of relevant junctions, penetrations and drainage interfaces",
        "Application of the specified wet-area waterproofing system",
        "Curing and readiness checks before the next installation stage",
      ],
      quoteFactors: [
        "Wet-area type, size and shower configuration",
        "Condition and material of the existing substrate",
        "Number of penetrations, niches, wastes and changes of plane",
        "Whether demolition, screeding or tile installation is included",
      ],
      process: [
        {
          title: "Define the wet area",
          description:
            "Confirm what is being rebuilt and which surfaces and interfaces are in the waterproofing scope.",
        },
        {
          title: "Prepare the substrate",
          description:
            "Address cleanliness, soundness and agreed corrections before the membrane system starts.",
        },
        {
          title: "Treat details",
          description:
            "Complete the specified junction, penetration, flashing and drainage details as a connected system.",
        },
        {
          title: "Cure before tiling",
          description:
            "Protect the completed work and follow the system requirements before covering it with tile finishes.",
        },
      ],
      faq: [
        {
          question: "Are tiles and grout themselves waterproof?",
          answer:
            "Tiles are a durable finish, but the wet-area waterproofing system behind them performs a different job. The whole build-up needs to be planned together.",
        },
        {
          question: "Can new waterproofing be applied without removing tiles?",
          answer:
            "That depends on the defect and proposed system. A leaking or failed wet area usually needs an on-site assessment rather than a cosmetic assumption.",
        },
        {
          question: "How soon can tiling start?",
          answer:
            "Curing depends on the specified system, site conditions and manufacturer requirements. The quote and installation sequence should state the applicable wait rather than rely on a generic promise.",
        },
      ],
    },
    zh: {
      name: "湿区防水",
      metadataTitle: "堪培拉浴室防水 | 湿区基层与贴砖衔接",
      description:
        "堪培拉浴室和洗衣房防水施工，与基层、穿孔、交界、地漏和后续贴砖流程协调。",
      eyebrow: "堪培拉防水施工",
      title: "防水要为后续瓷砖饰面做好完整准备。",
      intro:
        "防水藏在最终饰面后面，所以基层、交界、穿孔和地漏等决定必须在瓷砖遮住之前做好。LITA Tiling 会把防水放在完整湿区流程里评估，并在报价中写明承接范围。",
      idealFor: [
        "浴室和套间浴室翻新",
        "洗衣房和其他住宅湿区",
        "拆除原有系统后重做的淋浴区",
        "防水与新贴砖一起安排的项目",
      ],
      scope: [
        "检查并准备报价范围内的墙地基层",
        "处理相关交界、穿孔和排水连接位置",
        "施工已确定的湿区防水系统",
        "在进入下一道工序前完成养护和状态检查",
      ],
      quoteFactors: [
        "湿区类型、面积和淋浴区形式",
        "原有基层的材质和状态",
        "穿孔、壁龛、地漏和转角数量",
        "是否包含拆除、找坡或后续贴砖",
      ],
      process: [
        {
          title: "界定湿区",
          description:
            "确认需要重做的部分，以及哪些表面和连接位置属于防水范围。",
        },
        {
          title: "准备基层",
          description: "在开始膜层施工前处理清洁、牢固度和双方确认的基层修正。",
        },
        {
          title: "处理细节",
          description: "把转角、穿孔、泛水和排水节点作为一个连续系统完成。",
        },
        {
          title: "养护后贴砖",
          description:
            "保护已完成的防水，并按照系统要求达到可覆盖状态后再贴砖。",
        },
      ],
      faq: [
        {
          question: "瓷砖和填缝剂本身能防水吗？",
          answer:
            "瓷砖是耐用饰面，但背后的湿区防水系统承担不同作用，整个构造需要一起规划。",
        },
        {
          question: "不拆砖可以直接重做防水吗？",
          answer:
            "要看问题原因和拟采用的系统。漏水或防水失效通常需要现场评估，不能只按表面现象判断。",
        },
        {
          question: "防水做完多久可以贴砖？",
          answer:
            "养护时间取决于具体系统、现场环境和厂家要求，报价与施工安排应写清适用条件，而不是使用统一承诺。",
        },
      ],
    },
  },
  {
    slug: "floor-and-wall-tiling-canberra",
    heroImage: "/case-studies/selected/projects/floor-tiling.webp",
    relatedGuideKeys: [
      "large-format-tiles",
      "porcelain-vs-ceramic-tiles",
      "prepare-tiling-quote-canberra",
    ],
    en: {
      name: "Floor and wall tiling",
      metadataTitle:
        "Floor & Wall Tiling Canberra | Residential Tile Installation",
      description:
        "Residential floor and wall tiling across Canberra for living areas, kitchens, laundries, hallways, feature walls and renovation projects.",
      eyebrow: "Floor and wall tiling Canberra",
      title:
        "Residential floor and wall tiling with the set-out resolved first.",
      intro:
        "Good tiling depends on what is underneath and how the finished lines meet the room. LITA Tiling works across residential floors and walls, with attention to substrate condition, tile format, transitions, corners and the way the installation connects to adjoining finishes.",
      idealFor: [
        "Living rooms, hallways and tiled circulation areas",
        "Kitchen, laundry and general wall tiling",
        "Large-format porcelain and standard tile layouts",
        "Feature walls and partial renovation scopes",
      ],
      scope: [
        "Review of substrate condition and tile product information",
        "Set-out for visible lines, borders, thresholds and changes of plane",
        "Floor or wall tile installation within the agreed area",
        "Grout, trims and flexible perimeter or junction finishes",
      ],
      quoteFactors: [
        "Total area, room shape and access",
        "Tile dimensions, weight, pattern and required cuts",
        "Flatness, level changes and preparation required",
        "Skirtings, trims, transitions and occupied-home staging",
      ],
      process: [
        {
          title: "Measure and review",
          description:
            "Check dimensions, tile information, substrate condition and adjoining finishes.",
        },
        {
          title: "Plan the set-out",
          description:
            "Resolve starting points, cut balance, transitions and the most visible lines.",
        },
        {
          title: "Prepare and install",
          description:
            "Complete the agreed preparation and install tiles with the selected system.",
        },
        {
          title: "Finish junctions",
          description:
            "Complete grout, trims and movement or flexible joints required by the scope.",
        },
      ],
      faq: [
        {
          question: "Can you tile one room rather than a whole house?",
          answer:
            "Yes. Smaller rooms, hallways, laundries and feature areas can be quoted as their own scope.",
        },
        {
          question: "Can large-format tiles go over an uneven floor?",
          answer:
            "Large tiles generally make substrate variation more important, not less. The floor condition should be assessed and the correct preparation agreed before installation.",
        },
        {
          question: "Do you supply the tiles?",
          answer:
            "Material arrangements can be agreed during quoting. Product details are still needed so the installation system and labour can be assessed correctly.",
        },
      ],
    },
    zh: {
      name: "墙地砖铺贴",
      metadataTitle: "堪培拉墙地砖铺贴 | 住宅瓷砖施工",
      description:
        "面向堪培拉住宅的墙地砖施工，适用于客厅、厨房、洗衣房、走道、特色墙和翻新项目。",
      eyebrow: "堪培拉墙地砖铺贴",
      title: "先解决排版，再完成住宅墙地砖。",
      intro:
        "贴砖效果既取决于下面的基层，也取决于完成线条如何与房间连接。LITA Tiling 承接住宅墙地砖，重点考虑基层状态、砖的规格、过渡位置、转角和相邻饰面的衔接。",
      idealFor: [
        "客厅、走道和住宅通行区域地砖",
        "厨房、洗衣房和一般墙砖",
        "大规格瓷质砖和常规规格排版",
        "特色墙和局部翻新",
      ],
      scope: [
        "检查基层状态和瓷砖产品信息",
        "规划可见线条、边界、门口过渡和转角",
        "完成报价区域内的墙砖或地砖",
        "完成勾缝、收边条和柔性交界",
      ],
      quoteFactors: [
        "总面积、房间形状和现场进出条件",
        "砖的尺寸、重量、图案和切割数量",
        "平整度、高差和所需基层处理",
        "踢脚、收边、过渡以及有人居住时的分段安排",
      ],
      process: [
        {
          title: "测量检查",
          description: "检查尺寸、砖的信息、基层状态和相邻饰面。",
        },
        {
          title: "规划排版",
          description: "确定起铺点、两侧切砖比例、过渡和重点可见线条。",
        },
        {
          title: "准备铺贴",
          description: "完成双方确认的基层准备，并使用适合的系统铺砖。",
        },
        {
          title: "完成接口",
          description: "按范围完成勾缝、收边以及需要的伸缩或柔性接口。",
        },
      ],
      faq: [
        {
          question: "可以只做一个房间吗？",
          answer: "可以。小房间、走道、洗衣房和特色区域都可以单独报价。",
        },
        {
          question: "地面不平可以直接铺大砖吗？",
          answer:
            "大规格瓷砖通常会让基层误差更明显。施工前应先评估地面状态，并确认合适的准备方式。",
        },
        {
          question: "瓷砖由谁购买？",
          answer:
            "材料安排可以在报价时确认，但仍需要产品信息，才能正确判断安装系统和工时。",
        },
      ],
    },
  },
  {
    slug: "kitchen-splashback-tiling-canberra",
    heroImage: "/case-studies/selected/projects/kitchen-splashback.webp",
    relatedGuideKeys: [
      "porcelain-vs-ceramic-tiles",
      "prepare-tiling-quote-canberra",
      "large-format-tiles",
    ],
    en: {
      name: "Kitchen splashbacks",
      metadataTitle:
        "Kitchen Splashback Tiling Canberra | Neat Cuts & Finishes",
      description:
        "Kitchen splashback tiling in Canberra with layout planning around benches, cabinets, power points, corners and silicone junctions.",
      eyebrow: "Kitchen splashback tiling Canberra",
      title: "A compact tiling job where every line stays visible.",
      intro:
        "A splashback may cover a smaller area, but cabinets, power points, corners and bench lines make the set-out highly visible. LITA Tiling quotes splashbacks as a complete small project, including the agreed preparation, tile layout, cuts, grout and flexible bench junctions.",
      idealFor: [
        "New kitchens ready for a tiled splashback",
        "Replacement splashbacks during a partial kitchen update",
        "Subway, mosaic and other small-format wall tiles",
        "Feature tile layouts behind cooktops or sinks",
      ],
      scope: [
        "Review of the wall surface, tile dimensions and finished kitchen levels",
        "Set-out around cabinets, outlets, windows and feature zones",
        "Tile installation, cuts, trims and grout",
        "Flexible silicone finish at nominated bench and corner junctions",
      ],
      quoteFactors: [
        "Splashback dimensions and number of separate wall areas",
        "Tile pattern, sheet format, edge trims and cut complexity",
        "Condition of the wall after old finishes are removed",
        "Power points, windows, rangehoods and other interruptions",
      ],
      process: [
        {
          title: "Confirm finished levels",
          description:
            "Check the installed bench, cabinet lines, outlets and the exact tiled area.",
        },
        {
          title: "Balance the layout",
          description:
            "Plan the pattern and cuts around the most visible centre lines and edges.",
        },
        {
          title: "Install and grout",
          description:
            "Fix the tiles, complete clean cuts and grout the finished layout.",
        },
        {
          title: "Seal junctions",
          description:
            "Apply the agreed flexible finish where the splashback meets benches and adjoining surfaces.",
        },
      ],
      faq: [
        {
          question: "Is a small splashback job worth quoting?",
          answer:
            "Yes. Send the wall dimensions, tile choice and clear photos so the small scope can be assessed efficiently.",
        },
        {
          question: "Should the kitchen be installed before tiling?",
          answer:
            "The finished bench and cabinet positions usually define the splashback. The trade sequence should be confirmed before booking.",
        },
        {
          question: "Can you tile around existing power points?",
          answer:
            "The tile layout can account for outlets, but electrical removal or alteration must be handled by the appropriate trade where required.",
        },
      ],
    },
    zh: {
      name: "厨房挡水板",
      metadataTitle: "堪培拉厨房挡水板贴砖 | 排版、切割与收边",
      description:
        "堪培拉厨房挡水板贴砖，围绕台面、吊柜、插座、转角和 Silicone 交界进行排版与施工。",
      eyebrow: "堪培拉厨房挡水板",
      title: "面积不大，但每条线都看得见。",
      intro:
        "挡水板面积通常不大，但吊柜、插座、转角和台面线条会让排版细节非常明显。LITA Tiling 会把挡水板作为完整小项目报价，包括已确认的基层准备、排版、切割、勾缝和台面柔性收边。",
      idealFor: [
        "橱柜和台面已安装的新厨房",
        "局部厨房升级时更换挡水板",
        "地铁砖、马赛克和其他小规格墙砖",
        "灶台或水槽后面的特色砖排版",
      ],
      scope: [
        "检查墙面、砖的尺寸和厨房完成标高",
        "围绕吊柜、插座、窗户和特色区域排版",
        "完成铺贴、切割、收边条和勾缝",
        "在约定的台面和转角位置完成 Silicone 柔性收口",
      ],
      quoteFactors: [
        "挡水板尺寸和分开的墙面数量",
        "排版方式、联片规格、收边条和切割复杂度",
        "拆除旧饰面后的墙面状态",
        "插座、窗户、抽油烟机和其他中断位置",
      ],
      process: [
        {
          title: "确认完成线",
          description: "检查已安装台面、吊柜、插座和准确铺贴范围。",
        },
        {
          title: "平衡排版",
          description: "围绕最显眼的中心线和边缘规划图案与切砖。",
        },
        { title: "铺贴勾缝", description: "完成铺贴、整洁切割和最终勾缝。" },
        {
          title: "密封交界",
          description: "在挡水板与台面和相邻表面的约定位置完成柔性收边。",
        },
      ],
      faq: [
        {
          question: "面积很小也可以报价吗？",
          answer:
            "可以。把墙面尺寸、瓷砖选择和清晰照片发过来，就能更高效地判断这个小项目。",
        },
        {
          question: "先装橱柜还是先贴挡水板？",
          answer:
            "完成后的台面和吊柜位置通常决定挡水板边界，预约前应先确认工种顺序。",
        },
        {
          question: "可以围绕现有插座切砖吗？",
          answer:
            "排版可以考虑插座位置，但如需拆改电气部件，应由相应持证工种处理。",
        },
      ],
    },
  },
  {
    slug: "tile-repairs-regrouting-canberra",
    heroImage: "/case-studies/selected/projects/white-splashback.webp",
    relatedGuideKeys: [
      "regrout-reseal-or-retile",
      "prepare-tiling-quote-canberra",
      "bathroom-waterproofing-canberra",
    ],
    en: {
      name: "Tile repairs and regrouting",
      metadataTitle:
        "Tile Repairs & Regrouting Canberra | Silicone & Small Jobs",
      description:
        "Canberra tile repairs, replacement tiles, regrouting and silicone renewal for suitable residential bathrooms, showers, floors and splashbacks.",
      eyebrow: "Tile repairs Canberra",
      title:
        "Repair the visible finish only when the underlying problem allows it.",
      intro:
        "Loose tiles, cracked grout and failed silicone can look similar while having different causes. LITA Tiling handles suitable repair and refresh work, but the first step is defining whether the issue is limited to the finish or points to movement, moisture or a wider substrate problem.",
      idealFor: [
        "Individual damaged or loose tiles where matching material is available",
        "Worn or failed silicone at suitable wet-area junctions",
        "Localised grout refresh work",
        "Small tiled areas that need a practical condition assessment",
      ],
      scope: [
        "Review of photos, location, symptoms and available replacement tiles",
        "Removal and replacement within the agreed repair area",
        "Local regrouting or silicone removal and renewal where suitable",
        "Clear limits where a repair cannot address the underlying cause",
      ],
      quoteFactors: [
        "Cause and extent of the visible damage",
        "Availability and size of matching replacement tiles",
        "Access without damaging adjoining finishes",
        "Evidence of movement, hollow areas or moisture beyond the surface",
      ],
      process: [
        {
          title: "Describe the symptom",
          description:
            "Provide close and wide photos, location, history and any spare tile information.",
        },
        {
          title: "Assess repair limits",
          description:
            "Determine whether a local finish repair is reasonable or a wider inspection is needed.",
        },
        {
          title: "Complete agreed work",
          description:
            "Remove and renew only the tiles, grout or silicone included in the quote.",
        },
        {
          title: "Explain the outcome",
          description:
            "Clarify what the repair addresses and any remaining condition that should be monitored.",
        },
      ],
      faq: [
        {
          question: "Will regrouting stop a leaking shower?",
          answer:
            "Not necessarily. Grout appearance alone does not identify the waterproofing condition, so an active leak should not be promised away with a cosmetic repair.",
        },
        {
          question: "Can one cracked tile be replaced?",
          answer:
            "Sometimes, if a suitable matching tile exists and it can be removed without unacceptable damage to the surrounding area. The cause of the crack still matters.",
        },
        {
          question: "Can old silicone be renewed?",
          answer:
            "Yes where the junction and surrounding condition are suitable. The old material and contamination must be removed sufficiently for the replacement system.",
        },
      ],
    },
    zh: {
      name: "补砖、补缝与打胶",
      metadataTitle: "堪培拉补砖与补缝 | Silicone 更新和小型维修",
      description:
        "适用于堪培拉住宅浴室、淋浴区、地面和挡水板的补砖、局部补缝与 Silicone 更新。",
      eyebrow: "堪培拉瓷砖维修",
      title: "只有基层问题允许时，表面维修才真正合适。",
      intro:
        "松砖、裂缝和失效的 Silicone 看起来可能相似，但原因不一定相同。LITA Tiling 承接适合的局部维修和翻新，不过第一步是判断问题只在饰面，还是涉及位移、潮气或更大的基层问题。",
      idealFor: [
        "有同款备用砖的单块破损或松动瓷砖",
        "条件合适的湿区交界旧 Silicone",
        "局部填缝翻新",
        "需要先判断状态的小面积砖面",
      ],
      scope: [
        "根据照片、位置、现象和备用砖信息初步检查",
        "在报价范围内拆除和更换",
        "条件合适时局部补缝或清除并更新 Silicone",
        "无法通过表面维修解决时明确说明范围限制",
      ],
      quoteFactors: [
        "表面损坏的原因和范围",
        "是否有尺寸和颜色匹配的备用砖",
        "拆除时能否避免破坏相邻饰面",
        "是否存在位移、空鼓或表面以下潮气迹象",
      ],
      process: [
        {
          title: "说明现象",
          description: "提供近照、远照、位置、出现过程和备用砖信息。",
        },
        {
          title: "判断维修边界",
          description: "确认局部表面维修是否合理，还是需要进一步检查。",
        },
        {
          title: "完成约定内容",
          description: "只处理报价中明确包含的瓷砖、填缝或 Silicone。",
        },
        {
          title: "说明处理结果",
          description: "解释本次维修解决了什么，以及仍需观察的状态。",
        },
      ],
      faq: [
        {
          question: "重新补缝能解决淋浴区漏水吗？",
          answer:
            "不一定。只看填缝表面无法判断防水层状态，已经漏水的情况不能用美容性维修作保证。",
        },
        {
          question: "只裂一块砖可以单独换吗？",
          answer:
            "有时可以，但需要有合适的同款砖，并且拆除时不会对周边造成不可接受的破坏，同时还要考虑开裂原因。",
        },
        {
          question: "旧 Silicone 可以重新打吗？",
          answer:
            "如果接口和周边状态合适可以更新。旧材料和污染需要充分清除，才能为新系统提供合适条件。",
        },
      ],
    },
  },
  {
    slug: "stone-cladding-canberra",
    heroImage: "/case-studies/selected/projects/stone-cladding.webp",
    relatedGuideKeys: [
      "large-format-tiles",
      "prepare-tiling-quote-canberra",
      "porcelain-vs-ceramic-tiles",
    ],
    en: {
      name: "Stone cladding",
      metadataTitle: "Stone Cladding Canberra | Feature Walls & Columns",
      description:
        "Residential stone cladding in Canberra for suitable feature walls, columns, entries and statement surfaces with substrate and support considered.",
      eyebrow: "Stone cladding Canberra",
      title:
        "Feature stone needs a support system, not only a surface pattern.",
      intro:
        "Stone cladding introduces weight, depth and irregular edges that need different planning from a light wall tile. LITA Tiling assesses suitable residential feature walls and columns with attention to the substrate, unit weight, height, corners and the nominated fixing system.",
      idealFor: [
        "Interior feature walls and fireplace surrounds where suitable",
        "Residential entry columns and statement surfaces",
        "Stacked-stone and other modular cladding products",
        "Selected exterior residential details after system review",
      ],
      scope: [
        "Review of the cladding product, weight and manufacturer information",
        "Assessment of the nominated substrate and installation height",
        "Layout of corners, returns, edges and visible module variation",
        "Installation within the confirmed adhesive or mechanical support system",
      ],
      quoteFactors: [
        "Product weight, dimensions and corner units",
        "Wall material, height and condition",
        "Internal or external exposure and access",
        "Need for trims, returns, support or product-specific preparation",
      ],
      process: [
        {
          title: "Identify the product",
          description:
            "Collect the cladding specification, weight, unit sizes and installation guidance.",
        },
        {
          title: "Check support",
          description:
            "Assess whether the background and proposed fixing method suit the load and height.",
        },
        {
          title: "Plan the pattern",
          description:
            "Balance modules, corners, returns and colour or texture variation before fixing.",
        },
        {
          title: "Install the system",
          description:
            "Use the agreed preparation and support method, then complete the nominated edge finish.",
        },
      ],
      faq: [
        {
          question: "Can stone cladding be fixed to any wall?",
          answer:
            "No. Product weight, substrate capacity, height and the fixing system all need to be considered before installation.",
        },
        {
          question: "Do external feature walls need different planning?",
          answer:
            "Yes. Exposure, movement, moisture, height and manufacturer requirements can change the suitable system.",
        },
        {
          question: "Can you clad columns and corners?",
          answer:
            "Yes for suitable products and substrates. Corner units, returns and the visible module should be included in the material and set-out review.",
        },
      ],
    },
    zh: {
      name: "文化石与石材饰面",
      metadataTitle: "堪培拉文化石铺贴 | 背景墙、立柱与特色饰面",
      description:
        "堪培拉住宅文化石和石材饰面，适用于条件合适的背景墙、立柱、入口和特色表面，并考虑基层与支撑系统。",
      eyebrow: "堪培拉石材饰面",
      title: "文化石首先需要合适的支撑系统，其次才是表面排版。",
      intro:
        "石材饰面带来重量、厚度和不规则边缘，规划方式与轻质墙砖不同。LITA Tiling 会根据基层、单块重量、安装高度、转角和指定固定系统评估适合的住宅背景墙与立柱项目。",
      idealFor: [
        "条件合适的室内背景墙和壁炉周边",
        "住宅入口立柱和特色表面",
        "模块化文化石及其他饰面产品",
        "经过系统评估的部分室外住宅细节",
      ],
      scope: [
        "检查饰面产品、重量和厂家资料",
        "评估指定基层和安装高度",
        "规划转角、返边、边缘和可见模块变化",
        "按确认的粘贴或机械支撑系统施工",
      ],
      quoteFactors: [
        "产品重量、尺寸和转角件",
        "墙体材质、高度和状态",
        "室内外环境与进出条件",
        "是否需要收边、返边、支撑或产品专用基层准备",
      ],
      process: [
        {
          title: "确认产品",
          description: "收集饰面规格、重量、单块尺寸和安装说明。",
        },
        {
          title: "检查支撑",
          description: "评估基层和拟采用的固定方式是否适合重量与高度。",
        },
        {
          title: "规划纹理",
          description: "铺贴前平衡模块、转角、返边和颜色或纹理变化。",
        },
        {
          title: "完成系统",
          description: "使用确认的准备和支撑方式施工，再完成约定的边缘处理。",
        },
      ],
      faq: [
        {
          question: "文化石可以贴在任何墙面上吗？",
          answer:
            "不可以。施工前要考虑产品重量、基层承载、安装高度和固定系统。",
        },
        {
          question: "室外特色墙需要不同做法吗？",
          answer:
            "需要。暴露环境、位移、潮气、高度和厂家要求都可能改变适用系统。",
        },
        {
          question: "可以做立柱和转角吗？",
          answer:
            "如果产品和基层合适可以。转角件、返边和可见模块应纳入材料与排版检查。",
        },
      ],
    },
  },
  {
    slug: "pool-tiling-canberra",
    heroImage: "/case-studies/selected/projects/pool-tiling.webp",
    relatedGuideKeys: [
      "outdoor-pool-tiling-canberra",
      "porcelain-vs-ceramic-tiles",
      "prepare-tiling-quote-canberra",
    ],
    en: {
      name: "Pool tiling",
      metadataTitle: "Pool Tiling Canberra | Residential Pool Tile Finishes",
      description:
        "Selected residential pool tiling in Canberra, assessed around pool condition, waterline or interior scope, tile system, access and outdoor exposure.",
      eyebrow: "Pool tiling Canberra",
      title: "Pool tiles need a system selected for permanent wet exposure.",
      intro:
        "Pool tiling combines a specialised substrate, constant water exposure, chemicals, movement and outdoor temperature changes. LITA Tiling considers selected residential pool scopes after reviewing the existing condition, access, tile product and the complete installation system.",
      idealFor: [
        "Selected residential pool interiors",
        "Waterline tile installation or renewal",
        "Mosaic and pool-rated tile finishes",
        "Pool-adjacent tiled details that can be clearly separated from paving scope",
      ],
      scope: [
        "Initial review of pool condition, surface and proposed tiled area",
        "Assessment of tile and installation-system suitability",
        "Set-out around waterlines, curves, fittings and terminations",
        "Installation and finishing within the confirmed pool-tiling scope",
      ],
      quoteFactors: [
        "Whether the work is waterline, interior or a localised section",
        "Existing surface, preparation and evidence of wider failure",
        "Tile sheet format, curves, penetrations and edge details",
        "Drain-down responsibility, access, weather and curing protection",
      ],
      process: [
        {
          title: "Define the pool scope",
          description:
            "Separate waterline, interior, repair and surrounding-area requirements.",
        },
        {
          title: "Review the system",
          description:
            "Check the substrate, tile product and compatible preparation, adhesive and grout requirements.",
        },
        {
          title: "Plan set-out",
          description:
            "Resolve waterlines, curves, fittings and visible terminations before fixing.",
        },
        {
          title: "Protect the cure",
          description:
            "Complete the agreed finish and follow the applicable curing and refill sequence.",
        },
      ],
      faq: [
        {
          question: "Can ordinary indoor tiles be used in a pool?",
          answer:
            "A pool needs products and a complete installation system suitable for that exposure. Product data should be checked before purchase or quoting.",
        },
        {
          question: "Can only the waterline be retiled?",
          answer:
            "Sometimes. The surrounding condition and interface with the remaining finish must be assessed before defining a limited scope.",
        },
        {
          question: "Can a few loose pool tiles simply be stuck back?",
          answer:
            "A local repair may be possible, but repeated or widespread failure can indicate a preparation, movement or system issue that a small patch will not resolve.",
        },
      ],
    },
    zh: {
      name: "泳池瓷砖",
      metadataTitle: "堪培拉泳池贴砖 | 住宅泳池瓷砖饰面",
      description:
        "堪培拉部分住宅泳池贴砖项目，根据泳池现状、水线或内壁范围、瓷砖系统、现场进出和室外环境评估。",
      eyebrow: "堪培拉泳池贴砖",
      title: "泳池瓷砖需要为长期浸水环境选择完整系统。",
      intro:
        "泳池贴砖同时涉及特殊基层、持续浸水、化学品、位移和室外温差。LITA Tiling 会在检查现状、进出条件、瓷砖产品和完整施工系统后，评估适合承接的住宅泳池范围。",
      idealFor: [
        "部分住宅泳池内壁",
        "水线砖安装或更新",
        "马赛克及适用于泳池的瓷砖饰面",
        "可以与铺装范围清楚分开的泳池周边细节",
      ],
      scope: [
        "初步检查泳池状态、表面和拟贴砖区域",
        "评估瓷砖和施工系统是否适合",
        "围绕水线、曲面、配件和收口排版",
        "在确认的泳池贴砖范围内施工和收尾",
      ],
      quoteFactors: [
        "项目属于水线、内壁还是局部区域",
        "原有表面、基层准备和是否有更大范围失效迹象",
        "联片规格、曲面、穿孔和边缘细节",
        "排水责任、进出条件、天气和养护保护",
      ],
      process: [
        {
          title: "界定泳池范围",
          description: "分清水线、内壁、维修和周边区域的需求。",
        },
        {
          title: "检查施工系统",
          description: "确认基层、瓷砖以及兼容的准备、胶和填缝要求。",
        },
        {
          title: "规划排版",
          description: "施工前解决水线、曲面、配件和可见收口。",
        },
        {
          title: "保护养护",
          description: "完成约定饰面，并遵循适用的养护和重新注水顺序。",
        },
      ],
      faq: [
        {
          question: "普通室内瓷砖可以用在泳池里吗？",
          answer:
            "泳池需要适用于该环境的产品和完整施工系统，购买或报价前应检查产品资料。",
        },
        {
          question: "可以只更换水线砖吗？",
          answer:
            "有时可以，但需要先评估周边状态以及新旧饰面交界，再确定局部范围。",
        },
        {
          question: "几块松动的泳池砖可以直接粘回去吗？",
          answer:
            "局部维修可能可行，但反复或大范围脱落可能说明基层准备、位移或系统问题，小修补无法解决。",
        },
      ],
    },
  },
];

export const servicePageUi: Record<
  Locale,
  {
    indexEyebrow: string;
    indexTitle: string;
    indexDescription: string;
    idealFor: string;
    scope: string;
    quoteFactors: string;
    process: string;
    faq: string;
    relatedGuides: string;
    learnMore: string;
    requestQuote: string;
    ctaTitle: string;
    ctaDescription: string;
  }
> = {
  en: {
    indexEyebrow: "Residential tiling services",
    indexTitle:
      "Canberra tiling services, explained before you request a quote.",
    indexDescription:
      "Explore the main residential services LITA Tiling handles and the information that helps define a practical scope.",
    idealFor: "Good fit for",
    scope: "What the scope can include",
    quoteFactors: "What affects the quote",
    process: "How the work is approached",
    faq: "Common questions",
    relatedGuides: "Related homeowner guides",
    learnMore: "View service",
    requestQuote: "Request a free quote",
    ctaTitle: "Have a project in Canberra?",
    ctaDescription:
      "Send the suburb, work area, photos and any tile information available. We will review the scope before discussing the next step.",
  },
  zh: {
    indexEyebrow: "住宅贴砖服务",
    indexTitle: "询价前先把堪培拉贴砖服务说明白。",
    indexDescription:
      "了解 LITA Tiling 主要承接的住宅项目，以及界定实际施工范围时需要的信息。",
    idealFor: "适合这些项目",
    scope: "施工范围可以包括",
    quoteFactors: "影响报价的因素",
    process: "一般如何安排",
    faq: "常见问题",
    relatedGuides: "相关阅读",
    learnMore: "查看服务",
    requestQuote: "申请免费报价",
    ctaTitle: "在堪培拉有贴砖项目？",
    ctaDescription:
      "请发送 suburb、施工区域、照片和现有瓷砖资料。我们会先判断范围，再沟通下一步。",
  },
};

export const aboutPageContent: Record<
  Locale,
  {
    metadataTitle: string;
    description: string;
    eyebrow: string;
    title: string;
    intro: string;
    principles: Array<{ title: string; description: string }>;
    projectTypes: string[];
  }
> = {
  en: {
    metadataTitle: "About LITA Tiling Canberra | Residential Tiler",
    description:
      "Learn how LITA Tiling approaches residential tiling, waterproofing, repairs and project communication across Canberra.",
    eyebrow: "About LITA Tiling",
    title: "Residential tiling built around clear scope and careful finishing.",
    intro:
      "LITA Tiling Canberra works with homeowners on bathrooms, floors, walls, splashbacks, wet areas, stone features, pools and suitable repair jobs. English and Chinese communication is available, so the work, exclusions and next steps can be discussed clearly before installation begins.",
    principles: [
      {
        title: "Scope before promises",
        description:
          "Photos, dimensions, product choices and site condition are reviewed before the work is treated as a defined project.",
      },
      {
        title: "Preparation is part of the finish",
        description:
          "Substrate condition, set-out and interfaces are considered because they directly affect the visible tile work.",
      },
      {
        title: "Suitable solutions, not automatic upgrades",
        description:
          "A small repair stays a small repair when the condition allows it; wider work is raised only when the observed scope requires it.",
      },
      {
        title: "Bilingual communication",
        description:
          "Homeowners can discuss their project in English or Chinese while the public scope remains written for the Canberra market.",
      },
    ],
    projectTypes: [
      "Bathrooms and wet areas",
      "Floor and wall tiling",
      "Kitchen splashbacks",
      "Tile repairs, grout and silicone",
      "Stone cladding",
      "Selected pool tiling",
    ],
  },
  zh: {
    metadataTitle: "关于 LITA Tiling Canberra | 住宅贴砖服务",
    description:
      "了解 LITA Tiling 在堪培拉如何安排住宅贴砖、防水、维修和项目沟通。",
    eyebrow: "关于 LITA Tiling",
    title: "先把范围说清楚，再把住宅贴砖细节做好。",
    intro:
      "LITA Tiling Canberra 面向业主承接浴室、墙地砖、挡水板、湿区、石材特色面、泳池和条件合适的维修项目。支持中英文沟通，方便在施工前把工作范围、不包含内容和下一步安排说明白。",
    principles: [
      {
        title: "先确认范围",
        description:
          "先检查照片、尺寸、产品选择和现场状态，再把需求视为已经明确的项目。",
      },
      {
        title: "基层决定完成面",
        description:
          "基层状态、排版和交界会直接影响可见效果，因此它们也是施工的一部分。",
      },
      {
        title: "按真实问题选择处理方式",
        description:
          "条件允许时，小维修就保持为小维修；只有观察到的范围需要时，才说明更大的处理需求。",
      },
      {
        title: "中英文沟通",
        description:
          "业主可以用中文或英文讨论项目，同时公开内容仍按堪培拉市场和本地要求编写。",
      },
    ],
    projectTypes: [
      "浴室和湿区",
      "墙地砖铺贴",
      "厨房挡水板",
      "补砖、填缝和 Silicone",
      "石材饰面",
      "部分泳池贴砖",
    ],
  },
};

export const serviceAreasContent: Record<
  Locale,
  {
    metadataTitle: string;
    description: string;
    eyebrow: string;
    title: string;
    intro: string;
    beforeContact: string;
    checklist: string[];
  }
> = {
  en: {
    metadataTitle: "Canberra Tiling Service Areas | LITA Tiling",
    description:
      "LITA Tiling serves residential projects across Canberra, including Belconnen, Gungahlin, Woden, Tuggeranong, Inner North, Inner South, Molonglo and Weston Creek.",
    eyebrow: "Canberra service areas",
    title: "Residential tiling across Canberra's main districts.",
    intro:
      "The listed districts describe the normal Canberra service area rather than separate local offices. Projects outside these areas can still be checked by sending the suburb and a short description of the work.",
    beforeContact: "To confirm whether the location and scope fit, include:",
    checklist: [
      "The suburb and property type",
      "The room or surface to be tiled",
      "Clear overview and close-up photos",
      "Approximate dimensions and tile information",
      "Any access, parking or timing constraints",
    ],
  },
  zh: {
    metadataTitle: "堪培拉贴砖服务区域 | LITA Tiling",
    description:
      "LITA Tiling 服务堪培拉各主要住宅区域，包括 Belconnen、Gungahlin、Woden、Tuggeranong、Inner North、Inner South、Molonglo 和 Weston Creek。",
    eyebrow: "堪培拉服务区域",
    title: "服务堪培拉各主要区域的住宅贴砖项目。",
    intro:
      "以下区域代表日常上门服务范围，并不表示在每个区域都有办公室。其他 suburb 也可以发送位置和项目简介，先确认是否适合安排。",
    beforeContact: "为了确认位置和项目是否合适，请提供：",
    checklist: [
      "Suburb 和房屋类型",
      "需要贴砖的房间或表面",
      "清晰的整体照片和细节照片",
      "大概尺寸和瓷砖资料",
      "进出、停车或时间方面的限制",
    ],
  },
};

export function getServicePages(locale: Locale): ServicePage[] {
  return serviceDefinitions.map((definition) => ({
    slug: definition.slug,
    locale,
    heroImage: definition.heroImage,
    relatedGuideKeys: definition.relatedGuideKeys,
    ...definition[locale],
  }));
}

export function getServicePage(locale: Locale, slug: string) {
  return getServicePages(locale).find((service) => service.slug === slug);
}
