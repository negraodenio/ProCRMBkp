'use client';

import { cn } from '@/lib/utils';

interface ScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ScoreCircle({ score, size = 160, strokeWidth = 12, className }: ScoreCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  // Determinar cor baseada no score
  const getColor = (s: number) => {
    if (s >= 70) return 'text-orange-500'; // Quente
    if (s >= 40) return 'text-yellow-500'; // Morno
    return 'text-blue-500'; // Frio
  };

  const getLabel = (s: number) => {
    if (s >= 70) return 'Quente';
    if (s >= 40) return 'Morno';
    return 'Frio';
  };

  const colorClass = getColor(score);

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/20"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          className={cn("transition-all duration-500 ease-in-out", colorClass)}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={cn("text-4xl font-bold", colorClass)}>{score}</span>
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Score</span>
      </div>

      {/* Badge de Temperatura */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm",
          score >= 70 ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
          score >= 40 ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
          "bg-blue-500/10 text-blue-500 border-blue-500/20"
        )}>
          {score}/100: {getLabel(score)}
        </div>
      </div>
    </div>
  );
}
