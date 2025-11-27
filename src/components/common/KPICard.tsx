import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
}

const variantStyles = {
  default: 'bg-card',
  primary: 'bg-primary-light border-primary/20',
  success: 'bg-success-light border-success/20',
  warning: 'bg-warning-light border-warning/20',
  destructive: 'bg-destructive/10 border-destructive/20',
};

const iconVariantStyles = {
  default: 'bg-primary/10 text-primary',
  primary: 'bg-primary/20 text-primary',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  destructive: 'bg-destructive/20 text-destructive',
};

export const KPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = 'default' 
}: KPICardProps) => {
  return (
    <Card className={cn('border-2 transition-all hover:shadow-md', variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <h3 className="text-3xl font-bold tracking-tight mb-2">
              {value}
            </h3>
            {trend && (
              <div className={cn(
                'flex items-center text-sm font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}>
                <span className="mr-1">{trend.isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          <div className={cn(
            'p-3 rounded-xl',
            iconVariantStyles[variant]
          )}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
