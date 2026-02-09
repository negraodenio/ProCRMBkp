'use client';

import { PersonalityType, PERSONALITY_PRESETS } from '@/lib/bot-personalities';
import { cn } from '@/lib/utils';

interface PersonalitySelectorProps {
  selected: PersonalityType;
  onChange: (preset: PersonalityType) => void;
}

export function PersonalitySelector({ selected, onChange }: PersonalitySelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Object.entries(PERSONALITY_PRESETS).map(([key, preset]) => {
        const isSelected = selected === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key as PersonalityType)}
            className={cn(
              "p-4 rounded-lg border-2 transition-all duration-200 card-hover",
              isSelected
                ? "border-primary bg-primary/10 shadow-glow-primary"
                : "border-white/10 hover:border-white/20 hover:bg-white/5"
            )}
          >
            <div className="text-3xl mb-2">{preset.emoji}</div>
            <div className="font-semibold text-sm">{preset.name}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {preset.description}
            </div>
            {isSelected && (
              <div className="mt-2">
                <span className="text-xs badge-primary">⬤ ATIVO</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
