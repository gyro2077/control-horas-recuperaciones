import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const excludedDirectories = new Set([
  ".git",
  ".next",
  "node_modules",
  "coverage",
  "src/generated",
]);
const allowedFiles = new Set([".env", ".env.example", "check-secrets.mjs"]);
const patterns = [
  {
    name: "URL PostgreSQL con credenciales",
    value:
      /postgres(?:ql)?:\/\/(?!usuario:contrase(?:ñ|n)a@)[^:\s"'<>]+:[^@\s"'<>]+@[^/\s"'<>]+\/[^\s"'<>]+/gi,
  },
  {
    name: "clave privada",
    value: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  },
  {
    name: "secreto asignado en código",
    value: /(?:AUTH_SECRET|DATABASE_URL)\s*[:=]\s*["'][^"']{20,}["']/g,
  },
];
const safeMarkers = [
  "local-development-only",
  "build:build",
  "user:pass",
  "usuario:contraseña",
  "usuario:contrasena",
  "integration-test-secret",
  "secreto-aleatorio",
  "at-least-thirty-two",
];

async function files(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(root, absolute);
    if (
      entry.isDirectory() &&
      [...excludedDirectories].some(
        (excluded) =>
          relative === excluded || relative.startsWith(`${excluded}/`),
      )
    ) {
      continue;
    }
    if (entry.isDirectory()) result.push(...(await files(absolute)));
    else result.push(absolute);
  }
  return result;
}

const findings = [];
for (const file of await files(root)) {
  if (allowedFiles.has(path.basename(file))) continue;
  const stat = await fs.stat(file);
  if (stat.size > 2_000_000) continue;
  let content;
  try {
    content = await fs.readFile(file, "utf8");
  } catch {
    continue;
  }
  for (const pattern of patterns) {
    pattern.value.lastIndex = 0;
    const matches = content.match(pattern.value) ?? [];
    if (
      matches.some(
        (match) => !safeMarkers.some((marker) => match.includes(marker)),
      )
    ) {
      findings.push(`${path.relative(root, file)}: ${pattern.name}`);
    }
  }
}

if (findings.length) {
  console.error("Posibles secretos encontrados:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
} else {
  console.info("No se encontraron secretos conocidos en el proyecto.");
}
