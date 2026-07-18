import { initials, avatarColor } from "../../utils/helpers";
import "./Avatar.css";

export default function Avatar({
  src,
  name = "",
  size = 40,
  ring = false,
  className = "",
}) {
  const bg = avatarColor(name);
  const ini = initials(name);
  const s = {
    width: size,
    height: size,
    minWidth: size,
    fontSize: size * 0.38,
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`avatar ${ring ? "avatar--ring" : ""} ${className}`}
        style={s}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      className={`avatar avatar--fallback ${ring ? "avatar--ring" : ""} ${className}`}
      style={{ ...s, background: bg }}
      aria-label={name}
      role="img"
    >
      {ini || "?"}
    </div>
  );
}
