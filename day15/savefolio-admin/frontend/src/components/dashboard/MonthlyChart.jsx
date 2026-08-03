export default function MonthlyChart({ data }) {
  const width = 700;
  const height = 260;
  const padding = 35;

  const maximum = Math.max(
    1,
    ...data.flatMap((item) => [
      Number(item.income),
      Number(item.expenses),
    ]),
  );

  function createPoints(key) {
    return data
      .map((item, index) => {
        const usableWidth = width - padding * 2;
        const usableHeight = height - padding * 2;

        const x =
          data.length === 1
            ? width / 2
            : padding +
              (index * usableWidth) /
                (data.length - 1);

        const y =
          height -
          padding -
          (Number(item[key]) / maximum) *
            usableHeight;

        return `${x},${y}`;
      })
      .join(" ");
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h2>Income vs expenses</h2>
          <p>Your activity during the last six months</p>
        </div>

        <div className="chart-legend">
          <span>
            <i className="legend-income" />
            Income
          </span>

          <span>
            <i className="legend-expense" />
            Expenses
          </span>
        </div>
      </div>

      <div className="chart-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Income and expense chart"
        >
          {[0, 1, 2, 3, 4].map((line) => {
            const y =
              padding +
              (line * (height - padding * 2)) / 4;

            return (
              <line
                key={line}
                x1={padding}
                x2={width - padding}
                y1={y}
                y2={y}
                className="chart-grid-line"
              />
            );
          })}

          <polyline
            points={createPoints("income")}
            className="chart-line chart-line--income"
          />

          <polyline
            points={createPoints("expenses")}
            className="chart-line chart-line--expense"
          />

          {data.map((item, index) => {
            const x =
              data.length === 1
                ? width / 2
                : padding +
                  (index * (width - padding * 2)) /
                    (data.length - 1);

            return (
              <text
                key={item.label}
                x={x}
                y={height - 8}
                textAnchor="middle"
                className="chart-label"
              >
                {item.label.split(" ")[0]}
              </text>
            );
          })}
        </svg>
      </div>
    </section>
  );
}