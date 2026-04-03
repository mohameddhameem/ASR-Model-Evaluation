import { Slot } from "@radix-ui/react-slot";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-white dark:bg-card border border-border rounded-[2px]", className)} {...props}>
      {children}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "danger" | "ghost" | "primary";
  size?: "default" | "sm";
  asChild?: boolean;
}

export function Button({ 
  className, 
  variant = "default", 
  size = "default", 
  asChild = false, 
  ...props 
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  const baseStyles = "inline-flex items-center justify-center rounded-[2px] font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wider";
  const variants = {
    default: "bg-primary text-white hover:bg-primary/90 shadow-sm",
    primary: "bg-primary text-white hover:bg-primary/90 shadow-sm",
    secondary: "bg-white dark:bg-muted text-foreground border border-border hover:bg-muted shadow-sm",
    danger: "bg-red-700 text-white hover:bg-red-800 shadow-sm",
    ghost: "hover:bg-muted text-muted-foreground hover:text-foreground",
  };
  const sizes = {
    default: "h-9 px-4 py-2 text-[11px]",
    sm: "h-8 px-3 text-[10px]",
  };
  
  return (
    <Comp 
      className={cn(baseStyles, variants[variant], sizes[size], className)} 
      {...props} 
    />
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded-[2px] border border-border bg-white dark:bg-card px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-[2px] border border-border bg-white dark:bg-card px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-[11px] font-bold uppercase tracking-widest leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground", className)}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-9 w-full rounded-[2px] border border-border bg-white dark:bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Badge({ className, variant = "default", children, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "success" | "warning" | "secondary" }) {
  const variants = {
    default: "bg-muted text-muted-foreground border-border",
    secondary: "bg-muted text-muted-foreground border-border",
    success: "bg-[#f0fdf4] dark:bg-[#052c16] text-[#16a34a] border-[#16a34a]/20",
    warning: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 dark:border-amber-900/30",
  };
  return (
    <div className={cn("inline-flex items-center rounded-[2px] border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors", variants[variant], className)} {...props}>
      {children}
    </div>
  );
}