import { readFile } from "node:fs/promises";
import path from "node:path";

import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";

import { areaLabels, type QuestionnaireAnswers } from "@/lib/questionnaire";
import type { StoredAttachment } from "@/lib/questionnaire-server";

const humanize = (value: unknown): string => Array.isArray(value) ? value.map(humanize).join(", ") : String(value ?? "").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const zhLabels: Record<string, string> = {
  name: "姓名", phone: "手机", email: "邮箱", role: "客户身份", roleOther: "其他身份",
  address: "工程地址", propertyType: "物业类型", projectType: "项目类型", stage: "当前阶段",
  preferredStartDate: "期望开工日期", startFlexible: "日期是否灵活", occupied: "施工期间是否居住",
  floorLevel: "楼层", liftAccess: "电梯", parking: "停车卸料", accessNotes: "现场通道与限制",
  waterPower: "水电供应", workHours: "允许施工时间", surfaces: "施工表面", dimensions: "大约尺寸",
  squareMetres: "大约面积", existingSurface: "现有基层", existingDamage: "基层问题",
  demolitionRequired: "是否拆除", demolitionScope: "拆除范围", rubbishResponsibility: "垃圾清运责任",
  buildingEra: "建筑年代", asbestosStatus: "石棉情况", tileOverCondition: "旧砖情况",
  tileOverHeightAccepted: "完成面高度", timberUnderlay: "瓷砖基层板", timberRigidity: "木地板刚度",
  screeding: "拉地找平", fallsRequired: "排水坡度", adjacentFloor: "相邻地面", flushFinish: "区域走平",
  doorClearance: "门槛高度", waterproofing: "防水", existingWaterproofing: "现有防水",
  certificateRequired: "防水证书", floorWaste: "地漏", drainWork: "排水施工", tileSelected: "瓷砖已选定",
  tileMaterial: "瓷砖材质", tileSize: "瓷砖尺寸", tileThickness: "瓷砖厚度", tileQuantity: "购买数量",
  wastageAllowance: "损耗预留", layout: "铺贴方式", patternMatching: "花纹对缝", externalCorners: "外露阳角",
  cornerFinish: "阳角处理", grout: "填缝剂", groutColour: "填缝颜色", extras: "其他施工细节",
  underfloorHeating: "地暖", removals: "拆装物品", tradesArranged: "其他工种安排", notes: "区域备注",
  tiles: "主砖", adhesive: "胶水水泥", drains: "地漏", trims: "压条阳角条",
};

export async function generateQuestionnairePdf(answers: QuestionnaireAnswers, attachments: StoredAttachment[], submissionId: string, submittedAt: string) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const fontBytes = await readFile(path.join(process.cwd(), "src/assets/fonts/NotoSansCJKsc-Regular.otf"));
  const font = await pdf.embedFont(fontBytes, { subset: true });
  const pageSize: [number, number] = [595.28, 841.89];
  const margin = 48;
  let page = pdf.addPage(pageSize);
  let y = page.getHeight() - margin;

  const addPage = () => { page = pdf.addPage(pageSize); y = page.getHeight() - margin; };
  const ensure = (height: number) => { if (y - height < margin) addPage(); };
  const line = (text: string, size = 9, color = rgb(0.16, 0.19, 0.23), indent = 0) => {
    const maxWidth = page.getWidth() - margin * 2 - indent;
    const characters = Array.from(text); const lines: string[] = []; let current = "";
    for (const character of characters) { const candidate = `${current}${character}`; if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) { lines.push(current.trimEnd()); current = character.trimStart(); } else current = candidate; }
    if (current) lines.push(current);
    ensure(lines.length * (size + 4));
    lines.forEach((entry) => { page.drawText(entry, { x: margin + indent, y, size, font, color }); y -= size + 4; });
  };
  const heading = (en: string, zh: string) => { ensure(42); y -= 8; page.drawText(en, { x: margin, y, size: 16, font, color: rgb(0.08, 0.12, 0.18) }); y -= 20; line(zh, 9, rgb(0.45, 0.38, 0.18)); y -= 5; };
  const row = (label: string, value: unknown, zh = "") => { const text = humanize(value); if (!text) return; line(`${label}${zh ? ` / ${zh}` : ""}: ${text}`, 9); y -= 2; };

  page.drawText("LITA TILING CANBERRA", { x: margin, y, size: 10, font, color: rgb(0.55, 0.39, 0.08) }); y -= 30;
  page.drawText("Tiling Project Questionnaire", { x: margin, y, size: 24, font, color: rgb(0.05, 0.08, 0.12) }); y -= 30;
  line("澳洲瓷砖工程需求确认表", 13, rgb(0.35, 0.38, 0.42)); y -= 12;
  row("Submission ID", submissionId, "提交编号"); row("Submitted", submittedAt, "提交时间");
  heading("Customer and project", "客户与项目");
  Object.entries(answers.customer).forEach(([key, value]) => row(humanize(key), value, zhLabels[key]));
  Object.entries(answers.project).forEach(([key, value]) => row(humanize(key), value, zhLabels[key]));
  answers.areas.forEach((area, index) => {
    heading(`Area ${index + 1}: ${area.customName || areaLabels[area.type].en}`, areaLabels[area.type].zh);
    Object.entries(area).filter(([key]) => !["id", "type", "customName"].includes(key)).forEach(([key, value]) => row(humanize(key), value, zhLabels[key]));
  });
  heading("Materials supply", "材料采购分工");
  Object.entries(answers.supplies).forEach(([key, value]) => row(humanize(key), value, zhLabels[key]));
  if (answers.additionalNotes) { heading("Additional notes", "其他说明"); line(answers.additionalNotes, 9); }
  heading("Attachments", "附件清单");
  if (!attachments.length) line("No attachments / 无附件", 9); else attachments.forEach((item, index) => row(`${index + 1}. ${item.originalName}`, `${(item.size / 1024 / 1024).toFixed(2)} MB`));
  y -= 15; line("This summary records information supplied by the customer. It is not a final quote, contract, compliance assessment or confirmed start date.", 8, rgb(0.38, 0.41, 0.45));
  line("本摘要记录客户提交的信息，不构成最终报价、合同、合规评估或确定的开工日期。", 8, rgb(0.38, 0.41, 0.45));
  const pages = pdf.getPages();
  pages.forEach((pdfPage, index) => pdfPage.drawText(`${index + 1} / ${pages.length}`, { x: pdfPage.getWidth() - margin - 30, y: 24, size: 8, font, color: rgb(0.5, 0.52, 0.55) }));
  return Buffer.from(await pdf.save());
}
