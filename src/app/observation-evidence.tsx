import { Quote } from "lucide-react";

export function ObservationEvidence({ quote, text }: { quote?: string; text: string }) {
  const highlight = quote && quote !== text;
  return (
    <div className="observation-evidence">
      <blockquote>
        <Quote aria-hidden="true" size={17} />
        <span>{quote || text}</span>
      </blockquote>
      {highlight && (
        <details>
          <summary>Pełna notatka</summary>
          <p className="observation-original">{text}</p>
        </details>
      )}
    </div>
  );
}
