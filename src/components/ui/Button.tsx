interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    isLoading?: boolean;
  }
  
  export function Button({
    children,
    variant = 'primary',
    isLoading,
    className = '',
    ...props
  }: ButtonProps) {
    return (
      <button
        {...props}
        disabled={isLoading || props.disabled}
        className={`
          px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2
          ${variant === 'primary' 
            ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-200' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-200'}
          ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            جاري التحميل...
          </span>
        ) : children}
      </button>
    );
  }