import React, { useState } from "react";

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: "#09090b",
    color: "#e4e4e7",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "#18181b",
    borderBottom: "1px solid #27272a",
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
  },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    background: "rgba(234, 88, 12, 0.15)",
    color: "#fb923c",
    padding: "3px 8px",
    borderRadius: 9999,
  },
  main: {
    flex: 1,
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    maxWidth: 480,
    width: "100%",
  },
  card: {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 12,
    padding: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
  },
  cardText: {
    fontSize: 13,
    color: "#a1a1aa",
    lineHeight: 1.5,
  },
  button: {
    background: "#ea580c",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  counter: {
    fontSize: 12,
    color: "#71717a",
  },
};

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>My Prototype</h1>
        <span style={styles.badge}>React</span>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>React Counter</h2>
          <p style={styles.cardText}>
            This is a starter JSX prototype using React 19. Click the button to increment.
          </p>
          <button
            style={{
              ...styles.button,
              background: count > 0 ? "#16a34a" : "#ea580c",
            }}
            onClick={() => setCount((c) => c + 1)}
          >
            Count: {count}
          </button>
          <p style={styles.counter}>
            {count === 0
              ? "Click the button to start"
              : `Clicked ${count} time${count === 1 ? "" : "s"}`}
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Getting Started</h2>
          <p style={styles.cardText}>
            Edit this file to build your React prototype. It will be auto-transpiled
            and rendered with React 19. You can use hooks, state, and JSX.
          </p>
        </div>
      </main>
    </div>
  );
}
