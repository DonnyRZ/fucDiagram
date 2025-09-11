import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
}

export const Input: React.FC<InputProps> = ({ label, helperText, errorText, id, ...rest }) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2)}`;
  return (
    <div className="input">
      {label && <label htmlFor={inputId}>{label}</label>}
      <input id={inputId} aria-invalid={!!errorText} {...rest} />
      {errorText ? (
        <div className="error" role="alert">{errorText}</div>
      ) : helperText ? (
        <div className="helper">{helperText}</div>
      ) : null}
    </div>
  );
};

export default Input;

