import * as React from "react";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

const Spinner = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center justify-center py-8", className)} {...props}>
    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
  </div>
);

export { Spinner };
