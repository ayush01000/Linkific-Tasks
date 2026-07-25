import { currency } from "../../utils/currency";

const SAVINGS_GOAL = 100000;

export default function SavingsGoal({ savings }) {
  const percentage = Math.min(
    Math.round((Number(savings || 0) / SAVINGS_GOAL) * 100),
    100,
  );

  return (
    <article className="goal-card">
      <p className="eyebrow">SAVINGS GOAL</p>
      <h2>Emergency fund</h2>

      <p className="goal-description">
        Work towards six months of financial security.
      </p>

      <div
        className="goal-circle"
        style={{
          background: `
            radial-gradient(
              circle,
              #15151e 59%,
              transparent 60%
            ),
            conic-gradient(
              #9b87f5 0 ${percentage}%,
              #292936 ${percentage}% 100%
            )
          `,
        }}
      >
        <div>
          <strong>{percentage}%</strong>
          <span>complete</span>
        </div>
      </div>

      <div className="goal-numbers">
        <span>Saved</span>

        <strong>
          {currency(savings)} / ₹1,00,000
        </strong>
      </div>
    </article>
  );
}