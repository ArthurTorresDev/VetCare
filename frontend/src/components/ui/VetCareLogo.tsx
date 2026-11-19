interface VetCareLogoProps {
  size?: 'small' | 'medium' | 'sidebar';
  onDarkBackground?: boolean;
  subtitle?: string;
  className?: string;
  wordmarkClassName?: string;
}

const SIZE_CLASSES = {
  small: {
    gap: 'gap-2.5',
    mark: 'h-9 w-9 rounded-xl',
    icon: 'text-[20px]',
    wordmark: 'text-[17px]',
    plus: 'text-xs',
  },
  medium: {
    gap: 'gap-3',
    mark: 'h-11 w-11 rounded-2xl',
    icon: 'text-[26px]',
    wordmark: 'text-2xl',
    plus: 'text-sm',
  },
  sidebar: {
    gap: 'gap-4',
    mark: 'h-10 w-10 rounded-2xl',
    icon: 'text-[22px]',
    wordmark: 'text-xl',
    plus: 'text-sm',
  },
} as const;

export function VetCareLogo({
  size = 'small',
  onDarkBackground = false,
  subtitle,
  className = '',
  wordmarkClassName = '',
}: VetCareLogoProps) {
  const sizeClasses = SIZE_CLASSES[size];

  return (
    <div
      aria-label="VetCare"
      className={`vetcare-logo flex items-center ${sizeClasses.gap} ${className}`}
    >
      <span
        className={`vetcare-logo__mark flex shrink-0 items-center justify-center bg-gradient-to-br from-[#0a5f7a] to-[#00ba7c] text-white shadow-lg ${sizeClasses.mark} ${onDarkBackground ? 'vetcare-logo--on-dark' : ''}`}
      >
        <span className={`material-symbols-outlined ${sizeClasses.icon}`} aria-hidden="true">
          pets
        </span>
      </span>

      <span>
        <span
          className={`flex items-center gap-1.5 font-bold tracking-tight ${
            onDarkBackground ? 'text-white' : 'text-slate-900'
          } ${sizeClasses.wordmark} ${wordmarkClassName}`}
        >
          <span>
            Vet<span className="vetcare-logo__accent">Care</span>
          </span>
          <span
            className={`material-symbols-outlined font-bold ${
              onDarkBackground ? 'text-[#6bfcb8]' : 'text-[#0a5f7a]'
            } ${sizeClasses.plus}`}
            aria-hidden="true"
          >
            add
          </span>
        </span>
        {subtitle && (
          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {subtitle}
          </span>
        )}
      </span>
    </div>
  );
}
