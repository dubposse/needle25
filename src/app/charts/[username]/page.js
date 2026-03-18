const CATEGORY_LABELS = {
  alltime: "All-time favorites",
  current: "Current favorites",
  recommendation: "Recommendations",
};

function groupChartsByCategory(charts) {
  return {
    alltime: charts.filter((item) => item.category === "alltime"),
    current: charts.filter((item) => item.category === "current"),
    recommendation: charts.filter((item) => item.category === "recommendation"),
  };
}

function ChartItem({ item }) {
  return (
    <li
      style={{
        padding: "12px 0",
        borderBottom: "1px solid #222",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 500 }}>
        {item.artist}
      </div>

      <div
        style={{
          fontSize: 14,
          color: "#aaa",
        }}
      >
        {item.title}
      </div>

      {item.comment ? (
        <div
          style={{
            marginTop: 6,
            fontSize: 13,
            color: "#666",
          }}
        >
          {item.comment}
        </div>
      ) : null}
    </li>
  );
}

function CategorySection({ title, items }) {
  return (
    <section style={{ marginTop: 50 }}>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        {title}
      </h3>

      {items.length === 0 ? (
        <p style={{ color: "#666" }}>No entries yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((item) => (
            <ChartItem key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function PublicChartsPage({ params }) {
  const { username } = await params;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/charts/public/${username}`, {
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    return (
      <main style={{ padding: 30, maxWidth: 700 }}>
        <h1 style={{ color: "#fff" }}>Needle25</h1>
        <p style={{ color: "#888" }}>
          {data.error || "Could not load public charts."}
        </p>
      </main>
    );
  }

  const grouped = groupChartsByCategory(data.charts);

  return (
    <main
      style={{
        background: "#0b0b0b",
        minHeight: "100vh",
        color: "#fff",
        padding: 30,
      }}
    >
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          Needle25
        </h1>

        <p
          style={{
            color: "#888",
            marginBottom: 30,
          }}
        >
          Charts by <strong>{data.user.username}</strong>
        </p>

        {data.charts.length === 0 ? (
          <p style={{ color: "#666" }}>
            No public chart entries yet.
          </p>
        ) : (
          <>
            <CategorySection
              title={CATEGORY_LABELS.alltime}
              items={grouped.alltime}
            />

            <CategorySection
              title={CATEGORY_LABELS.current}
              items={grouped.current}
            />

            <CategorySection
              title={CATEGORY_LABELS.recommendation}
              items={grouped.recommendation}
            />
          </>
        )}
      </div>
    </main>
  );
}