import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getPresupuestoColor, getPresupuestoTextColor } from '@/lib/constants';
import { formatPercentage } from '@/lib/format';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar = ({ 
  value, 
  max = 100, 
  showLabel = true, 
  size = 'md',
  className 
}: ProgressBarProps) => {
  const percentage = (value / max) * 100;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  const colorClass = getPresupuestoColor(clampedPercentage);
  const textColorClass = getPresupuestoTextColor(clampedPercentage);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        <Progress 
          value={clampedPercentage} 
          className={cn('transition-all duration-300', sizeClasses[size])}
          indicatorClassName={colorClass}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-1">
          <span className={cn('text-sm font-semibold', textColorClass)}>
            {formatPercentage(clampedPercentage)}
          </span>
          <span className="text-xs text-muted-foreground">
            {value} / {max}
          </span>
        </div>
      )}
    </div>
  );
};
