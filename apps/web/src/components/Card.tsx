interface CardProps {
  kind: "black" | "white";
  text: string;
  pick?: 1 | 2;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function Card({ kind, text, pick, selected, disabled, onClick }: CardProps) {
  const classes = ["card", `card--${kind}`];
  if (selected) classes.push("card--selected");
  if (disabled) classes.push("card--disabled");
  if (onClick) classes.push("card--clickable");

  return (
    <button
      type="button"
      className={classes.join(" ")}
      onClick={onClick}
      disabled={disabled || !onClick}
    >
      <span className="card__text">{text}</span>
      {kind === "black" && pick === 2 && <span className="card__badge">PICK 2</span>}
    </button>
  );
}
