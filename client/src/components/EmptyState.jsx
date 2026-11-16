import { Ticket } from "lucide-react";
export default function EmptyState({
  title = "Nothing here yet",
  text = "Check back soon.",
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Ticket />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
