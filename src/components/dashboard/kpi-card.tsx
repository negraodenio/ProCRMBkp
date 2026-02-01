"use client";

import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface KPICardProps {
    title: string;
    value: string | number;
    description?: string;
    trend?: number; // Percentage change, positive or negative
    icon?: LucideIcon;
    variant?: "default" | "primary" | "success" | "warning" | "danger";
    progress?: number; // 0-100
    size?: "default" | "compact";
}

const variantStyles = {
    default: "border-l-slate-300",
    primary: "border-l-blue-500",
    success: "border-l-green-500",
    warning: "border-l-amber-500",
    danger: "border-l-red-500",
};

const iconBgStyles = {
    default: "bg-slate-100 text-slate-600",
    primary: "bg-blue-50 text-blue-600",
    success: "bg-green-50 text-green-600",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
};

export function KPICard({
    title,
    value,
    description,
    trend,
    icon: Icon,
    variant = "default",
    progress,
    size = "default",
}: KPICardProps) {
    const isPositive = trend !== undefined && trend >= 0;
    const trendColor = isPositive ? "text-green-600" : "text-red-600";
    const trendIcon = isPositive ? "↑" : "↓";

    return (
        <Card
            className={cn(
                "relative overflow-hidden border-l-4 hover:shadow-md transition-all duration-200",
                variantStyles[variant]
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {Icon && (
                    <div className={cn("p-2 rounded-full", iconBgStyles[variant])}>
                        <Icon className="h-4 w-4" />
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className={cn(
                    "font-bold",
                    size === "compact" ? "text-xl" : "text-3xl"
                )}>
                    {value}
                </div>

                {(trend !== undefined || description) && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        {trend !== undefined && (
                            <span className={cn("font-medium", trendColor)}>
                                {trendIcon} {Math.abs(trend)}%
                            </span>
                        )}
                        {description && <span>{description}</span>}
                    </p>
                )}

                {progress !== undefined && (
                    <div className="mt-3">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all",
                                    variant === "success" && "bg-green-500",
                                    variant === "warning" && "bg-amber-500",
                                    variant === "danger" && "bg-red-500",
                                    variant === "primary" && "bg-blue-500",
                                    variant === "default" && "bg-slate-500"
                                )}
                                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{progress}% da meta</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
