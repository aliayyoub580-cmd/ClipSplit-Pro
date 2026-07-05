import { cpSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const source = resolve("client", "dist");
const target = resolve("dist");

if (!existsSync(source)) {
  throw new Error("Expected client/dist to exist after the client build.");
}

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
