const CATEGORY_LABELS = {
  alltime: "Alltime Favorites",
  current: "Current Favourites",
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/charts/public/${username}`, {
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    return (
      <main style={{ padding: 20, maxWidth: 800 }}>
        <h1>Needle25</h1>
        <h2>Public Charts</h2>
        <p>{data.error || "Could not load public charts."}</p>
      </main>
    );
  }

  const grouped = groupChartsByCategory(data.charts);

  return (
    <main style={{ padding: 20, maxWidth: 800 }}>
      <h1>Needle25</h1>
      <h2>Public Charts</h2>

      <p>
        Charts by <strong>{data.user.username}</strong>
      </p>

      {data.charts.length === 0 ? (
        <p>No public chart entries yet.</p>
      ) : (
        <>
          <section style={{ marginTop: 30 }}>
            <h3>{CATEGORY_LABELS.alltime}</h3>
            {grouped.alltime.length === 0 ? (
              <p>No entries yet.</p>
            ) : (
              <ul>
                {grouped.alltime.map((item) => (
                  <li key={item.id} style={{ marginBottom: 16 }}>
                    <div>
                      <strong>{item.artist}</strong> – {item.title}
                    </div>
                    {item.comment ? (
                      <p style={{ margin: "6px 0" }}>{item.comment}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section style={{ marginTop: 30 }}>
            <h3>{CATEGORY_LABELS.current}</h3>
            {grouped.current.length === 0 ? (
              <p>No entries yet.</p>
            ) : (
              <ul>
                {grouped.current.map((item) => (
                  <li key={item.id} style={{ marginBottom: 16 }}>
                    <div>
                      <strong>{item.artist}</strong> – {item.title}
                    </div>
                    {item.comment ? (
                      <p style={{ margin: "6px 0" }}>{item.comment}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section style={{ marginTop: 30 }}>
            <h3>{CATEGORY_LABELS.recommendation}</h3>
            {grouped.recommendation.length === 0 ? (
              <p>No entries yet.</p>
            ) : (
              <ul>
                {grouped.recommendation.map((item) => (
                  <li key={item.id} style={{ marginBottom: 16 }}>
                    <div>
                      <strong>{item.artist}</strong> – {item.title}
                    </div>
                    {item.comment ? (
                      <p style={{ margin: "6px 0" }}>{item.comment}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}