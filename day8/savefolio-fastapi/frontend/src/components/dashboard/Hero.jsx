import { currency } from "../../utils/currency";

export default function Hero({ savings }) {
  return (
    <section className="hero" id="overview">
      <div>
        <p className="eyebrow">
          PERSONAL FINANCE DASHBOARD
        </p>

        <h1>
          Make every rupee
          <span> count.</span>
        </h1>

        <p className="hero-description">
          Track your income, understand your spending, and
          watch your savings grow from one simple dashboard.
        </p>
      </div>

      <div className="hero-balance">
        <p>Your savings</p>
        <strong>{currency(savings)}</strong>

        <span>
          Build small habits. Create meaningful progress.
        </span>
      </div>
    </section>
  );
}