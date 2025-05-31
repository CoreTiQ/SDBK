interface BadgeProps {
    children: React.ReactNode;
    variant?: 'blue' | 'orange' | 'red';
  }
  
  export function Badge({ children, variant = 'blue' }: BadgeProps) {
    const variants = {
      blue: 'bg-blue-100 text-blue-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800'
    };
  
    return (
      <span className={`${variants[variant]} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
        {children}
      </span>
    );
  }