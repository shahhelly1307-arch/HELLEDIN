import { avatarGradient, initials } from "@/lib/avatar";
import { cn } from "@/lib/utils";

interface Props { name?: string | null; seed?: string | null; size?: "xs" | "sm" | "md" | "lg" | "xl"; className?: string }

const sizes = { xs: "h-7 w-7 text-xs", sm: "h-9 w-9 text-sm", md: "h-12 w-12 text-base", lg: "h-16 w-16 text-xl", xl: "h-24 w-24 text-3xl" };

export function Avatar({ name, seed, size = "md", className }: Props) {
  return (
    <div className={cn(
      "rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br shrink-0",
      avatarGradient(seed ?? name), sizes[size], className,
    )}>
      {initials(name)}
    </div>
  );
}
