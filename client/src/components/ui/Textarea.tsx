import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-primary-blue mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-4 py-3 rounded-xl border ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500' 
              : 'border-neutral-300 focus:border-accent-yellow focus:ring-2 focus:ring-accent-yellow'
          } focus:outline-none transition-colors bg-white ${
            props.disabled ? 'bg-neutral-100 cursor-not-allowed' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;