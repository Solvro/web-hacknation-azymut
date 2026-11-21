export const roleLabels = {
  supervisor: "Przełożony",
  hr: "Kadry",
  admin: "Administrator",
  department_head: "Kierujący komórką",
};

export type Role = keyof typeof roleLabels;

export function roleHome(role: Role) {
  if (role === "supervisor") return "/";
  if (role === "department_head") return "/do-podpisu";
  return "/kadry";
}
