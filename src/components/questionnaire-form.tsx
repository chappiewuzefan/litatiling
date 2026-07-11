"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { TurnstileWidget } from "@/components/turnstile-widget";
import {
  AREA_TYPES,
  areaLabels,
  clearHiddenAreaAnswers,
  createArea,
  createInitialAnswers,
  getAreaVisibility,
  optionSets,
  validateQuestionnaire,
  type AreaAnswers,
  type AreaType,
  type QuestionnaireAnswers,
  type SupplyParty,
} from "@/lib/questionnaire";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"];
const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

type Option = readonly [string, string, string];

function Bilingual({ en, zh, className = "" }: { en: string; zh: string; className?: string }) {
  return <span className={className}><span className="block">{en}</span><span className="mt-0.5 block text-[0.82em] font-normal text-slate-500">{zh}</span></span>;
}

function FieldLabel({ en, zh, required = false }: { en: string; zh: string; required?: boolean }) {
  return <span className="mb-2 block text-sm font-semibold text-slate-900"><span>{en}{required ? <span className="ml-1 text-amber-700">*</span> : null}</span><span className="mt-0.5 block text-xs font-normal text-slate-500">{zh}</span></span>;
}

const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15";

function ChoiceGroup({ value, options, onChange, multiple = false, name }: { value: string | string[]; options: readonly Option[]; onChange: (value: string | string[]) => void; multiple?: boolean; name: string }) {
  const values = Array.isArray(value) ? value : [value];
  return <div className="grid gap-2 sm:grid-cols-2">{options.map(([id, en, zh]) => {
    const checked = values.includes(id);
    return <label key={id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${checked ? "border-amber-600 bg-amber-50/70 shadow-[inset_3px_0_0_#a16207]" : "border-slate-200 bg-white hover:border-slate-400"}`}>
      <input type={multiple ? "checkbox" : "radio"} name={name} value={id} checked={checked} onChange={() => {
        if (!multiple) return onChange(id);
        const exclusive = id === "none" || id === "not_sure";
        const next = checked ? values.filter((item) => item !== id) : exclusive ? [id] : [...values.filter((item) => item !== "none" && item !== "not_sure"), id];
        onChange(next);
      }} className="mt-1 h-4 w-4 accent-amber-700" />
      <Bilingual en={en} zh={zh} className="text-sm font-medium leading-5 text-slate-800" />
    </label>;
  })}</div>;
}

function TextField({ en, zh, value, onChange, required, type = "text", placeholder }: { en: string; zh: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; placeholder?: string }) {
  return <label><FieldLabel en={en} zh={zh} required={required} /><input className={inputClass} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} /></label>;
}

function SelectField({ en, zh, value, onChange, options, required }: { en: string; zh: string; value: string; onChange: (value: string) => void; options: readonly Option[]; required?: boolean }) {
  return <label><FieldLabel en={en} zh={zh} required={required} /><select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}><option value="">Select / 请选择</option>{options.map(([id, enText, zhText]) => <option key={id} value={id}>{enText} / {zhText}</option>)}</select></label>;
}

function Section({ number, title, zh, children }: { number: string; title: string; zh: string; children: React.ReactNode }) {
  return <section className="border-t border-slate-300 py-10 first:border-t-0 first:pt-0"><div className="mb-7 flex items-start gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">{number}</span><div><h2 className="font-heading text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h2><p className="mt-1 text-sm text-slate-500">{zh}</p></div></div>{children}</section>;
}

const yesNoUnsure = optionSets.yesNoUnsure;
const damageOptions: Option[] = [["cracks", "Cracks", "裂缝"], ["loose_tiles", "Loose / hollow tiles", "松动 / 空鼓"], ["moisture", "Moisture", "潮湿"], ["movement", "Movement", "结构位移"], ["uneven", "Uneven surface", "表面不平"], ["none", "None known", "未发现"], ["not_sure", "Not sure", "不确定"]];
const extrasOptions: Option[] = [["silicone", "Silicone sealing", "打硅胶"], ["movement_joints", "Movement joints", "伸缩缝"], ["tile_skirting", "Tile skirting", "瓷砖踢脚线"], ["niches", "Niches", "壁龛"], ["shelves", "Shelves", "搁板"], ["steps", "Steps / risers", "台阶 / 立面"], ["feature_borders", "Feature borders", "装饰边条"], ["none", "None", "无"], ["not_sure", "Not sure", "不确定"]];
const removalOptions: Option[] = [["fixtures", "Fixtures / tapware", "洁具 / 龙头"], ["shower_screen", "Shower screen", "淋浴屏"], ["vanity", "Vanity", "浴室柜"], ["appliances", "Appliances", "电器"], ["door_frames", "Doors / frames", "门 / 门框"], ["none", "None", "无"], ["not_sure", "Not sure", "不确定"]];

function AreaForm({ area, index, onChange }: { area: AreaAnswers; index: number; onChange: (area: AreaAnswers) => void }) {
  const v = getAreaVisibility(area);
  const set = <K extends keyof AreaAnswers>(key: K, value: AreaAnswers[K]) => onChange(clearHiddenAreaAnswers({ ...area, [key]: value }));
  return <details open className="group rounded-2xl border border-slate-300 bg-slate-50/70">
    <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-5"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">Area {index + 1}</p><h3 className="mt-1 font-heading text-xl font-semibold text-slate-950">{area.customName || areaLabels[area.type].en}</h3><p className="text-xs text-slate-500">{areaLabels[area.type].zh}</p></div><span className="text-xl text-slate-500 transition group-open:rotate-45">+</span></summary>
    <div className="space-y-8 border-t border-slate-200 bg-white px-5 py-6 sm:px-6">
      {area.type === "other" ? <TextField en="Area name" zh="区域名称" value={area.customName} onChange={(value) => set("customName", value)} required /> : null}
      <div><FieldLabel en="Surface to be tiled" zh="铺贴表面" required /><ChoiceGroup name={`${area.id}-surfaces`} value={area.surfaces} options={optionSets.surfaces} multiple onChange={(value) => set("surfaces", value as string[])} /></div>
      <div className="grid gap-5 sm:grid-cols-2"><TextField en="Approximate dimensions" zh="大约长宽尺寸" value={area.dimensions} onChange={(value) => set("dimensions", value)} placeholder="e.g. 3.2m x 2.4m" /><TextField en="Approximate area (m²)" zh="大约面积（平方米）" value={area.squareMetres} onChange={(value) => set("squareMetres", value)} placeholder="e.g. 18" /></div>
      <div><FieldLabel en="Existing surface" zh="现有基层 / 表面" required /><ChoiceGroup name={`${area.id}-surface`} value={area.existingSurface} options={optionSets.existingSurface} onChange={(value) => set("existingSurface", value as string)} /></div>
      <div><FieldLabel en="Known surface issues" zh="已知基层问题（可多选）" /><ChoiceGroup name={`${area.id}-damage`} value={area.existingDamage} options={damageOptions} multiple onChange={(value) => set("existingDamage", value as string[])} /></div>
      <div><FieldLabel en="Is demolition required?" zh="是否需要拆除？" /><ChoiceGroup name={`${area.id}-demo`} value={area.demolitionRequired} options={yesNoUnsure} onChange={(value) => set("demolitionRequired", value as string)} /></div>
      {v.demolition ? <div className="grid gap-5 sm:grid-cols-2"><TextField en="Demolition scope" zh="拆除范围" value={area.demolitionScope} onChange={(value) => set("demolitionScope", value)} /><SelectField en="Rubbish / skip bin" zh="垃圾清运 / 垃圾箱责任" value={area.rubbishResponsibility} onChange={(value) => set("rubbishResponsibility", value)} options={[["tiler", "Tiler to provide and dispose", "施工方提供并清运"], ["owner", "Owner to dispose", "客户自行处理"], ["not_sure", "Not sure", "不确定"]]} /></div> : null}
      <div className="grid gap-5 sm:grid-cols-2"><SelectField en="Approximate building age" zh="建筑大约年代" value={area.buildingEra} onChange={(value) => set("buildingEra", value)} options={[["pre_1990", "Before 1990", "1990 年以前"], ["1990_2003", "1990-2003", "1990-2003 年"], ["post_2003", "After 2003", "2003 年以后"], ["not_sure", "Not sure", "不确定"]]} />{v.demolition ? <SelectField en="Known asbestos status" zh="已知石棉情况" value={area.asbestosStatus} onChange={(value) => set("asbestosStatus", value)} options={[["cleared", "Tested / cleared", "已检测 / 排除"], ["present", "Known asbestos present", "已知存在石棉"], ["not_sure", "Not sure", "不确定"]]} /> : null}</div>
      {v.demolition && (area.buildingEra === "pre_1990" || area.buildingEra === "not_sure") && area.asbestosStatus !== "cleared" ? <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Professional asbestos assessment may be required.</strong><span className="mt-1 block text-xs">如施工可能扰动旧基层，开工前可能需要专业石棉检测。</span></div> : null}
      {v.tileOver ? <div className="grid gap-5 sm:grid-cols-2"><SelectField en="Condition of existing tiles" zh="旧砖牢固和平整情况" value={area.tileOverCondition} onChange={(value) => set("tileOverCondition", value)} options={[["sound_level", "Sound, bonded and level", "牢固、平整、无空鼓"], ["issues", "Loose, hollow or uneven", "松动、空鼓或不平"], ["not_sure", "Not sure", "不确定"]]} /><SelectField en="Finished height acceptable?" zh="增加后的完成面高度是否可接受？" value={area.tileOverHeightAccepted} onChange={(value) => set("tileOverHeightAccepted", value)} options={yesNoUnsure} /></div> : null}
      {v.timber ? <div className="grid gap-5 sm:grid-cols-2"><SelectField en="Tile underlay required" zh="是否需要瓷砖水泥板基层" value={area.timberUnderlay} onChange={(value) => set("timberUnderlay", value)} options={yesNoUnsure} /><SelectField en="Floor rigidity / reinforcement" zh="地面刚度 / 是否需加固" value={area.timberRigidity} onChange={(value) => set("timberRigidity", value)} options={[["rigid", "Rigid, no noticeable movement", "牢固，无明显晃动"], ["movement", "Movement / reinforcement may be needed", "有晃动 / 可能需加固"], ["not_sure", "Not sure", "不确定"]]} /></div> : null}
      {v.hasFloor ? <div className="space-y-6 rounded-xl bg-slate-50 p-4"><h4 className="font-semibold text-slate-950">Floor preparation <span className="ml-2 text-xs font-normal text-slate-500">地面准备</span></h4>{v.showScreeding ? <SelectField en="Screeding / levelling" zh="拉地 / 找平" value={area.screeding} onChange={(value) => set("screeding", value)} options={[["required", "Required", "需要"], ["direct_stick", "Direct stick / no screed expected", "预计可直接胶贴"], ["not_sure", "Not sure / inspection required", "不确定 / 需现场确认"]]} /> : null}<div className="grid gap-5 sm:grid-cols-2"><SelectField en="Falls required" zh="是否需要排水坡度" value={area.fallsRequired} onChange={(value) => set("fallsRequired", value)} options={yesNoUnsure} /><SelectField en="Adjacent floor / transition" zh="是否有相邻地面衔接" value={area.adjacentFloor} onChange={(value) => set("adjacentFloor", value)} options={yesNoUnsure} /></div>{v.hasAdjacentFloor ? <SelectField en="Flush finish required" zh="是否要求与相邻区域完全走平" value={area.flushFinish} onChange={(value) => set("flushFinish", value)} options={[["flush", "Yes, flush finish", "需要完全走平"], ["standard", "Standard transition is acceptable", "接受正常落差 / 压条"], ["not_sure", "Not sure", "不确定"]]} /> : null}<TextField en="Door / threshold clearance" zh="门和门槛高度情况" value={area.doorClearance} onChange={(value) => set("doorClearance", value)} /></div> : null}
      {v.wetArea ? <div className="space-y-5 rounded-xl bg-sky-50/70 p-4"><h4 className="font-semibold text-slate-950">Waterproofing and drainage <span className="ml-2 text-xs font-normal text-slate-500">防水与排水</span></h4><div className="grid gap-5 sm:grid-cols-2"><SelectField en="Waterproofing required" zh="是否需要施工方做防水" value={area.waterproofing} onChange={(value) => set("waterproofing", value)} options={yesNoUnsure} /><SelectField en="Existing waterproofing" zh="现有防水情况" value={area.existingWaterproofing} onChange={(value) => set("existingWaterproofing", value)} options={[["none", "None / new work", "无 / 新施工"], ["existing", "Existing waterproofing", "已有防水"], ["not_sure", "Not sure", "不确定"]]} /></div><SelectField en="Waterproofing certificate required" zh="是否需要防水证书" value={area.certificateRequired} onChange={(value) => set("certificateRequired", value)} options={yesNoUnsure} />{v.hasFloor ? <div className="grid gap-5 sm:grid-cols-2"><SelectField en="Floor waste type" zh="地漏款式" value={area.floorWaste} onChange={(value) => set("floorWaste", value)} options={[["square", "Standard square drain", "普通方形地漏"], ["linear", "Linear / slot drain", "长条 / 隐形地漏"], ["none", "No drain", "无地漏"], ["not_sure", "Not sure", "不确定"]]} /><SelectField en="Drain work" zh="排水位置 / 是否需新排水" value={area.drainWork} onChange={(value) => set("drainWork", value)} options={[["existing", "Use existing position", "使用现有位置"], ["move", "Move / new drainage required", "需要移位 / 新排水"], ["not_sure", "Not sure", "不确定"]]} /></div> : null}</div> : null}
      <div><FieldLabel en="Have tiles been selected?" zh="瓷砖是否已经选定？" required /><ChoiceGroup name={`${area.id}-tile-selected`} value={area.tileSelected} options={yesNoUnsure} onChange={(value) => set("tileSelected", value as string)} /></div>
      {v.tileSelected ? <div className="space-y-5 rounded-xl bg-amber-50/50 p-4"><div className="grid gap-5 sm:grid-cols-2"><SelectField en="Tile material" zh="瓷砖材质" value={area.tileMaterial} onChange={(value) => set("tileMaterial", value)} options={[["ceramic", "Ceramic", "陶质砖"], ["porcelain", "Porcelain", "瓷质砖"], ["stone", "Natural stone", "天然石材"], ["mosaic", "Mosaic / finger / Kit Kat", "马赛克 / 手指砖"], ["not_sure", "Not sure", "不确定"]]} /><TextField en="Tile size" zh="瓷砖尺寸" value={area.tileSize} onChange={(value) => set("tileSize", value)} placeholder="e.g. 600 x 1200 mm" /><TextField en="Tile thickness" zh="瓷砖厚度" value={area.tileThickness} onChange={(value) => set("tileThickness", value)} /><TextField en="Quantity purchased" zh="已购买数量" value={area.tileQuantity} onChange={(value) => set("tileQuantity", value)} /><TextField en="Wastage allowance" zh="损耗预留" value={area.wastageAllowance} onChange={(value) => set("wastageAllowance", value)} placeholder="e.g. 10%" /><SelectField en="Layout" zh="铺贴方式" value={area.layout} onChange={(value) => set("layout", value)} options={[["straight", "Straight", "直铺"], ["brick", "Brick bond", "工字铺"], ["stacked", "Stacked", "对缝铺"], ["diagonal", "Diagonal", "斜铺"], ["herringbone", "Herringbone", "人字铺"], ["feature", "Feature pattern", "特色花纹"], ["not_sure", "Not sure", "不确定"]]} /></div><TextField en="Pattern / vein matching details" zh="花纹 / 纹理对缝要求" value={area.patternMatching} onChange={(value) => set("patternMatching", value)} /></div> : null}
      {v.hasWalls ? <div className="grid gap-5 sm:grid-cols-2"><SelectField en="External wall corners present" zh="是否有外露墙面阳角" value={area.externalCorners} onChange={(value) => set("externalCorners", value)} options={yesNoUnsure} />{v.hasExternalCorners ? <SelectField en="Corner finish" zh="阳角处理" value={area.cornerFinish} onChange={(value) => set("cornerFinish", value)} options={[["mitre", "Mitred edges", "45 度拼角"], ["trim", "Tile trim / angle bar", "瓷砖压条 / 阳角条"], ["not_sure", "Not sure", "不确定"]]} /> : null}</div> : null}
      <div className="grid gap-5 sm:grid-cols-2"><SelectField en="Grout selection" zh="填缝剂选择" value={area.grout} onChange={(value) => set("grout", value)} options={[["standard", "Standard grout", "普通填缝剂"], ["epoxy", "Epoxy grout (extra cost)", "环氧彩砂 / 环氧填缝（另计）"], ["not_sure", "Not sure", "不确定"]]} /><TextField en="Preferred grout colour" zh="期望填缝颜色" value={area.groutColour} onChange={(value) => set("groutColour", value)} /></div>
      <div><FieldLabel en="Additional installation details" zh="其他施工细节（可多选）" /><ChoiceGroup name={`${area.id}-extras`} value={area.extras} options={extrasOptions} multiple onChange={(value) => set("extras", value as string[])} /></div>
      {v.hasFloor ? <SelectField en="Underfloor heating" zh="地暖情况" value={area.underfloorHeating} onChange={(value) => set("underfloorHeating", value)} options={[["existing", "Existing system", "已有系统"], ["new", "New system planned", "计划新装"], ["none", "None", "无"], ["not_sure", "Not sure", "不确定"]]} /> : null}
      <div><FieldLabel en="Items requiring removal / refitting" zh="需拆装的物品（可多选）" /><ChoiceGroup name={`${area.id}-removals`} value={area.removals} options={removalOptions} multiple onChange={(value) => set("removals", value as string[])} /></div>
      <SelectField en="Plumbing, electrical and other trades" zh="水工、电工及其他工种安排" value={area.tradesArranged} onChange={(value) => set("tradesArranged", value)} options={[["arranged", "Already arranged", "已安排"], ["needs_coordination", "Needs coordination", "需要协调"], ["not_required", "Not required", "不需要"], ["not_sure", "Not sure", "不确定"]]} />
      <label><FieldLabel en="Area notes" zh="此区域补充说明" /><textarea className={`${inputClass} min-h-28 resize-y`} value={area.notes} onChange={(event) => set("notes", event.target.value)} /></label>
    </div>
  </details>;
}

export function QuestionnaireForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(createInitialAnswers);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [draftSession, setDraftSession] = useState<{ id: string; uploadToken: string; uploadedCount: number } | null>(null);
  const selectedTypes = useMemo(() => new Set(answers.areas.map((area) => area.type)), [answers.areas]);
  const updateTurnstile = useCallback((token: string) => setTurnstileToken(token), []);

  const toggleArea = (type: AreaType) => setAnswers((current) => ({ ...current, areas: selectedTypes.has(type) ? current.areas.filter((area) => area.type !== type) : [...current.areas, createArea(type)] }));
  const updateArea = (id: string, value: AreaAnswers) => setAnswers((current) => ({ ...current, areas: current.areas.map((area) => area.id === id ? value : area) }));
  const updateCustomer = (key: keyof QuestionnaireAnswers["customer"], value: string) => setAnswers((current) => ({ ...current, customer: { ...current.customer, [key]: value } }));
  const updateProject = (key: keyof QuestionnaireAnswers["project"], value: string) => setAnswers((current) => ({ ...current, project: { ...current.project, [key]: value } }));

  function selectFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files, ...Array.from(list)];
    const fileErrors: string[] = [];
    if (next.length > MAX_FILES) fileErrors.push("A maximum of 10 files is allowed. / 最多上传 10 个文件。");
    next.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) fileErrors.push(`${file.name} is larger than 10 MB.`);
      if (!acceptedTypes.includes(file.type) && !/\.(jpe?g|png|webp|heic|heif|pdf)$/i.test(file.name)) fileErrors.push(`${file.name} is not a supported file type.`);
    });
    if (fileErrors.length) return setErrors(fileErrors);
    setErrors([]); setFiles(next);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const validationErrors = validateQuestionnaire(answers);
    if (!draftSession && turnstileSiteKey && !turnstileToken) validationErrors.push("Complete the security check. / 请完成人机验证。");
    if (validationErrors.length) { setErrors(validationErrors); document.getElementById("questionnaire-errors")?.scrollIntoView({ behavior: "smooth" }); return; }
    setSubmitting(true); setErrors([]);
    try {
      setStatus("Saving your project details... / 正在保存工程信息...");
      let session = draftSession;
      if (!session) {
        const createResponse = await fetch("/api/questionnaire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers, turnstileToken }) });
        const created = await createResponse.json() as { id?: string; uploadToken?: string; message?: string };
        if (!createResponse.ok || !created.id || !created.uploadToken) throw new Error(created.message || "Could not start submission.");
        session = { id: created.id, uploadToken: created.uploadToken, uploadedCount: 0 };
        setDraftSession(session);
      }
      for (let index = session.uploadedCount; index < files.length; index += 1) {
        setStatus(`Uploading file ${index + 1} of ${files.length}... / 正在上传第 ${index + 1} 个文件...`);
        const form = new FormData(); form.append("file", files[index]); form.append("uploadToken", session.uploadToken);
        const upload = await fetch(`/api/questionnaire/${session.id}/attachments`, { method: "POST", body: form });
        const payload = await upload.json().catch(() => ({})) as { message?: string };
        if (!upload.ok) throw new Error(payload.message || `Could not upload ${files[index].name}.`);
        session = { ...session, uploadedCount: index + 1 };
        setDraftSession(session);
      }
      setStatus("Preparing your bilingual project summary... / 正在生成双语工程摘要...");
      const finalize = await fetch(`/api/questionnaire/${session.id}/finalize`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uploadToken: session.uploadToken }) });
      const finalized = await finalize.json().catch(() => ({})) as { message?: string };
      if (!finalize.ok) throw new Error(finalized.message || "Could not finalize submission.");
      const navigate = () => router.push("/quote/thanks");
      if (window.gtag_report_lead_form_conversion) { window.gtag_report_lead_form_conversion(navigate); window.setTimeout(navigate, 1000); } else navigate();
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Submission failed. Please try again."]);
      setStatus(""); setTurnstileReset((value) => value + 1);
    } finally { setSubmitting(false); }
  }

  const supplyOptions: readonly Option[] = [["owner", "Owner", "客户购买"], ["tiler", "Tiler", "师傅包料"], ["not_sure", "Not sure", "不确定"]];
  return <form onSubmit={submit} noValidate className="mx-auto max-w-5xl rounded-[1.75rem] border border-slate-300 bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.10)] sm:p-8 lg:p-10">
    <div className="mb-10 flex flex-col gap-6 border-b border-slate-300 pb-8 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-amber-700">LITA TILING CANBERRA</p><h1 className="mt-3 max-w-3xl font-heading text-3xl font-semibold leading-tight text-slate-950 sm:text-5xl">Tiling Project Questionnaire</h1><p className="mt-2 text-base text-slate-500">澳洲瓷砖工程需求确认表</p><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">Tell us about each area so we can review the scope before arranging a site visit. This form does not provide or guarantee a final quote.<span className="mt-1 block text-xs text-slate-500">请按区域提供工程信息，便于我们在现场勘查前了解范围。本表不构成最终报价。</span></p></div><Image src="/lita-logo.webp" alt="Lita Tiling" width={150} height={150} className="h-28 w-28 self-start object-contain sm:h-36 sm:w-36" priority /></div>
    {errors.length ? <div id="questionnaire-errors" role="alert" className="mb-8 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900"><p className="font-bold">Please review the following / 请检查以下内容：</p><ul className="mt-2 list-disc space-y-1 pl-5">{errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : null}
    <Section number="1" title="Contact and project overview" zh="联系方式与项目概况"><div className="grid gap-5 sm:grid-cols-2"><TextField en="Customer name" zh="客户姓名" value={answers.customer.name} onChange={(value) => updateCustomer("name", value)} required /><TextField en="Mobile number" zh="手机号码" value={answers.customer.phone} onChange={(value) => updateCustomer("phone", value)} required type="tel" /><TextField en="Email (optional)" zh="电子邮箱（选填）" value={answers.customer.email} onChange={(value) => updateCustomer("email", value)} type="email" /><SelectField en="Customer role" zh="客户身份" value={answers.customer.role} onChange={(value) => updateCustomer("role", value)} required options={[["owner", "Owner", "业主"], ["builder", "Builder", "建筑商"], ["property_manager", "Property manager", "物业经理"], ["other", "Other", "其他"]]} />{answers.customer.role === "other" ? <TextField en="Other role" zh="其他身份" value={answers.customer.roleOther} onChange={(value) => updateCustomer("roleOther", value)} /> : null}<div className="sm:col-span-2"><TextField en="Full project address" zh="完整工程地址" value={answers.project.address} onChange={(value) => updateProject("address", value)} required /></div><SelectField en="Property type" zh="物业类型" value={answers.project.propertyType} onChange={(value) => updateProject("propertyType", value)} required options={[["house", "House", "独立屋"], ["apartment", "Apartment", "公寓"], ["townhouse", "Townhouse", "联排别墅"], ["commercial", "Commercial", "商业物业"], ["other", "Other", "其他"]]} /><SelectField en="Project type" zh="项目类型" value={answers.project.projectType} onChange={(value) => updateProject("projectType", value)} required options={[["new_build", "New build", "新建"], ["renovation", "Renovation", "翻新"], ["repair", "Repair", "维修"]]} /><SelectField en="Current stage" zh="当前阶段" value={answers.project.stage} onChange={(value) => updateProject("stage", value)} required options={[["planning", "Planning", "规划中"], ["selected", "Tiles selected", "已选瓷砖"], ["purchased", "Tiles purchased", "已购瓷砖"], ["ready", "Ready to start", "可开工"]]} /><TextField en="Preferred start date" zh="期望开工日期" value={answers.project.preferredStartDate} onChange={(value) => updateProject("preferredStartDate", value)} type="date" /><SelectField en="Is the date flexible?" zh="日期是否灵活" value={answers.project.startFlexible} onChange={(value) => updateProject("startFlexible", value)} options={yesNoUnsure} /><SelectField en="Occupied during works?" zh="施工期间是否有人居住" value={answers.project.occupied} onChange={(value) => updateProject("occupied", value)} options={yesNoUnsure} /><TextField en="Floor level" zh="施工楼层" value={answers.project.floorLevel} onChange={(value) => updateProject("floorLevel", value)} /><SelectField en="Lift access" zh="是否有电梯" value={answers.project.liftAccess} onChange={(value) => updateProject("liftAccess", value)} options={yesNoUnsure} /><TextField en="Parking / loading" zh="停车 / 卸料条件" value={answers.project.parking} onChange={(value) => updateProject("parking", value)} /><SelectField en="Water and power available" zh="现场是否有水电" value={answers.project.waterPower} onChange={(value) => updateProject("waterPower", value)} options={yesNoUnsure} /><TextField en="Permitted work hours" zh="允许施工时间" value={answers.project.workHours} onChange={(value) => updateProject("workHours", value)} /><div className="sm:col-span-2"><TextField en="Material access / site constraints" zh="材料搬运通道 / 现场限制" value={answers.project.accessNotes} onChange={(value) => updateProject("accessNotes", value)} /></div></div></Section>
    <Section number="2" title="Select all areas to be tiled" zh="选择所有需要铺贴的区域"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{AREA_TYPES.map((type) => <label key={type} className={`cursor-pointer rounded-xl border p-4 transition ${selectedTypes.has(type) ? "border-amber-600 bg-amber-50 shadow-[inset_3px_0_0_#a16207]" : "border-slate-200 hover:border-slate-400"}`}><input type="checkbox" className="sr-only" checked={selectedTypes.has(type)} onChange={() => toggleArea(type)} /><Bilingual en={areaLabels[type].en} zh={areaLabels[type].zh} className="text-sm font-semibold text-slate-900" /></label>)}</div></Section>
    <Section number="3" title="Area details" zh="各施工区域详细信息"><p className="mb-6 text-sm leading-6 text-slate-600">Only relevant questions are shown. Choose “Not sure” when a site inspection is needed.<span className="block text-xs text-slate-500">系统只显示相关问题。如需现场确认，请选择“不确定”。</span></p><div className="space-y-5">{answers.areas.length ? answers.areas.map((area, index) => <AreaForm key={area.id} area={area} index={index} onChange={(value) => updateArea(area.id, value)} />) : <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Select at least one area above. / 请先在上方选择至少一个区域。</div>}</div></Section>
    <Section number="4" title="Materials supply" zh="材料采购分工"><div className="space-y-5">{([...["tiles", "Main tiles", "主砖"], ["adhesive", "Adhesive / cement", "胶水 / 水泥"], ["waterproofing", "Waterproofing materials", "防水材料"], ["grout", "Grout", "填缝剂"], ["drains", "Drains", "地漏"], ["trims", "Trims / angle bars", "压条 / 阳角条"]] as [keyof QuestionnaireAnswers["supplies"], string, string][]).map(([key, en, zh]) => <div key={key}><FieldLabel en={en} zh={zh} required /><ChoiceGroup name={`supply-${key}`} value={answers.supplies[key]} options={supplyOptions} onChange={(value) => setAnswers((current) => ({ ...current, supplies: { ...current.supplies, [key]: value as SupplyParty } }))} /></div>)}</div></Section>
    <Section number="5" title="Photos, plans and confirmation" zh="照片、图纸与确认"><label><FieldLabel en="Additional project notes" zh="其他项目说明" /><textarea className={`${inputClass} min-h-32 resize-y`} value={answers.additionalNotes} onChange={(event) => setAnswers((current) => ({ ...current, additionalNotes: event.target.value }))} /></label><div className="mt-6"><FieldLabel en="Upload photos or floor plans (optional)" zh="上传现场照片或户型图（选填）" /><label className={`block rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition ${draftSession ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-amber-600"}`}><span className="text-sm font-semibold text-slate-800">Choose files / 选择文件</span><span className="mt-1 block text-xs text-slate-500">Up to 10 files, 10 MB each. JPG, PNG, WEBP, HEIC/HEIF or PDF.</span><input type="file" multiple disabled={Boolean(draftSession)} className="sr-only" accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.pdf" onChange={(event) => selectFiles(event.target.files)} /></label>{files.length ? <ul className="mt-3 space-y-2">{files.map((file, index) => <li key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700"><span className="truncate">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</span>{!draftSession ? <button type="button" className="ml-3 font-semibold text-rose-700" onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}>Remove / 删除</button> : null}</li>)}</ul> : null}{draftSession ? <p className="mt-3 text-xs text-amber-800">A recoverable draft is active. Keep this page open and press submit again to retry. / 可恢复草稿已保留，请保持页面打开并再次点击提交重试。</p> : null}</div><div className="mt-7 space-y-3"><label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4"><input type="checkbox" checked={answers.accuracyConfirmed} onChange={(event) => setAnswers((current) => ({ ...current, accuracyConfirmed: event.target.checked }))} className="mt-1 h-4 w-4 accent-amber-700" /><Bilingual en="I confirm the information is accurate to the best of my knowledge." zh="我确认以上信息在本人所知范围内准确。" className="text-sm font-medium text-slate-800" /></label><label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4"><input type="checkbox" checked={answers.privacyAccepted} onChange={(event) => setAnswers((current) => ({ ...current, privacyAccepted: event.target.checked }))} className="mt-1 h-4 w-4 accent-amber-700" /><span className="text-sm font-medium text-slate-800">I agree that LITA Tiling may use these details and files to assess, quote and contact me.<span className="mt-0.5 block text-xs font-normal text-slate-500">我同意 LITA Tiling 使用这些信息和附件进行评估、报价并联系我。</span><Link className="mt-1 inline-block text-amber-800 underline" href="/en/privacy" target="_blank">Privacy policy / 隐私政策</Link></span></label></div><div className="hidden"><label>Company<input value={answers.company} onChange={(event) => setAnswers((current) => ({ ...current, company: event.target.value }))} tabIndex={-1} autoComplete="off" /></label></div>{turnstileSiteKey ? <div className="mt-6"><TurnstileWidget siteKey={turnstileSiteKey} locale="en" label="Security check / 人机验证" resetCounter={turnstileReset} onTokenChange={updateTurnstile} /></div> : null}</Section>
    <div className="sticky bottom-3 z-10 rounded-2xl border border-slate-300 bg-white/95 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.18)] backdrop-blur sm:flex sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-slate-900">{status || "Ready to submit for manual review"}</p><p className="text-xs text-slate-500">提交后由 LITA 人工审核，不会自动报价。</p></div><button type="submit" disabled={submitting} className="mt-3 w-full rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-wait disabled:bg-slate-500 sm:mt-0 sm:w-auto">{submitting ? "Submitting... / 正在提交..." : "Submit project / 提交工程信息"}</button></div>
  </form>;
}
