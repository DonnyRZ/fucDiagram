import React from 'react';
import './Button.css';

type Variant = 'primary' | 'secondary' | 'tonal' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth,
  leftIcon,
  rightIcon,
  className,
  children,
  ...rest
}) => {
  return (
    <button
      className={['btn', `btn--${variant}`, fullWidth ? 'btn--full' : '', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({ children, className, ...rest }) => (
  <button className={["icon-btn", className].filter(Boolean).join(' ')} {...rest}>
    {children}
  </button>
);

export default Button;

