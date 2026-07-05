import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({ items }) {
  return (
    <nav className="app-container pt-8 text-sm text-muted" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-2">
            {index > 0 && <ChevronRight size={14} aria-hidden="true" />}
            {index === items.length - 1 ? (
              <span className="text-white">{item.label}</span>
            ) : (
              <Link to={item.href} className="hover:text-white">{item.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
