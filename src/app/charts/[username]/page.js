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

export default async function PublicChartsPage({ params }) {
  const { username } = await params;

  const res = await fetch(`/api/charts/public/${username}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main style={{ padding: 30, maxWidth: 700 }}>
        <h1>Needle25</h1>
        <p>Could not load public charts.</p>
      </main>
    );
  }

  const data = await res.json();
  const grouped = groupChartsByCategory(data.charts || []);

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
          <p style={{ color: "#666" }}>No public chart entries yet.</p>
        ) : (
          <>
            <section style={{ marginTop: 50 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                {CATEGORY_LABELS.alltime}
              </h3>
              {grouped.alltime.length === 0 ? (
                <p style={{ color: "#666" }}>No entries yet.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {grouped.alltime.map((item) => (
                    <li
                      key={item.id}
                      style={{
                        padding: "12px 0",
                        borderBottom: "1px solid #222",
                      }}
                    >
                      <div style={{ fontSize: 16, fontWeight: 500 }}>
                        {item.artist}
                      </div>
                      <div style={{ fontSize: 14, color: "#aaa" }}>
                        {item.title}
                      </div>
                      {item.comment ? (
                        <div style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
                          {item.comment}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section style={{ marginTop: 50 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                {CATEGORY_LABELS.current}
              </h3>
              {grouped.current.length === 0 ? (
                <p style={{ color: "#666" }}>No entries yet.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {grouped.current.map((item) => (
                    <li
                      key={item.id}
                      style={{
                        padding: "12px 0",
                        borderBottom: "1px solid #222",
                      }}
                    >
                      <div style={{ fontSize: 16, fontWeight: 500 }}>
                        {item.artist}
                      </div>
                      <div style={{ fontSize: 14, color: "#aaa" }}>
                        {item.title}
                      </div>
                      {item.comment ? (
                        <div style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
                          {item.comment}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section style={{ marginTop: 50 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                {CATEGORY_LABELS.recommendation}
              </h3>
              {grouped.recommendation.length === 0 ? (
                <p style={{ color: "#666" }}>No entries yet.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {grouped.recommendation.map((item) => (
                    <li
                      key={item.id}
                      style={{
                        padding: "12px 0",
                        borderBottom: "1px solid #222",
                      }}
                    >
                      <div style={{ fontSize: 16, fontWeight: 500 }}>
                        {item.artist}
                      </div>
                      <div style={{ fontSize: 14, color: "#aaa" }}>
                        {item.title}
                      </div>
                      {item.comment ? (
                        <div style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
                          {item.comment}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}