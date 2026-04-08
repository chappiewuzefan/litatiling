export function normalizePhoneForKey(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("61") && digits.length === 11) {
    return digits;
  }

  if (digits.startsWith("04") && digits.length === 10) {
    return `61${digits.slice(1)}`;
  }

  if (digits.startsWith("4") && digits.length === 9) {
    return `61${digits}`;
  }

  if (digits.startsWith("00") && digits.length > 2) {
    return digits.slice(2);
  }

  return digits;
}

export function buildPhoneCandidates(phone: string) {
  const raw = phone.trim();
  const digits = phone.replace(/\D/g, "");
  const normalized = normalizePhoneForKey(phone);
  const candidates = new Set<string>();

  [raw, digits, normalized].forEach((value) => {
    if (value) {
      candidates.add(value);
    }
  });

  if (normalized.startsWith("61") && normalized.length === 11) {
    candidates.add(`+${normalized}`);
    candidates.add(`0${normalized.slice(2)}`);
  }

  return Array.from(candidates).slice(0, 10);
}
