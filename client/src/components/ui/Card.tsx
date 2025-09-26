import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'modern' | 'glass' | 'elevated' | 'outline' | 'ghost';
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default', 
  className = '', 
  hover = false,
  style
}) => {
  const baseClasses = 'rounded-2xl border transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-white border-neutral-200 shadow-sm hover:shadow-md',
    modern: 'bg-white border-neutral-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1',
    glass: 'bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15',
    elevated: 'bg-white border-neutral-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-2',
    outline: 'bg-transparent border-current text-current hover:bg-current hover:text-white',
    ghost: 'bg-transparent border-transparent hover:bg-neutral-50'
  };

  const hoverClasses = hover ? 'hover:shadow-md' : '';

  const classes = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`;

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
};

export default Card;