export default function Button({
  children,
  variant = "primary",
  isLoading = false,
  type = "button",
  className = "",
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      className={`button button--${variant} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Please wait..." : children}
    </button>
  );
}