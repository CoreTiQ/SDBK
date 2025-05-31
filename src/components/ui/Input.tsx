interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
  }
  
  export function Input({ error, className = '', ...props }: InputProps) {
    return (
      <div>
        <input
          {...props}
          className={`
            w-full rounded-lg border px-4 py-2 outline-none transition-colors
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}
            ${className}
          `}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }