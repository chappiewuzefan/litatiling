import type { Locale } from "@/lib/site-config";
import { siteConfig } from "@/lib/site-config";

export type ContactFormContent = {
  title: string;
  description: string;
  fields: {
    name: string;
    phone: string;
    email: string;
    suburb: string;
    serviceType: string;
    projectType: string;
    preferredLanguage: string;
    message: string;
  };
  placeholders: {
    name: string;
    phone: string;
    email: string;
    suburb: string;
    message: string;
  };
  serviceOptions: Array<{ value: string; label: string }>;
  projectOptions: Array<{ value: string; label: string }>;
  languageOptions: Array<{ value: string; label: string }>;
  submitLabel: string;
  submittingLabel: string;
  successLabel: string;
  errorFallback: string;
};

type LocaleContent = {
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  common: {
    skipToMain: string;
    callNow: string;
    emailUs: string;
    requestQuote: string;
    bilingual: string;
    placeholderBanner: string;
  };
  nav: {
    services: string;
    projects: string;
    process: string;
    areas: string;
    faq: string;
    contact: string;
    privacy: string;
    backHome: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    badges: string[];
    primaryCta: string;
    secondaryCta: string;
    stats: Array<{ value: string; label: string }>;
    panelTitle: string;
    panelDescription: string;
    panelPoints: string[];
  };
  trust: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{ title: string; description: string }>;
  };
  services: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      bullets: string[];
    }>;
  };
  projects: {
    eyebrow: string;
    title: string;
    description: string;
    notice: string;
    items: Array<{
      suburb: string;
      title: string;
      summary: string;
      result: string;
      highlights: string[];
    }>;
  };
  process: {
    eyebrow: string;
    title: string;
    description: string;
    spotlightTitle: string;
    spotlightDescription: string;
    steps: Array<{ title: string; description: string }>;
  };
  areas: {
    eyebrow: string;
    title: string;
    description: string;
    coverageNote: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{ question: string; answer: string }>;
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    cards: Array<{ title: string; body: string; href?: string; action?: string }>;
    form: ContactFormContent;
  };
  footer: {
    tagline: string;
    rights: string;
    home: string;
    privacy: string;
  };
  thanks: {
    title: string;
    description: string;
    nextSteps: string[];
    primaryCta: string;
    secondaryCta: string;
  };
  privacy: {
    title: string;
    intro: string;
    sections: Array<{ title: string; body: string[] }>;
  };
};

const serviceOptionValues = [
  "floor-tiling",
  "wall-tiling",
  "bathroom-tiling",
  "splashback",
  "waterproofing",
  "silicone",
  "stone-cladding",
  "pool-tiling",
  "repairs",
] as const;

export const contentByLocale: Record<Locale, LocaleContent> = {
  en: {
    metadata: {
      title: `Canberra Tiler & Waterproofing | Floors, Walls, Bathrooms | ${siteConfig.brandName}`,
      description:
        "Licensed Canberra residential tiling for floor tiling, wall tiling, bathroom tiling, waterproofing, splashbacks, silicone sealing, stone cladding, pool tiling and repairs. Free quotes with English and Chinese support.",
      keywords: [
        "Canberra tiler",
        "Canberra tiling",
        "Canberra waterproofing",
        "bathroom tiling Canberra",
        "floor tiling Canberra",
        "wall tiling Canberra",
        "splashback tiling Canberra",
        "silicone sealing Canberra",
        "stone cladding Canberra",
        "pool tiling Canberra",
      ],
    },
    common: {
      skipToMain: "Skip to main content",
      callNow: "Call now",
      emailUs: "Email",
      requestQuote: "Request a free quote",
      bilingual: "English / 中文 support",
      placeholderBanner:
        "Confirm the final production domain, legal company spelling and privacy wording before launch.",
    },
    nav: {
      services: "Services",
      projects: "Case studies",
      process: "Process",
      areas: "Service areas",
      faq: "FAQ",
      contact: "Contact",
      privacy: "Privacy",
      backHome: "Back to home",
    },
    hero: {
      eyebrow: "Licensed Canberra tiler | 22+ years | English & Chinese",
      title: "Canberra tiling, waterproofing and silicone for residential projects.",
      description:
        "Floor tiling, wall tiling, bathroom waterproofing, splashbacks, stone cladding, feature columns, pool tiling and repair work across Canberra. Built to be clear for homeowners, search engines and AI search systems from the first screen.",
      badges: [
        "Bathrooms, floors and walls",
        "Waterproofing, silicone and regrouting",
        "Stone cladding, splashbacks and pool tiling",
      ],
      primaryCta: "Request a free quote",
      secondaryCta: "See services",
      stats: [
        { value: "22+ years", label: "Experience" },
        { value: "Licensed", label: "Public trust signal" },
        { value: "Free quotes", label: "Residential enquiries" },
      ],
      panelTitle: "What we handle",
      panelDescription:
        "Send the suburb, room type and a few notes about the job. We quote for bathrooms, living areas, kitchens, feature walls, columns, pool areas and smaller repair work.",
      panelPoints: [
        "Bathrooms, laundries, floors, walls, splashbacks and wet areas",
        "Silicone sealing, regrouting, stone cladding and pool tiling",
        "Residential Canberra work with workmanship warranty",
      ],
    },
    trust: {
      eyebrow: "Why homeowners enquire",
      title: "The page tells people and search systems exactly what you do.",
      description:
        "The structure is intentionally direct: services, recent work, Canberra coverage, FAQ and contact details. That makes the business easier to understand, compare and contact.",
      items: [
        {
          title: "Licensed trade",
          description:
            "Licensed positioning is stated clearly in the hero, trust content and structured business data.",
        },
        {
          title: "22+ years",
          description:
            "Experience is visible early so homeowners understand they are looking at an established residential trade business.",
        },
        {
          title: "Residential focus",
          description:
            "The messaging stays aimed at Canberra homeowners, bathrooms, kitchens, floors and other residential projects.",
        },
        {
          title: "Free quotes",
          description:
            "The primary conversion path is a free quote request with suburb, service type and project stage.",
        },
        {
          title: "Workmanship warranty",
          description:
            "Warranty language is included as a trust signal without making claims broader than the quoted scope.",
        },
      ],
    },
    services: {
      eyebrow: "Core services",
      title: "Residential tile and waterproofing work people actually search for.",
      description:
        "The service cards match local homeowner intent in Canberra and make it clear that the business covers both standard tiling work and more specialised residential finishes.",
      items: [
        {
          title: "Floor tiling",
          description:
            "Floor tiling for living areas, kitchens, laundries, hallways and other residential spaces where durability, level layout and neat edges matter.",
          bullets: [
            "Large-format and standard floor tile layouts",
            "Living areas, hallways, laundries and kitchens",
            "Clean transitions, trims and renovation-friendly staging",
          ],
        },
        {
          title: "Wall tiling",
          description:
            "Wall tiling for bathrooms, showers, laundries, kitchens and feature areas that need straight lines, tidy cuts and lasting finishes.",
          bullets: [
            "Bathroom and laundry wall tiling",
            "Kitchen and feature wall surfaces",
            "Clean cuts around fittings, niches and corners",
          ],
        },
        {
          title: "Bathroom tiling and waterproofing",
          description:
            "Full wet-area scope for bathroom renovations, shower rebuilds and laundry upgrades where waterproofing and tiling need to work together.",
          bullets: [
            "Wet-area preparation and membrane coordination",
            "Wall, floor, shower niche and vanity zones",
            "Clear scope for residential bathroom renovations",
          ],
        },
        {
          title: "Splashbacks",
          description:
            "Kitchen splashback tiling for homeowners who want a smaller job done neatly without treating it like a full renovation.",
          bullets: [
            "Subway, mosaic and feature splashbacks",
            "Silicone finishing to benches and corners",
            "Easy to quote with photos and basic measurements",
          ],
        },
        {
          title: "Waterproofing",
          description:
            "Dedicated waterproofing for bathrooms, laundries and other wet areas before tiling starts.",
          bullets: [
            "Bathroom and laundry waterproofing",
            "Preparation before tile installation",
            "Integrated into the quote and installation sequence",
          ],
        },
        {
          title: "Silicone sealing and regrouting",
          description:
            "Silicone sealing, junction finishing and regrouting to keep bathrooms, showers and splashbacks looking clean and sealed correctly.",
          bullets: [
            "Showers, vanities, corners and shower screens",
            "Neat wet-area finishing",
            "Useful as part of a refresh or repair",
          ],
        },
        {
          title: "Stone cladding and feature columns",
          description:
            "Stone cladding for feature walls, residential columns, entry details and statement surfaces that need careful alignment and solid finishing.",
          bullets: [
            "Feature stone walls and fireplaces",
            "Columns, pillars and entry details",
            "Interior and exterior residential applications",
          ],
        },
        {
          title: "Pool tiling",
          description:
            "Swimming pool tiling and pool-area tile work for selected residential projects, including mosaic and feature tile finishes.",
          bullets: [
            "Pool waterline and interior tile work",
            "Outdoor wet-area detailing",
            "Quoted based on condition, access and tile scope",
          ],
        },
        {
          title: "Repairs and tile replacement",
          description:
            "Targeted repair work for loose tiles, cracked grout, failed silicone or smaller areas that do not need a full rebuild.",
          bullets: [
            "Tile replacement and patch repair",
            "Maintenance and refresh jobs",
            "Practical option before a full renovation",
          ],
        },
      ],
    },
    projects: {
      eyebrow: "Recent project highlights",
      title: "Selected Canberra residential work from the current photo library.",
      description:
        "The examples below show the range of work immediately: bathrooms, floors, splashbacks, stone cladding and pool tiles.",
      notice:
        "Selected highlights from Canberra residential work, chosen to show bathrooms, floors, splashbacks, stone cladding and pool tiling in one place.",
      items: [
        {
          suburb: "Belconnen",
          title: "Bathroom tiling and waterproofing upgrade",
          summary:
            "Marble-look bathroom fit-out with shower screen, wall tiling, floor tiling and wet-area coordination for a cleaner, brighter finish.",
          result:
            "A strong example for homeowners searching bathroom tiling Canberra, shower tiling Canberra and bathroom waterproofing Canberra.",
          highlights: [
            "Bathroom waterproofing coordination",
            "Wall and floor tile layout",
            "Silicone finishing to wet-area junctions",
          ],
        },
        {
          suburb: "Gungahlin",
          title: "Open-plan floor tiling refresh",
          summary:
            "Open-plan living area finished with large-format floor tiles for a clean, low-maintenance surface across the main traffic zones of the home.",
          result:
            "Useful for floor tiling Canberra searches because it shows real residential scale, alignment and edge detail rather than only close-up tile shots.",
          highlights: [
            "Large-format floor tiles",
            "Open-plan residential layout",
            "Neat thresholds and consistent grout lines",
          ],
        },
        {
          suburb: "Inner South",
          title: "Kitchen splashback and silicone finish",
          summary:
            "Kitchen splashback using small-format wall tiles with clean bench lines, corner finishing and a tidy silicone seal at key junctions.",
          result:
            "Shows that smaller residential jobs are welcome and makes splashback tiling Canberra searches easier to convert.",
          highlights: [
            "Kitchen splashback tiling",
            "Bench-edge silicone finish",
            "Ideal for partial kitchen upgrades",
          ],
        },
        {
          suburb: "Woden Valley",
          title: "Stone cladding for feature wall and column",
          summary:
            "Stacked-stone installation used to create a stronger focal point on a residential wall and column surface.",
          result:
            "Broadens the site beyond standard wet areas and supports stone cladding Canberra, feature wall tiler and pillar cladding searches.",
          highlights: [
            "Stone cladding alignment",
            "Feature wall and column detailing",
            "Residential statement finish",
          ],
        },
        {
          suburb: "Tuggeranong",
          title: "Residential swimming pool tiling refresh",
          summary:
            "Swimming pool tiling example with mosaic-style finishes suited to pool interiors or waterline detailing in residential outdoor areas.",
          result:
            "Helps qualify pool tiling enquiries early by showing that the business can handle more specialised tile environments as well as interiors.",
          highlights: [
            "Swimming pool tile finish",
            "Wet-area exterior detailing",
            "Quoted based on condition and scope",
          ],
        },
      ],
    },
    process: {
      eyebrow: "How the work moves",
      title: "Simple quote, clear scope, clean handover.",
      description:
        "Homeowners do not want to guess what happens next. The page explains the path from first contact to waterproofing, tiling, silicone finishing and final handover.",
      spotlightTitle: "Real installation photo",
      spotlightDescription:
        "The in-progress image adds credibility by showing the work mid-installation, not only polished final shots. It supports the story around preparation, tile layout, finishing and workmanship.",
      steps: [
        {
          title: "1. Send the enquiry",
          description:
            "Share the suburb, service type and a short explanation of the job through the form, phone or email.",
        },
        {
          title: "2. Review the scope",
          description:
            "The job is sorted into bathroom work, floor tiling, wall tiling, waterproofing, stone cladding, pool tiling or repairs.",
        },
        {
          title: "3. Quote and planning",
          description:
            "The quote can cover preparation, waterproofing, tiling, silicone finishing and any practical staging notes for the home.",
        },
        {
          title: "4. Surface preparation",
          description:
            "Before tiling starts, the surface condition, waterproofing needs and layout approach are confirmed.",
        },
        {
          title: "5. Installation and finishing",
          description:
            "Tiles are installed, grouted and finished with the same scope that was discussed during quoting.",
        },
        {
          title: "6. Handover and warranty",
          description:
            "The finished work is checked, care guidance is shared and workmanship warranty terms stay aligned with the quoted scope.",
        },
      ],
    },
    areas: {
      eyebrow: "Canberra service area",
      title: "Residential work across Canberra districts.",
      description:
        "The site is intentionally local. It speaks to homeowners in Canberra rather than trying to sound national or generic.",
      coverageNote:
        "Core coverage includes Belconnen, Gungahlin, Woden Valley, Tuggeranong, Inner North, Inner South, Molonglo Valley and Weston Creek. If the property is nearby, send the suburb and we can confirm.",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Questions homeowners ask before requesting a quote.",
      description:
        "The FAQ reduces hesitation and gives search engines and AI search systems clearer language around the business, the service area and the types of work offered.",
      items: [
        {
          question: "Do you handle both waterproofing and tiling for bathrooms?",
          answer:
            "Yes. Bathroom enquiries can cover waterproofing, wall tiling, floor tiling, silicone finishing and the practical sequencing needed for a residential wet area.",
        },
        {
          question: "Can I request only silicone, regrouting or a small repair?",
          answer:
            "Yes. Small repair work, failed silicone, cracked grout and targeted tile replacement can all be quoted without turning the job into a full renovation.",
        },
        {
          question: "Do you install stone cladding on feature walls or columns?",
          answer:
            "Yes. The site is set up to support residential stone cladding enquiries for feature walls, pillars, entry details and other statement surfaces.",
        },
        {
          question: "Do you take swimming pool tiling jobs?",
          answer:
            "Yes, for suitable residential projects. Pool tiling is quoted based on the existing condition, access, tile type and the scope of the pool area.",
        },
        {
          question: "Who supplies the tiles and materials?",
          answer:
            "That can be discussed during quoting. Some homeowners already have their tiles selected, while others want to confirm scope first and sort materials after the quote.",
        },
        {
          question: "Are quotes free?",
          answer:
            "Yes. The site is built around free quote requests so homeowners can send the suburb, job type and project stage before work is booked in.",
        },
        {
          question: "Do you provide workmanship warranty?",
          answer:
            "Yes. Workmanship warranty is part of the public trust positioning on the site, with the final terms aligned to the quoted scope of work.",
        },
        {
          question: "Can I enquire in Chinese?",
          answer:
            "Yes. The site, contact form and follow-up flow support both English and Chinese enquiries for Canberra homeowners.",
        },
      ],
    },
    contact: {
      eyebrow: "Contact and quotes",
      title: "Tell us the suburb, the service and what you want done.",
      description:
        "The form is short on purpose. Send the job type, project stage and a practical summary so the follow-up can happen by phone or email without wasting time.",
      cards: [
        {
          title: "Call",
          body: siteConfig.phoneDisplay,
          href: siteConfig.phoneHref,
          action: "Call now",
        },
        {
          title: "Email",
          body: siteConfig.email,
          href: siteConfig.emailHref,
          action: "Send email",
        },
        {
          title: "Hours",
          body: "Mon-Fri 7:30am-5:30pm, Sat 8:30am-2:00pm",
        },
      ],
      form: {
        title: "Request a free quote",
        description:
          "Include the suburb, room type, approximate size, current issue and the finish you want. If you already have photos, mention that in the message and we can continue from there.",
        fields: {
          name: "Name",
          phone: "Phone",
          email: "Email",
          suburb: "Suburb",
          serviceType: "Service type",
          projectType: "Project type",
          preferredLanguage: "Preferred language",
          message: "Project details",
        },
        placeholders: {
          name: "Your full name",
          phone: "0435 248 809",
          email: "your@email.com",
          suburb: "Belconnen, Gungahlin, Inner South...",
          message:
            "Example: bathroom renovation in Belconnen, shower waterproofing plus wall and floor tiling, two bathrooms, want a quote this week.",
        },
        serviceOptions: [
          { value: serviceOptionValues[0], label: "Floor tiling" },
          { value: serviceOptionValues[1], label: "Wall tiling" },
          { value: serviceOptionValues[2], label: "Bathroom tiling" },
          { value: serviceOptionValues[3], label: "Splashback" },
          { value: serviceOptionValues[4], label: "Waterproofing" },
          { value: serviceOptionValues[5], label: "Silicone sealing" },
          { value: serviceOptionValues[6], label: "Stone cladding" },
          { value: serviceOptionValues[7], label: "Pool tiling" },
          { value: serviceOptionValues[8], label: "Repair / regrouting" },
        ],
        projectOptions: [
          { value: "renovation", label: "Renovation" },
          { value: "new-build", label: "New build" },
          { value: "repair", label: "Repair / maintenance" },
          { value: "quote-only", label: "Quote / site review first" },
        ],
        languageOptions: [
          { value: "en", label: "English" },
          { value: "zh", label: "中文" },
        ],
        submitLabel: "Send quote request",
        submittingLabel: "Sending...",
        successLabel: "Thanks. Your quote request has been sent.",
        errorFallback:
          "Something went wrong while sending your enquiry. Please call or email directly.",
      },
    },
    footer: {
      tagline:
        "Licensed residential tiling, waterproofing, silicone, stone cladding and pool tiling across Canberra.",
      rights: `© ${new Date().getFullYear()} ${siteConfig.legalName}. All rights reserved.`,
      home: "Home",
      privacy: "Privacy",
    },
    thanks: {
      title: "Thanks, your quote request is in.",
      description:
        "We have received your enquiry. The next step is a follow-up by phone or email after we review the suburb, service type and project notes.",
      nextSteps: [
        "Keep your phone available if the job is urgent or time-sensitive.",
        "If you have photos, plans or tile references, those may be requested after the first reply.",
        "You can return to the homepage to review services, project examples and Canberra coverage.",
      ],
      primaryCta: "Back to homepage",
      secondaryCta: "Call now",
    },
    privacy: {
      title: "Privacy",
      intro:
        "This privacy page explains what enquiry information is collected through the website and how it is used to respond to quote requests.",
      sections: [
        {
          title: "What we collect",
          body: [
            "The contact form collects name, phone, email, suburb, service type, project type, preferred language and the project details you choose to send.",
            "The system may also store the page path and submission timestamp so enquiries can be reviewed in context.",
          ],
        },
        {
          title: "Why we collect it",
          body: [
            "Enquiry information is used to review residential tiling, waterproofing and related quote requests, and to contact the customer by phone or email.",
            "The information is collected for practical quoting and follow-up purposes connected to the services shown on the site.",
          ],
        },
        {
          title: "Storage and access",
          body: [
            "Website enquiries are configured to be stored through Firebase-backed lead capture for business follow-up.",
            "Before the site goes live, confirm that the final privacy wording matches the real operating process and the legal company details.",
          ],
        },
      ],
    },
  },
  zh: {
    metadata: {
      title: `堪培拉贴砖与防水 | 浴室、地砖、墙砖、泳池砖 | ${siteConfig.brandName}`,
      description:
        "LITA 提供 Canberra 住宅贴砖与防水服务，涵盖浴室贴砖、防水、地砖、墙砖、挡水板、Silicone 收边、文化石背景墙 / 包柱、泳池瓷砖与补修，支持中文英文沟通，免费报价。",
      keywords: [
        "堪培拉贴砖",
        "堪培拉瓷砖",
        "堪培拉防水",
        "堪培拉浴室贴砖",
        "堪培拉地砖",
        "堪培拉墙砖",
        "堪培拉挡水板",
        "堪培拉文化石",
        "堪培拉泳池瓷砖",
        "堪培拉 silicone",
      ],
    },
    common: {
      skipToMain: "跳到主要内容",
      callNow: "立即电话",
      emailUs: "发邮件",
      requestQuote: "免费报价",
      bilingual: "支持英文 / 中文沟通",
      placeholderBanner:
        "上线前请确认正式域名、公司法定名称拼写和最终隐私文案。",
    },
    nav: {
      services: "服务",
      projects: "案例",
      process: "流程",
      areas: "服务区域",
      faq: "常见问题",
      contact: "联系",
      privacy: "隐私",
      backHome: "返回首页",
    },
    hero: {
      eyebrow: "持牌施工 | 22年以上经验 | 支持中文沟通",
      title: "Canberra 家庭贴砖、防水、Silicone 与文化石服务。",
      description:
        "如果您在 Canberra 做浴室翻新、铺地砖墙砖、做防水、挡水板、Silicone 收边、文化石背景墙或泳池砖，这个页面会先把能做什么、服务哪些区、怎么询价讲清楚。",
      badges: [
        "浴室贴砖与防水",
        "地砖 / 墙砖 / 挡水板",
        "Silicone、文化石、泳池砖",
      ],
      primaryCta: "免费报价",
      secondaryCta: "查看服务",
      stats: [
        { value: "22+ 年", label: "施工经验" },
        { value: "免费报价", label: "适合先沟通再安排" },
        { value: "Canberra 住宅", label: "主要服务对象" },
      ],
      panelTitle: "适合哪些项目",
      panelDescription:
        "无论是整间浴室翻新，还是局部补砖、补缝、Silicone 收边，或者文化石包柱、泳池砖，都可以直接发来需求。",
      panelPoints: [
        "浴室、洗衣房、厨房、客厅、楼梯和湿区项目",
        "挡水板、文化石背景墙、门口柱子包石和泳池砖",
        "中文或英文都可以沟通，先报价再安排",
      ],
    },
    trust: {
      eyebrow: "为什么这个页面适合上线",
      title: "先把业务说清楚，再让客户放心联系。",
      description:
        "页面不会写得很虚，而是直接把服务、案例、Canberra 区域、常见问题和联系方式摆出来，也更容易让搜索和 AI 系统理解你的业务。",
      items: [
        {
          title: "持牌施工",
          description:
            "首页和结构化数据都会明确体现持牌信息，先把最重要的信任点放出来。",
        },
        {
          title: "22年以上经验",
          description:
            "经验信息放在首屏就能看到，业主更容易判断这是不是成熟、稳定的本地施工团队。",
        },
        {
          title: "主要做住宅",
          description:
            "整站文案都围绕 Canberra 家庭业主，不会写成很泛的商业工程宣传页。",
        },
        {
          title: "免费报价",
          description:
            "表单和 CTA 都围绕免费报价来设计，用户更容易迈出第一步。",
        },
        {
          title: "工艺质保",
          description:
            "把 workmanship warranty 作为公开信任信息写清楚，但最终仍以报价范围为准。",
        },
      ],
    },
    services: {
      eyebrow: "核心服务",
      title: "围绕 Canberra 住宅客户高意图搜索来写。",
      description:
        "服务内容既覆盖常见的浴室、地砖、墙砖，也覆盖 Silicone、文化石和泳池砖这类更细分但转化意图很强的需求。",
      items: [
        {
          title: "地砖铺贴",
          description:
            "适合客厅、厨房、走道、洗衣房等住宅空间，重点是平整度、收边和后期耐用性。",
          bullets: [
            "大规格和常规地砖都可承接",
            "客厅、走道、厨房、洗衣房常见项目",
            "过渡位置和收边处理更整洁",
          ],
        },
        {
          title: "墙砖铺贴",
          description:
            "适合浴室、淋浴区、厨房和其他需要墙面完成度的区域，重点是切割、对缝和转角细节。",
          bullets: [
            "浴室和洗衣房墙砖",
            "厨房墙面与局部特色墙面",
            "龙头、壁龛、插座周边细节处理",
          ],
        },
        {
          title: "浴室贴砖与防水",
          description:
            "浴室翻新里最常见的一整套需求就是防水加贴砖，这部分会单独写清楚，方便客户一眼看明白。",
          bullets: [
            "湿区基层与防水配合",
            "浴室墙地砖、淋浴区和台盆区域",
            "适合住宅翻新项目的完整范围说明",
          ],
        },
        {
          title: "厨房挡水板",
          description:
            "不是只有整间浴室才值得报价，厨房挡水板这种小项目也可以单独做，而且很适合先通过图片沟通。",
          bullets: [
            "地铁砖、马赛克、特色砖挡水板",
            "台面与转角位置的 Silicone 收边",
            "适合厨房局部升级和翻新",
          ],
        },
        {
          title: "防水施工",
          description:
            "防水会单独作为一项核心服务写出来，方便承接浴室和湿区的高意图搜索。",
          bullets: [
            "浴室、洗衣房等湿区防水",
            "贴砖前的基层准备",
            "和贴砖流程一起报价更清楚",
          ],
        },
        {
          title: "Silicone 收边与补缝",
          description:
            "适合浴室、台盆边、玻璃隔断、挡水板、墙地交界等位置，需要的是整洁、耐用和细节到位。",
          bullets: [
            "淋浴房、台盆边、转角和玻璃隔断",
            "重新补缝、补胶和局部翻新",
            "适合和维修或局部升级一起报价",
          ],
        },
        {
          title: "文化石背景墙 / 包柱",
          description:
            "适合门口柱子、客厅背景墙、壁炉墙或其他需要石材表面效果的住宅区域。",
          bullets: [
            "文化石背景墙和壁炉墙",
            "门口柱子、立柱、外立面细节",
            "室内外住宅项目都可沟通",
          ],
        },
        {
          title: "泳池瓷砖",
          description:
            "如果是住宅泳池砖、水线砖或周边湿区砖面项目，也可以单独询价。",
          bullets: [
            "泳池内壁或水线位置砖面",
            "室外湿区和特殊环境细节",
            "需要结合现场状态和范围来报价",
          ],
        },
        {
          title: "维修 / 补砖",
          description:
            "如果只是松砖、裂缝、局部掉胶、补缝或小面积修补，也可以直接联系，不一定要整屋翻新。",
          bullets: [
            "局部补砖和更换",
            "裂缝、松动和失效收边处理",
            "适合先解决问题再决定是否大改",
          ],
        },
      ],
    },
    projects: {
      eyebrow: "案例展示",
      title: "从现有图库里整理出的 Canberra 住宅项目方向。",
      description:
        "首页案例区现在直接覆盖浴室、地砖、挡水板、文化石和泳池砖，让客户进来就能看到业务范围。",
      notice:
        "这里精选了几类最有代表性的住宅项目，方便客户一次看懂浴室、地砖、挡水板、文化石和泳池砖的业务范围。",
      items: [
        {
          suburb: "Belconnen",
          title: "浴室贴砖与防水翻新",
          summary:
            "这组浴室图展示了大理石纹墙砖、地砖、淋浴区和整体湿区完成度，适合承接浴室翻新类客户。",
          result:
            "对搜索“堪培拉浴室贴砖”“Canberra bathroom waterproofing”的用户来说，这类案例最容易建立信任。",
          highlights: ["浴室防水配合", "墙地砖整体协调", "湿区 Silicone 收边"],
        },
        {
          suburb: "Gungahlin",
          title: "大规格地砖铺贴",
          summary:
            "开放式住宅空间的大规格地砖更能体现平整度、对缝和整体完成度，也适合展示客厅和通道类项目。",
          result:
            "让用户一眼看到你不只是做小面积浴室，也能做整片地面更新。",
          highlights: ["大规格地砖", "开放空间铺贴", "门口与过渡位收边"],
        },
        {
          suburb: "Inner South",
          title: "厨房挡水板与细节收边",
          summary:
            "厨房挡水板虽然项目不大，但很能体现切割、对缝和台面收边的细节水平。",
          result:
            "这类案例会让只想做局部升级的客户更愿意直接留下联系方式。",
          highlights: ["厨房挡水板", "台面边 Silicone 收口", "适合局部翻新客户"],
        },
        {
          suburb: "Woden Valley",
          title: "文化石背景墙与包柱",
          summary:
            "这组文化石案例适合展示住宅背景墙、立柱或特色墙面的施工能力，和普通浴室贴砖区分开。",
          result:
            "能直接覆盖“堪培拉文化石”“石材包柱”这类更细分的搜索意图。",
          highlights: ["文化石对缝与排版", "背景墙与柱面细节", "住宅特色饰面项目"],
        },
        {
          suburb: "Tuggeranong",
          title: "泳池瓷砖翻新",
          summary:
            "泳池砖项目本身比较细分，但一旦客户有需求，通常意图很强，也更看重是否真的做过类似环境。",
          result:
            "把泳池砖写进首页，有助于提前筛选更精准的询盘，而不是等客户打电话再解释。",
          highlights: ["泳池砖或水线砖", "室外湿区细节", "按现场状态和范围报价"],
        },
      ],
    },
    process: {
      eyebrow: "报价与施工流程",
      title: "先把范围讲明白，再安排施工，客户心里更踏实。",
      description:
        "很多客户最担心的是不知道下一步怎么走。把询价、报价、防水、铺贴、收边和交付说清楚，转化会更顺畅。",
      spotlightTitle: "真实施工过程",
      spotlightDescription:
        "保留一张施工过程图很重要，因为它能证明你不是只会放成品图，也更适合解释找平、铺贴、收边和交付之间的关系。",
      steps: [
        {
          title: "1. 提交需求",
          description:
            "先发 suburb、服务类型和项目概况，电话、邮件或表单都可以。",
        },
        {
          title: "2. 判断范围",
          description:
            "先判断是浴室、地砖、墙砖、防水、文化石、泳池砖，还是局部维修。",
        },
        {
          title: "3. 报价与安排",
          description:
            "报价会把基层、防水、贴砖、Silicone 收边和施工安排尽量讲清楚。",
        },
        {
          title: "4. 基层准备",
          description:
            "正式铺贴前，会先确认基层状态、防水需求和整体铺贴方式。",
        },
        {
          title: "5. 铺贴与收尾",
          description:
            "按报价确认的范围完成铺贴、勾缝和 Silicone 收边，不让客户临时猜流程。",
        },
        {
          title: "6. 完工交付",
          description:
            "完工后会一起看最终效果，并把基本维护和工艺质保范围讲清楚。",
        },
      ],
    },
    areas: {
      eyebrow: "服务区域",
      title: "重点服务 Canberra 住宅客户。",
      description:
        "页面不会泛泛写全澳洲，而是直接围绕 Canberra 和真实服务区域来组织内容，这样对本地搜索更有效。",
      coverageNote:
        "当前重点覆盖 Belconnen、Gungahlin、Woden Valley、Tuggeranong、Inner North、Inner South、Molonglo Valley 和 Weston Creek。周边区域也可以先发 suburb 来确认。",
    },
    faq: {
      eyebrow: "常见问题",
      title: "客户在联系前最常问的几个问题。",
      description:
        "FAQ 既能减少犹豫，也能让搜索和 AI 系统更容易读懂你到底做哪些项目、服务哪些客户。",
      items: [
        {
          question: "浴室是贴砖和防水一起做吗？",
          answer:
            "可以。浴室项目通常会把防水、墙砖、地砖和 Silicone 收边一起考虑，这样客户不用分开找人解释范围。",
        },
        {
          question: "只做补砖、补缝或者 Silicone 可以吗？",
          answer:
            "可以。局部维修、小面积补砖、重新补胶、补缝都可以单独询价，不一定要做完整翻新。",
        },
        {
          question: "文化石背景墙或包柱也接吗？",
          answer:
            "接。住宅背景墙、门口柱子、壁炉墙或其他需要石材表面效果的位置，都可以按项目情况报价。",
        },
        {
          question: "泳池砖也可以做吗？",
          answer:
            "可以。泳池砖属于更细分的项目，会根据现场状态、面积、进场条件和砖面范围来评估报价。",
        },
        {
          question: "材料是你们出，还是业主自己买？",
          answer:
            "这可以在报价阶段沟通。有些客户已经选好砖，有些客户会先确认施工范围，再决定材料安排，最终以报价内容为准。",
        },
        {
          question: "报价免费吗？",
          answer:
            "免费。页面和表单就是按免费报价来设计的，方便客户先把 suburb、项目类型和需求发过来。",
        },
        {
          question: "有工艺质保吗？",
          answer:
            "有。工艺质保会作为公开信任信息写明，具体范围和条件以最终报价和施工范围为准。",
        },
        {
          question: "可以中文沟通吗？",
          answer:
            "可以。表单、页面和后续联系都支持中文，比较适合 Canberra 本地华人家庭客户。",
        },
      ],
    },
    contact: {
      eyebrow: "联系与报价",
      title: "把 suburb、服务类型和需求发来就行。",
      description:
        "表单不需要很长，只要把项目类型、所在区域和希望做的内容说清楚，后续就能更快跟进。",
      cards: [
        {
          title: "电话",
          body: siteConfig.phoneDisplay,
          href: siteConfig.phoneHref,
          action: "立即拨打",
        },
        {
          title: "邮箱",
          body: siteConfig.email,
          href: siteConfig.emailHref,
          action: "发送邮件",
        },
        {
          title: "时间",
          body: "周一到周五 7:30am-5:30pm，周六 8:30am-2:00pm",
        },
      ],
      form: {
        title: "免费报价",
        description:
          "建议写上 suburb、空间类型、面积大概、当前问题，以及希望做到什么效果。如果您已经拍了现场照片，也可以先在留言里说明。",
        fields: {
          name: "姓名",
          phone: "电话",
          email: "邮箱",
          suburb: "区域 / Suburb",
          serviceType: "服务类型",
          projectType: "项目类型",
          preferredLanguage: "偏好语言",
          message: "项目说明",
        },
        placeholders: {
          name: "怎么称呼您",
          phone: "0435 248 809",
          email: "your@email.com",
          suburb: "Belconnen、Gungahlin、Inner South...",
          message:
            "例如：Belconnen 浴室翻新，想做防水加墙地砖，2 个卫生间，希望这周先报价。",
        },
        serviceOptions: [
          { value: serviceOptionValues[0], label: "地砖" },
          { value: serviceOptionValues[1], label: "墙砖" },
          { value: serviceOptionValues[2], label: "浴室贴砖" },
          { value: serviceOptionValues[3], label: "挡水板 / Splashback" },
          { value: serviceOptionValues[4], label: "防水" },
          { value: serviceOptionValues[5], label: "Silicone 收边" },
          { value: serviceOptionValues[6], label: "文化石 / 包柱" },
          { value: serviceOptionValues[7], label: "泳池瓷砖" },
          { value: serviceOptionValues[8], label: "维修 / 补砖 / 补缝" },
        ],
        projectOptions: [
          { value: "renovation", label: "翻新" },
          { value: "new-build", label: "新建" },
          { value: "repair", label: "维修 / 维护" },
          { value: "quote-only", label: "先报价 / 先沟通" },
        ],
        languageOptions: [
          { value: "zh", label: "中文" },
          { value: "en", label: "English" },
        ],
        submitLabel: "发送询价",
        submittingLabel: "发送中...",
        successLabel: "已提交成功，我们会尽快联系您。",
        errorFallback: "提交失败，请直接电话或邮件联系。",
      },
    },
    footer: {
      tagline:
        "面向 Canberra 家庭业主的贴砖、防水、Silicone、文化石和泳池砖服务。",
      rights: `© ${new Date().getFullYear()} ${siteConfig.legalName}。保留所有权利。`,
      home: "首页",
      privacy: "隐私",
    },
    thanks: {
      title: "已收到您的询价。",
      description:
        "我们已经收到您的需求，接下来会根据 suburb、服务类型和项目说明，通过电话或邮箱与您联系。",
      nextSteps: [
        "如果项目比较急，建议保持电话畅通。",
        "如果后续需要，我们可能会请您补充现场照片、图纸或砖面参考。",
        "您也可以返回首页继续查看服务内容、案例和服务区域。",
      ],
      primaryCta: "返回首页",
      secondaryCta: "立即电话",
    },
    privacy: {
      title: "隐私说明",
      intro:
        "本页说明网站会收集哪些询价信息，以及这些信息如何用于联系、报价和后续跟进。",
      sections: [
        {
          title: "收集哪些信息",
          body: [
            "联系表单会收集姓名、电话、邮箱、suburb、服务类型、项目类型、偏好语言和项目说明。",
            "系统还可能记录来源页面和提交时间，方便后续查看询价背景。",
          ],
        },
        {
          title: "为什么收集",
          body: [
            "这些信息主要用于评估住宅贴砖、防水及相关项目，方便通过电话或邮箱与客户联系并安排报价。",
            "收集的信息会围绕网站上展示的服务范围来使用，不会无故扩展成无关用途。",
          ],
        },
        {
          title: "存储与查看",
          body: [
            "网站询价目前配置为通过 Firebase 进行线索存储，方便后续业务跟进。",
            "正式上线前，请再次确认隐私文案、正式域名和公司法定名称与实际经营信息一致。",
          ],
        },
      ],
    },
  },
};

export function getContent(locale: Locale) {
  return contentByLocale[locale];
}
