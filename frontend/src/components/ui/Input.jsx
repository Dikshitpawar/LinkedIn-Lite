import { forwardRef } from "react";
import "./Input.css";

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon,
    suffix,
    textarea = false,
    rows = 4,
    className = "",
    wrapperClass = "",
    ...props
  },
  ref,
) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <div className={`field ${error ? "field--error" : ""} ${wrapperClass}`}>
      {label && <label className="field__label">{label}</label>}
      <div className="field__control">
        {icon && <span className="field__icon">{icon}</span>}
        <Tag
          ref={ref}
          className={`field__input ${icon ? "field__input--icon" : ""} ${textarea ? "field__textarea" : ""} ${className}`}
          rows={textarea ? rows : undefined}
          {...props}
        />
        {suffix && <span className="field__suffix">{suffix}</span>}
      </div>
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
      {hint && !error && <p className="field__hint">{hint}</p>}
    </div>
  );
});

export default Input;
