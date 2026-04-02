import pool from "@/lib/db";
import { notFound } from "next/navigation";
import Head from "next/head";

export async function generateMetadata() {
  return {
    title: "Record Charts – Needle25",
    description: "Personal music charts - vinyl, cd, tape and more.",
  };
}

const CATEGORY_LABELS = {
  alltime: "All-time favorites",
  current: "Current favorites",
  recommendation: "Recommendations",
};

export default async function PublicChartsPage({ params }) {
  const { username } = await params;

  // User holen
  const userResult = await pool.query(
    "SELECT id, username FROM users WHERE username = $1",
    [username]
  );

  if (userResult.rowCount === 0) {
    return notFound();
  }

  const user = userResult.rows[0];

  // Charts holen
  const chartsResult = await pool.query(
    `SELECT id, artist, title, category, comment
     FROM charts
     WHERE user_id = $1 AND is_public = true
     ORDER BY category ASC, id DESC`,
    [user.id]
  );

  const charts = chartsResult.rows;

  // Gruppieren
  const grouped = {
    alltime: [],
    current: [],
    recommendation: [],
  };

  for (const item of charts) {
    if (grouped[item.category]) {
      grouped[item.category].push(item);
    }
  }

  return (
    <>
      <Head>
        <meta property="og:title" content={`Needle25 – Deine Charts von ${user.username}`} />
        <meta property="og:description" content="Teile deine Charts mit Freunden!" />
        <meta property="og:image" content="https://needle25.vercel.app/" />
        <meta property="og:url" content={`https://needle25.vercel.app/charts/${user.username}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main
        style={{
          background: "#0b0b0b",
          minHeight: "100vh",
          color: "#fff",
          padding: 30,
        }}
      >
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h1 style={{ fontSize: 28, marginBottom: 10 }}>
            Needle25
          </h1>

          <p style={{ color: "#888", marginBottom: 30 }}>
            Charts by <strong>{user.username}</strong>
          </p>

          {Object.entries(grouped).map(([key, items]) => (
            <section key={key} style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, marginBottom: 12 }}>
                {CATEGORY_LABELS[key]}
              </h2>

              {items.length === 0 ? (
                <p style={{ color: "#666" }}>No entries</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {items.map((item) => (
                    <li
                      key={item.id}
                      style={{
                        padding: "12px 0",
                        borderBottom: "1px solid #222",
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>
                        {item.artist}
                      </div>

                      <div style={{ color: "#aaa", fontSize: 14 }}>
                        {item.title}
                      </div>

                      {item.comment && (
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 13,
                            color: "#777",
                          }}
                        >
                          {item.comment}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>
    </>
  );
}