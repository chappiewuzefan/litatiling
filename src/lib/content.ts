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
  securityCheckLabel: string;
  securityCheckRequired: string;
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
        "",
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
      title: "Canberra tiling, waterproofing and finishing for bathrooms, floors and walls.",
      description:
        "Tiling, waterproofing, splashbacks, silicone finishing, stone cladding, pool tiling and repairs for Canberra homes. Suitable for bathroom renovations, kitchens, living areas, wet areas and smaller repair jobs.",
      badges: [
        "Bathrooms, floors and walls",
        "Waterproofing, silicone and regrouting",
        "Stone cladding, splashbacks and pool tiling",
      ],
      primaryCta: "Request a free quote",
      secondaryCta: "See services",
      stats: [
        { value: "22+ years", label: "Experience" },
        { value: "Licensed", label: "Residential trade" },
        { value: "Free quotes", label: "Canberra projects" },
      ],
      panelTitle: "Projects we handle",
      panelDescription:
        "From bathroom renovations to splashbacks, stone feature walls, pool areas and repair jobs, send through the suburb and a few details to get started.",
      panelPoints: [
        "Bathrooms, laundries, floors, walls, splashbacks and wet areas",
        "Silicone sealing, regrouting, stone cladding and pool tiling",
        "Residential Canberra work with workmanship warranty",
      ],
    },
    trust: {
      eyebrow: "Why homeowners choose LITA",
      title: "Clear communication, practical quoting and careful workmanship.",
      description:
        "Most homeowners want to know three things first: do you handle this type of job, do you service my suburb, and can I get a clear quote without wasting time? Those answers should be clear from the start.",
      items: [
        {
          title: "Licensed trade",
          description:
            "Licensed residential tiling and waterproofing experience gives homeowners more confidence when comparing local trades.",
        },
        {
          title: "22+ years",
          description:
            "Over 22 years of experience means the work is approached with a practical understanding of preparation, layout, finishing and handover.",
        },
        {
          title: "Residential focus",
          description:
            "The work is focused on Canberra homes, including bathrooms, kitchens, floors, feature walls, pool areas and smaller repair jobs.",
        },
        {
          title: "Free quotes",
          description:
            "Quotes can start with a quick message, a few job details and the suburb, so it is easier to understand scope before scheduling.",
        },
        {
          title: "Workmanship warranty",
          description:
            "Workmanship warranty is available, with final terms aligned to the quoted scope of work.",
        },
      ],
    },
    services: {
      eyebrow: "Core services",
      title: "Tiling, waterproofing and finishing across Canberra homes.",
      description:
        "Services include bathroom work, floor and wall tiling, splashbacks, silicone finishing, stone cladding, pool tiling and smaller repair jobs.",
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
      title: "Examples of recent Canberra work.",
      description:
        "A quick look at the kinds of residential jobs handled across Canberra.",
      notice:
        "A few recent projects to show the finish, scope and type of work handled.",
      items: [
        {
          suburb: "Belconnen",
          title: "Main bathroom renovation and waterproofing",
          summary:
            "Marble-look bathroom fit-out with shower screen, wall tiling, floor tiling and wet-area coordination for a cleaner, brighter result.",
          result:
            "A cleaner bathroom finish with coordinated waterproofing, wall tiling and floor tiling.",
          highlights: [
            "Bathroom waterproofing coordination",
            "Wall and floor tile layout",
            "Silicone finishing to wet-area junctions",
          ],
        },
        {
          suburb: "Gungahlin",
          title: "Open-plan living area floor update",
          summary:
            "Open-plan living area finished with large-format floor tiles for a clean, low-maintenance surface through the main traffic areas of the home.",
          result:
            "Shows a large-format floor finish with neat thresholds and consistent grout lines.",
          highlights: [
            "Large-format floor tiles",
            "Open-plan residential layout",
            "Neat thresholds and consistent grout lines",
          ],
        },
        {
          suburb: "Inner South",
          title: "Kitchen splashback and bench-edge finish",
          summary:
            "Kitchen splashback using small-format wall tiles with clean bench lines, tidy cuts and silicone finishing at key junctions.",
          result:
            "A smaller kitchen update where neat cuts, alignment and finishing make the difference.",
          highlights: [
            "Kitchen splashback tiling",
            "Bench-edge silicone finish",
            "Ideal for partial kitchen upgrades",
          ],
        },
        {
          suburb: "Woden Valley",
          title: "Stone feature wall and column finish",
          summary:
            "Stacked-stone installation used to create a stronger focal point across a residential wall and column surface.",
          result:
            "Shows detailed stone cladding work for a feature wall and column finish.",
          highlights: [
            "Stone cladding alignment",
            "Feature wall and column detailing",
            "Residential statement finish",
          ],
        },
        {
          suburb: "Tuggeranong",
          title: "Swimming pool tiling refresh",
          summary:
            "Swimming pool tiling example with mosaic-style finishes suited to pool interiors or waterline detailing in outdoor residential areas.",
          result:
            "Shows pool-area tile work where finish and durability both matter.",
          highlights: [
            "Swimming pool tile finish",
            "Wet-area exterior detailing",
            "Quoted based on condition and scope",
          ],
        },
      ],
    },
    process: {
      eyebrow: "What to expect",
      title: "Clear steps from quote to handover.",
      description:
        "From the first message, the quote, preparation, installation and final handover are explained clearly so you know what comes next.",
      spotlightTitle: "Real installation photo",
      spotlightDescription:
        "This site photo shows the work mid-installation, including preparation, tile layout and finishing details.",
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
      title: "Residential work across Canberra.",
      description:
        "Work is focused on Canberra homes, with regular service across the main districts and nearby suburbs.",
      coverageNote:
        "Core coverage includes Belconnen, Gungahlin, Woden Valley, Tuggeranong, Inner North, Inner South, Molonglo Valley and Weston Creek. If the property is nearby, send the suburb and we can confirm.",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Questions homeowners ask before requesting a quote.",
      description:
        "A few common questions before sending through photos, measurements or a quote request.",
      items: [
        {
          question: "Do you handle both waterproofing and tiling for bathrooms?",
          answer:
            "Yes. Bathroom work can include waterproofing, wall tiling, floor tiling and silicone finishing as part of one clear scope.",
        },
        {
          question: "Can I request only silicone, regrouting or a small repair?",
          answer:
            "Yes. Small repair work, failed silicone, cracked grout and targeted tile replacement can all be quoted without turning the job into a full renovation.",
        },
        {
          question: "Do you install stone cladding on feature walls or columns?",
          answer:
            "Yes. Stone cladding can be quoted for feature walls, pillars, entry details and other residential statement surfaces.",
        },
        {
          question: "Do you take swimming pool tiling jobs?",
          answer:
            "Yes, for suitable residential projects. Pool tiling is quoted based on the existing condition, access, tile type and the scope of the pool area.",
        },
        {
          question: "Who supplies the tiles and materials?",
          answer:
            "That can be discussed during quoting. Some homeowners already have tiles selected, while others prefer to confirm scope first and organise materials after the quote.",
        },
        {
          question: "Are quotes free?",
          answer:
            "Yes. You can send the suburb, job type and project stage first, and the scope can be reviewed before work is booked in.",
        },
        {
          question: "Do you provide workmanship warranty?",
          answer:
            "Yes. Workmanship warranty is available, with the final terms aligned to the quoted scope of work.",
        },
        {
          question: "Can I enquire in Chinese?",
          answer:
            "Yes. We can communicate in both English and Chinese.",
        },
      ],
    },
    contact: {
      eyebrow: "Contact and quotes",
      title: "Tell us the suburb and what you would like done.",
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
          "Include the suburb, room type, approximate size, current issue and the finish you want. If you already have photos, mention that in the message.",
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
            "Example: Bathroom renovation in Belconnen. Shower waterproofing, wall and floor tiling, two bathrooms, hoping for a quote this week.",
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
        securityCheckLabel: "Complete the security check",
        securityCheckRequired:
          "Please complete the security check before sending your enquiry.",
        errorFallback:
          "Something went wrong while sending your enquiry. Please call or email directly.",
      },
    },
    footer: {
      tagline:
        "Licensed tiling, waterproofing, silicone finishing, stone cladding and pool tiling across Canberra.",
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
            "We may also record the page you submitted from and the time of submission so the enquiry can be reviewed in context.",
          ],
        },
        {
          title: "Why we collect it",
          body: [
            "Enquiry information is used to review residential tiling, waterproofing and related quote requests, and to contact the customer by phone or email.",
            "The information is collected for practical quoting and follow-up connected to the services shown on the site.",
          ],
        },
        {
          title: "Storage and access",
          body: [
            "Website enquiries are stored through the business enquiry system so they can be reviewed and followed up.",
            "Information is used for quote follow-up, job review and customer communication connected to the enquiry you submit.",
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
        "",
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
      title: "Canberra 住宅贴砖、防水和细节收边。",
      description:
        "适合浴室翻新、地砖墙砖、防水、挡水板、Silicone 收边、文化石背景墙、包柱和泳池砖等住宅项目。可以先看案例，再发来需求免费报价。",
      badges: [
        "浴室贴砖与防水",
        "地砖 / 墙砖 / 挡水板",
        "Silicone、文化石、泳池砖",
      ],
      primaryCta: "免费报价",
      secondaryCta: "查看服务",
      stats: [
        { value: "22+ 年", label: "施工经验" },
        { value: "免费报价", label: "先沟通再安排" },
        { value: "Canberra 住宅", label: "本地住宅项目" },
      ],
      panelTitle: "适合哪些项目",
      panelDescription:
        "无论是整间浴室翻新，还是局部补砖、补缝、Silicone 收边、文化石包柱或泳池砖，都可以直接发来需求。",
      panelPoints: [
        "浴室、洗衣房、厨房、客厅、楼梯和湿区项目",
        "挡水板、文化石背景墙、门口柱子包石和泳池砖",
        "中文或英文都可以沟通，先报价再安排",
      ],
    },
    trust: {
      eyebrow: "为什么客户会联系 LITA",
      title: "先把范围和报价讲清楚，沟通更省时间。",
      description:
        "很多业主最关心的就是做不做这类项目、在不在服务区、报价范围能不能先讲清楚。把这些信息先说清楚，会更容易判断是否适合联系。",
      items: [
        {
          title: "持牌施工",
          description:
            "持牌施工和住宅项目经验，会让业主在比较本地施工团队时更放心。",
        },
        {
          title: "22年以上经验",
          description:
            "22 年以上经验，意味着从基层准备、排版铺贴到收尾交付都更有把握。",
        },
        {
          title: "本地住宅项目",
          description:
            "主要面向 Canberra 家庭业主，常见项目包括浴室、厨房、地砖、特色墙面和泳池区域。",
        },
        {
          title: "免费报价",
          description:
            "先发 suburb、项目类型和需求概况，就可以更快判断范围和后续安排。",
        },
        {
          title: "工艺质保",
          description:
            "提供工艺质保，具体范围和条件以最终报价和施工范围为准。",
        },
      ],
    },
    services: {
      eyebrow: "核心服务",
      title: "Canberra 住宅贴砖、防水和细节收边。",
      description:
        "服务范围包括浴室、地砖、墙砖、防水、挡水板、Silicone 收边、文化石、泳池砖和局部维修等住宅项目。",
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
            "浴室、洗衣房等湿区防水可以单独做，也可以和贴砖一起安排，更方便整体报价。",
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
      title: "最近做过的住宅项目",
      description:
        "案例涵盖浴室、地砖、挡水板、文化石和泳池砖，方便先看常见项目的完成效果。",
      notice:
        "先看几类比较常见的住宅项目，方便判断是不是您要做的类型。",
      items: [
        {
          suburb: "Belconnen",
          title: "主浴室翻新与防水",
          summary:
            "这组浴室图展示了大理石纹墙砖、地砖、淋浴区和整体湿区的完成效果，适合参考浴室翻新项目。",
          result:
            "可以参考浴室翻新、防水和墙地砖整体搭配的完成效果。",
          highlights: ["浴室防水配合", "墙地砖整体协调", "湿区 Silicone 收边"],
        },
        {
          suburb: "Gungahlin",
          title: "客厅和通道大规格地砖",
          summary:
            "开放式住宅空间的大规格地砖更能体现平整度、对缝和整体完成度，也适合展示客厅和通道类项目。",
          result:
            "能看出不只是做浴室，也可以做整片地面更新。",
          highlights: ["大规格地砖", "开放空间铺贴", "门口与过渡位收边"],
        },
        {
          suburb: "Inner South",
          title: "厨房挡水板和台面收边",
          summary:
            "厨房挡水板虽然项目不大，但很能体现切割、对缝和台面收边的细节水平。",
          result:
            "也适合只想做局部升级的客户先参考完成效果。",
          highlights: ["厨房挡水板", "台面边 Silicone 收口", "适合局部翻新客户"],
        },
        {
          suburb: "Woden Valley",
          title: "文化石背景墙和门口柱子",
          summary:
            "这组文化石案例展示了住宅背景墙、立柱和特色墙面的施工效果，和普通贴砖项目区分得更清楚。",
          result:
            "适合参考住宅背景墙、立柱和特色墙面的石材表面效果。",
          highlights: ["文化石对缝与排版", "背景墙与柱面细节", "住宅特色饰面项目"],
        },
        {
          suburb: "Tuggeranong",
          title: "泳池瓷砖翻新",
          summary:
            "泳池砖项目本身比较细分，但客户通常更关心是否做过类似环境和完成效果。",
          result:
            "如果是泳池砖或水线砖项目，可以先参考类似环境下的施工方向。",
          highlights: ["泳池砖或水线砖", "室外湿区细节", "按现场状态和范围报价"],
        },
      ],
    },
    process: {
      eyebrow: "一般怎么安排",
      title: "从报价到完工，步骤都说清楚。",
      description:
        "从第一次联系开始，哪些内容会报价、哪些地方要先准备、什么时候进场施工，都会提前跟您说清楚。",
      spotlightTitle: "真实施工过程",
      spotlightDescription:
        "这张现场施工图能更直观看到基层、排砖和收边这些细节，不只是最后拍好的成品照。",
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
      title: "主要服务 Canberra 各区住宅项目。",
      description:
        "目前主要服务 Canberra 住宅项目，常做区域包括主城区和周边常见 suburb。",
      coverageNote:
        "当前重点覆盖 Belconnen、Gungahlin、Woden Valley、Tuggeranong、Inner North、Inner South、Molonglo Valley 和 Weston Creek。周边区域也可以先发 suburb 来确认。",
    },
    faq: {
      eyebrow: "常见问题",
      title: "客户在联系前最常问的几个问题。",
      description:
        "如果还没确定怎么报价、做不做小项目，或者材料怎么安排，可以先看这里。",
      items: [
        {
          question: "浴室是贴砖和防水一起做吗？",
          answer:
            "可以。浴室项目通常会把防水、墙砖、地砖和 Silicone 收边一起安排，范围会在报价时讲清楚。",
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
            "这个可以在报价阶段沟通。有些客户已经选好砖，有些客户会先确认施工范围，再决定材料安排，最终以报价内容为准。",
        },
        {
          question: "报价免费吗？",
          answer:
            "免费。您可以先把 suburb、项目类型和需求发过来，再进一步沟通范围和安排。",
        },
        {
          question: "有工艺质保吗？",
          answer:
            "有。工艺质保会作为公开信任信息写明，具体范围和条件以最终报价和施工范围为准。",
        },
        {
          question: "可以中文沟通吗？",
          answer:
            "可以。中文和英文都可以沟通。",
        },
      ],
    },
    contact: {
      eyebrow: "联系与报价",
      title: "把 suburb、服务类型和需求发来就行。",
      description:
        "表单不用写太长，只要把项目类型、所在区域和希望做的内容说清楚，后续就能更快跟进。",
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
          "建议写上 suburb、空间类型、面积大概、当前问题，以及希望做到什么效果。如果已经拍了现场照片，也可以先在留言里说明。",
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
        securityCheckLabel: "请先完成人机验证",
        securityCheckRequired: "请先完成人机验证后再提交。",
        errorFallback: "提交失败，请直接电话或邮件联系。",
      },
    },
    footer: {
      tagline:
        "Canberra 住宅贴砖、防水、Silicone、文化石和泳池砖服务。",
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
            "系统还可能记录提交来源和提交时间，方便后续查看询价背景。",
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
            "网站询价会保存到询价记录中，方便后续业务跟进和客户联系。",
            "这些信息仅用于报价、项目沟通和与您提交的需求相关的后续服务。",
          ],
        },
      ],
    },
  },
};

export function getContent(locale: Locale) {
  return contentByLocale[locale];
}
