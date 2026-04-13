// src/components/Btn.jsx
export default function Btn({ children, variant = "primary", onClick, style = {}, full = false }) {
  const classes = [
    "btn",
    `btn--${variant}`,
    full ? "btn--full" : "",
  ].filter(Boolean).join(" ");

  return (
    <button className={classes} onClick={onClick} style={style}>
      {children}
    </button>
  );
}