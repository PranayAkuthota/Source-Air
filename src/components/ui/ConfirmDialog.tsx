"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import Button from "./Button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open, title, message,
  confirmLabel = "Confirm", cancelLabel = "Cancel",
  variant = "danger", loading = false,
  onConfirm, onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape" && open) onCancel(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md bg-ink-800 border border-ink-600 rounded-2xl p-6 shadow-2xl animate-fade-up">
        <div className="flex items-start gap-4">
          <div className={cn("flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            variant === "danger" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400")}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-ink-100 text-lg">{title}</h3>
            <p className="mt-1 text-sm text-ink-400 leading-relaxed">{message}</p>
          </div>
          <button onClick={onCancel} className="text-ink-500 hover:text-ink-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
          <Button variant={variant === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
