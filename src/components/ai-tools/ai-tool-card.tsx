"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AIToolCardProps {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
}

export function AIToolCard({
  title,
  subtitle,
  description,
  buttonText,
  icon: Icon,
  color,
  borderColor,
  onClick,
  disabled = false,
  loading = false,
  loadingText = "Analisando com IA...",
}: AIToolCardProps) {
  return (
    <Card
      className={cn(
        "group border-t-4 transition-all duration-300",
        borderColor,
        disabled ? "opacity-50 grayscale-[0.5]" : "hover:shadow-xl hover:-translate-y-1"
      )}
    >
      <CardHeader className="text-center pb-2">
        <div className={cn(
          "mx-auto mb-3 p-3 rounded-2xl bg-slate-50 transition-colors duration-300",
          !disabled && "group-hover:bg-white"
        )}>
          <Icon className={cn("h-8 w-8 transition-transform duration-500", color, !disabled && "group-hover:scale-110")} />
        </div>
        <CardTitle className="text-lg font-bold text-slate-900">{title}</CardTitle>
        <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-400">{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <p className="text-sm text-slate-600 leading-relaxed min-h-[40px]">
          {description}
        </p>

        <Button
          variant="outline"
          className={cn(
            "w-full h-11 font-semibold transition-all duration-300 relative overflow-hidden group/btn",
            !disabled && !loading && "hover:bg-gradient-to-r hover:from-slate-900 hover:to-slate-800 hover:text-white hover:border-transparent hover:shadow-lg"
          )}
          onClick={onClick}
          disabled={disabled || loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs tracking-tight">{loadingText}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Sparkles className={cn(
                "h-4 w-4 transition-transform duration-300",
                !disabled && "group-hover/btn:scale-125 group-hover/btn:rotate-12 text-amber-500"
              )} />
              <span>{buttonText}</span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
