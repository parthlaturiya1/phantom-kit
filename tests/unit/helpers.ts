import type { Ctx } from "../../packages/kit";

export function recorder() {
  const calls: string[] = [];
  const ctx = new Proxy({ strokeStyle: "", fillStyle: "", lineWidth: 0, lineCap: "butt", font: "", textAlign: "start" } as Record<string, unknown>, {
    get: (t, k: string) => (k in t ? t[k] : (...a: unknown[]) => void calls.push(`${k}(${a.map((x) => (typeof x === "number" ? x.toFixed(1) : x)).join(",")})`)),
    set: (t, k: string, v) => ((t[k] = v), true),
  }) as unknown as Ctx;
  return { ctx, calls };
}


