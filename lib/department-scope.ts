const departmentAliases: Record<string, string[]> = {
  accounts: ["Accounts", "Finance", "Finance and Accounts", "Finance Department"],
  finance: ["Finance", "Accounts", "Finance and Accounts", "Finance Department"],
  "finance and accounts": ["Finance and Accounts", "Finance", "Accounts", "Finance Department"],
  ict: ["ICT", "IT", "Information Technology", "Information and Communication Technology", "Information Communication Technology"],
  "information technology": ["Information Technology", "ICT", "IT", "Information and Communication Technology"],
  "information and communication technology": ["Information and Communication Technology", "Information Communication Technology", "ICT", "IT"],
  planning: ["Planning", "Planning Department"],
  administration: ["Administration", "Administration Department", "Admin"],
  procurement: ["Procurement", "Procurement Management Unit", "PMU"],
  health: ["Health", "Health Department"],
  education: ["Education", "Education Department"],
  works: ["Works", "Works Department"],
  agriculture: ["Agriculture", "Agriculture Department"]
};

export function normalizeDepartment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, " ");
}

export function departmentScope(department: string | null | undefined) {
  const value = department?.trim();
  if (!value) return ["__unassigned__"];

  const normalized = normalizeDepartment(value);
  const aliases = departmentAliases[normalized] ?? [];
  return Array.from(new Set([value, ...aliases])).filter(Boolean);
}

export function sameDepartment(left: string | null | undefined, right: string | null | undefined) {
  const rightScope = new Set(departmentScope(right).map(normalizeDepartment));
  return left ? rightScope.has(normalizeDepartment(left)) : false;
}
