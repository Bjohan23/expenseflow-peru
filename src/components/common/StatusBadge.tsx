import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'activo' | 'inactivo' | 'activa' | 'inactiva' | 'abierta' | 'cerrada';
  className?: string;
}

const statusStyles = {
  activo: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  inactivo: 'bg-muted text-muted-foreground border-border hover:bg-muted',
  activa: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  inactiva: 'bg-muted text-muted-foreground border-border hover:bg-muted',
  abierta: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  cerrada: 'bg-muted text-muted-foreground border-border hover:bg-muted',
};

const statusLabels = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  activa: 'Activa',
  inactiva: 'Inactiva',
  abierta: 'Abierta',
  cerrada: 'Cerrada',
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <Badge 
      variant="outline"
      className={cn(
        'font-medium',
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </Badge>
  );
};
