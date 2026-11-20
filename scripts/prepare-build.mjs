import { rmSync } from "node:fs";
import path from "node:path";

// Next.js can fail with EPERM when it recreates generated route types already
// present in the Windows output directory. Remove only ignored build output.
if (process.platform === "win32") {
  rmSync(path.resolve(process.cwd(), ".next-windows"), { recursive: true, force: true });
}
