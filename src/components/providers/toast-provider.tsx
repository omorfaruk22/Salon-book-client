"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; message: string; kind: ToastKind };
type ToastContextValue = { toast: (message: string, kind?: ToastKind) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = ++nextId.current;
    setItems((current) => [...current.slice(-3), { id, message, kind }]);
    timers.current.set(id, setTimeout(() => dismiss(id), 4500));
  }, [dismiss]);

  useEffect(() => () => {
    for (const timer of timers.current.values()) clearTimeout(timer);
    timers.current.clear();
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-20 z-[100] ml-auto flex max-w-sm flex-col gap-2" aria-live="polite" aria-relevant="additions text">
        {items.map((item) => {
          const Icon = item.kind === "success" ? CheckCircle2 : item.kind === "error" ? CircleAlert : Info;
          return (
            <div key={item.id} className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-2xl border bg-[var(--surface)] p-4 shadow-[0_16px_50px_rgb(0_0_0_/_35%)] animate-fade-up",
              item.kind === "error" ? "border-red-900/70" : item.kind === "success" ? "border-[var(--primary)]/40" : "border-[var(--border)]",
            )} role={item.kind === "error" ? "alert" : "status"}>
              <Icon className={cn("mt-0.5 size-5 shrink-0", item.kind === "error" ? "text-red-300" : "text-[var(--green-light)]")} aria-hidden="true" />
              <p className="min-w-0 flex-1 text-sm leading-5 text-[var(--foreground)]">{item.message}</p>
              <button type="button" onClick={() => dismiss(item.id)} className="-mr-1 -mt-1 rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--card)] hover:text-white" aria-label="Dismiss notification"><X className="size-4" /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context.toast;
}
