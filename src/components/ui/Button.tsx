import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading = false, disabled, children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none";
    const variants = {
      primary:   "bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white shadow-lg shadow-sky-500/20",
      secondary: "bg-ink-700 hover:bg-ink-600 active:bg-ink-500 text-ink-100 border border-ink-600",
      ghost:     "hover:bg-ink-800 active:bg-ink-700 text-ink-300 hover:text-ink-100",
      danger:    "bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-400 border border-red-500/25",
    };
    const sizes = { sm: "text-xs px-3 py-2", md: "text-sm px-4 py-2.5", lg: "text-sm px-6 py-3.5" };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
