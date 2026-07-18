import "./EmptyState.css";

export default function EmptyState({ emoji, title, subtitle, action }) {
  return (
    <div className="empty anim-fadeUp">
      {emoji && <div className="empty__emoji">{emoji}</div>}
      <h3 className="empty__title">{title}</h3>
      {subtitle && <p className="empty__subtitle">{subtitle}</p>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}
