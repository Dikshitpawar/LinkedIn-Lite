import "./Button.css";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  className = "",
  disabled,
  type = "button",
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        "btn",
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth ? "btn--full" : "",
        loading ? "btn--loading" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {loading ? (
        <span className="btn__spinner" aria-hidden />
      ) : (
        <>
          {icon && <span className="btn__icon">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
