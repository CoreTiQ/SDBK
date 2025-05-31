interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: Array<{
      value: string;
      label: string;
    }>;
    error?: string;
  }
  
  export function Select({ options, error, className = '', ...props }: SelectProps) {
    return (
      <div>
        <select
          {...props}
          className={`
            w-full rounded-lg border px-4 py-2 outline-none transition-colors
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}
            ${className}
          `}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }