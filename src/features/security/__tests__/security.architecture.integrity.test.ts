/**
 * Testes de integridade arquitetural do SECURITY (TASK 10).
 * Valida regras de dependência entre features sem acoplar aos detalhes internos.
 */

import * as fs from "fs";
import * as path from "path";

const FEATURES_ROOT = path.resolve(__dirname, "../..");
const AUTH_DIR = path.join(FEATURES_ROOT, "auth");
const PIX_DIR = path.join(FEATURES_ROOT, "pix");
const SECURITY_INDEX = path.join(FEATURES_ROOT, "security/index.ts");

function getTsFiles(dir: string, excludeTests = false): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules") {
      files.push(...getTsFiles(full, excludeTests));
    } else if (e.isFile() && /\.(ts|tsx)$/.test(e.name)) {
      if (excludeTests && (e.name.includes(".test.") || e.name.includes(".spec."))) continue;
      files.push(full);
    }
  }
  return files;
}

describe("security.architecture.integrity", () => {
  it("AUTH não depende de SECURITY", () => {
    const authFiles = getTsFiles(AUTH_DIR, false);
    const violators: string[] = [];
    for (const file of authFiles) {
      const content = fs.readFileSync(file, "utf-8");
      if (/from\s+['\"@\/\w\-]*features\/security\b/.test(content)) {
        violators.push(path.relative(process.cwd(), file));
      }
    }
    expect(violators).toEqual([]);
  });

  it("Pix não depende diretamente de PIN/validatePin/pinStorage", () => {
    const pixFiles = getTsFiles(PIX_DIR, true);
    const forbidden = [
      /validatePin\.service/,
      /pinStorage|pinSecureStoreAdapter|pinCrypto/,
      /from\s+['\"][^'\"]*security\/infra/,
      /from\s+['\"][^'\"]*security\/services\/validatePin/,
    ];
    const violators: string[] = [];
    for (const file of pixFiles) {
      const content = fs.readFileSync(file, "utf-8");
      for (const pattern of forbidden) {
        if (pattern.test(content)) {
          violators.push(path.relative(process.cwd(), file));
          break;
        }
      }
    }
    expect(violators).toEqual([]);
  });

  it("sendPixUseCase só é importado pelo fluxo protegido ou pelo próprio use case", () => {
    const pixFiles = getTsFiles(PIX_DIR, false);
    const importers: string[] = [];
    for (const file of pixFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const importsSendPixUseCase = /import\s+.*sendPixUseCase|from\s+['\"][^'\"]*sendPix\.useCase/.test(content);
      if (importsSendPixUseCase) {
        const rel = path.relative(process.cwd(), file);
        const isTest = rel.includes(".test.") || rel.includes("__tests__");
        const isProtectedFlow = rel.includes("sendPixWithSecurityChallengeUseCase");
        const isDefinition = rel.includes("sendPix.useCase.ts");
        if (!isTest && !isProtectedFlow && !isDefinition) {
          importers.push(rel);
        }
      }
    }
    expect(importers).toEqual([]);
  });

  it("API pública do SECURITY não exporta infra interna de PIN", () => {
    const content = fs.readFileSync(SECURITY_INDEX, "utf-8");
    expect(content).not.toMatch(/pinSecureStoreAdapter|pinCrypto|pinStorage/);
    expect(content).not.toMatch(/validatePin\.service|validatePin\b/);
  });
});
