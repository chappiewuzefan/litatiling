export const AREA_TYPES = [
  "bathroom",
  "kitchen_splashback",
  "laundry",
  "living_dining",
  "entry_hallway",
  "outdoor",
  "pool",
  "stairs",
  "feature_wall",
  "other",
] as const;

export type AreaType = (typeof AREA_TYPES)[number];

export const areaLabels: Record<AreaType, { en: string; zh: string }> = {
  bathroom: { en: "Bathroom / Ensuite / Shower", zh: "浴室 / 套房浴室 / 淋浴区" },
  kitchen_splashback: { en: "Kitchen splashback", zh: "厨房防溅板" },
  laundry: { en: "Laundry", zh: "洗衣房" },
  living_dining: { en: "Living / Dining floor", zh: "客厅 / 餐厅地砖" },
  entry_hallway: { en: "Entry / Hallway", zh: "入口 / 走廊" },
  outdoor: { en: "Outdoor balcony / Patio", zh: "室外阳台 / 露台" },
  pool: { en: "Pool area", zh: "泳池区域" },
  stairs: { en: "Stairs", zh: "楼梯" },
  feature_wall: { en: "Feature wall / Fireplace", zh: "特色墙 / 壁炉" },
  other: { en: "Other area", zh: "其他区域" },
};

export type SupplyParty = "owner" | "tiler" | "not_sure" | "";

export type AreaAnswers = {
  id: string;
  type: AreaType;
  customName: string;
  surfaces: string[];
  dimensions: string;
  squareMetres: string;
  existingSurface: string;
  existingDamage: string[];
  demolitionRequired: string;
  demolitionScope: string;
  rubbishResponsibility: string;
  buildingEra: string;
  asbestosStatus: string;
  tileOverCondition: string;
  tileOverHeightAccepted: string;
  timberUnderlay: string;
  timberRigidity: string;
  screeding: string;
  fallsRequired: string;
  adjacentFloor: string;
  flushFinish: string;
  doorClearance: string;
  waterproofing: string;
  existingWaterproofing: string;
  certificateRequired: string;
  floorWaste: string;
  drainWork: string;
  tileSelected: string;
  tileMaterial: string;
  tileSize: string;
  tileThickness: string;
  tileQuantity: string;
  wastageAllowance: string;
  layout: string;
  patternMatching: string;
  externalCorners: string;
  cornerFinish: string;
  grout: string;
  groutColour: string;
  extras: string[];
  underfloorHeating: string;
  removals: string[];
  tradesArranged: string;
  notes: string;
};

export type QuestionnaireAnswers = {
  customer: {
    name: string;
    phone: string;
    email: string;
    role: string;
    roleOther: string;
  };
  project: {
    address: string;
    propertyType: string;
    propertyTypeOther: string;
    projectType: string;
    stage: string;
    preferredStartDate: string;
    startFlexible: string;
    occupied: string;
    floorLevel: string;
    liftAccess: string;
    parking: string;
    accessNotes: string;
    waterPower: string;
    workHours: string;
  };
  areas: AreaAnswers[];
  supplies: Record<"tiles" | "adhesive" | "waterproofing" | "grout" | "drains" | "trims", SupplyParty>;
  additionalNotes: string;
  accuracyConfirmed: boolean;
  privacyAccepted: boolean;
  company: string;
};

export function createArea(type: AreaType, id = crypto.randomUUID()): AreaAnswers {
  return {
    id, type, customName: "", surfaces: [], dimensions: "", squareMetres: "",
    existingSurface: "", existingDamage: [], demolitionRequired: "", demolitionScope: "",
    rubbishResponsibility: "", buildingEra: "", asbestosStatus: "", tileOverCondition: "",
    tileOverHeightAccepted: "", timberUnderlay: "", timberRigidity: "", screeding: "",
    fallsRequired: "", adjacentFloor: "", flushFinish: "", doorClearance: "",
    waterproofing: "", existingWaterproofing: "", certificateRequired: "", floorWaste: "",
    drainWork: "", tileSelected: "", tileMaterial: "", tileSize: "", tileThickness: "",
    tileQuantity: "", wastageAllowance: "", layout: "", patternMatching: "",
    externalCorners: "", cornerFinish: "", grout: "", groutColour: "", extras: [],
    underfloorHeating: "", removals: [], tradesArranged: "", notes: "",
  };
}

export function createInitialAnswers(): QuestionnaireAnswers {
  return {
    customer: { name: "", phone: "", email: "", role: "", roleOther: "" },
    project: {
      address: "", propertyType: "", propertyTypeOther: "", projectType: "", stage: "",
      preferredStartDate: "", startFlexible: "", occupied: "", floorLevel: "", liftAccess: "",
      parking: "", accessNotes: "", waterPower: "", workHours: "",
    },
    areas: [],
    supplies: { tiles: "", adhesive: "", waterproofing: "", grout: "", drains: "", trims: "" },
    additionalNotes: "", accuracyConfirmed: false, privacyAccepted: false, company: "",
  };
}

const wetAreas = new Set<AreaType>(["bathroom", "laundry", "outdoor", "pool"]);

export function getAreaVisibility(area: AreaAnswers) {
  const hasFloor = area.surfaces.includes("floor");
  const hasWalls = area.surfaces.includes("wall");
  const demolition = area.demolitionRequired === "yes" || area.existingSurface === "tiles_remove";
  const tileOver = area.existingSurface === "tile_over";
  const timber = area.existingSurface === "timber";
  const tileSelected = area.tileSelected === "yes";
  const hasAdjacentFloor = area.adjacentFloor === "yes";
  const hasExternalCorners = area.externalCorners === "yes";
  return {
    hasFloor,
    hasWalls,
    demolition,
    tileOver,
    timber,
    tileSelected,
    hasAdjacentFloor,
    hasExternalCorners,
    wetArea: wetAreas.has(area.type),
    showScreeding: hasFloor && (!tileOver || area.tileOverCondition !== "sound_level"),
  };
}

export function clearHiddenAreaAnswers(area: AreaAnswers): AreaAnswers {
  const next = { ...area };
  const v = getAreaVisibility(next);
  if (!v.hasFloor) {
    next.screeding = ""; next.fallsRequired = ""; next.adjacentFloor = "";
    next.flushFinish = ""; next.doorClearance = ""; next.floorWaste = "";
    next.drainWork = ""; next.underfloorHeating = "";
  }
  if (!v.wetArea) {
    next.waterproofing = ""; next.existingWaterproofing = ""; next.certificateRequired = "";
    next.floorWaste = ""; next.drainWork = "";
  }
  if (!v.demolition) {
    next.demolitionScope = ""; next.rubbishResponsibility = ""; next.asbestosStatus = "";
  }
  if (!v.tileOver) {
    next.tileOverCondition = ""; next.tileOverHeightAccepted = "";
  }
  if (!v.timber) {
    next.timberUnderlay = ""; next.timberRigidity = "";
  }
  if (!v.showScreeding) next.screeding = "";
  if (!v.hasAdjacentFloor) next.flushFinish = "";
  if (!v.hasExternalCorners) next.cornerFinish = "";
  if (!v.tileSelected) {
    next.tileMaterial = ""; next.tileSize = ""; next.tileThickness = "";
    next.tileQuantity = ""; next.wastageAllowance = ""; next.layout = "";
    next.patternMatching = "";
  }
  return next;
}

export function validateQuestionnaire(answers: QuestionnaireAnswers) {
  const errors: string[] = [];
  if (!answers.customer.name.trim()) errors.push("Customer name is required.");
  if (!answers.customer.phone.trim()) errors.push("Mobile number is required.");
  if (answers.customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.customer.email)) errors.push("Enter a valid email address or leave it blank.");
  if (!answers.project.address.trim()) errors.push("Project address is required.");
  if (!answers.customer.role) errors.push("Customer role is required.");
  if (!answers.project.propertyType || !answers.project.projectType || !answers.project.stage) {
    errors.push("Please complete the project overview.");
  }
  if (answers.areas.length === 0) errors.push("Select at least one area.");
  answers.areas.forEach((area) => {
    if (area.surfaces.length === 0 || !area.existingSurface || !area.tileSelected) {
      errors.push(`Complete the key questions for ${areaLabels[area.type].en}.`);
    }
  });
  if (Object.values(answers.supplies).some((value) => !value)) {
    errors.push("Please confirm who supplies each material.");
  }
  if (!answers.accuracyConfirmed || !answers.privacyAccepted) {
    errors.push("Please confirm accuracy and accept the privacy notice.");
  }
  return errors;
}

export const optionSets = {
  yesNoUnsure: [["yes", "Yes", "是"], ["no", "No", "否"], ["not_sure", "Not sure / Site inspection required", "不确定 / 需现场确认"]],
  surfaces: [["floor", "Floor", "地面"], ["wall", "Wall", "墙面"]],
  existingSurface: [
    ["bare_concrete", "Bare concrete", "水泥毛坯"], ["sheeted_wall", "Sheeted wall", "板材墙面"],
    ["tiles_remove", "Existing tiles to remove", "需拆除旧瓷砖"], ["tile_over", "Tile over existing tiles", "在旧砖上直接铺贴"],
    ["timber", "Timber floor", "木结构地面"], ["painted_rendered", "Painted / rendered wall", "油漆 / 抹灰墙面"],
    ["other", "Other", "其他"], ["not_sure", "Not sure", "不确定"],
  ],
} as const;
