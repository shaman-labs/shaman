export function RowItem({
  icon: Icon,
  label,
  children,
  className = '',
  noDivider = false,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  className?: string;
  noDivider?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 ${!noDivider ? 'pt-4' : ''} ${className}`}>
      <div className="bg-primary/10 p-2 rounded-md">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <h3 className="text-xs font-medium text-muted-foreground">{label}</h3>
        {children}
      </div>
    </div>
  );
}
