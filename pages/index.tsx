// pages/index.tsx
export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24, lineHeight: 1.6 }}>
      <h1>Welcome to IDR</h1>
      <p>This is a minimal landing page so you don’t see a 404 on the root URL.</p>
      <ul>
        <li><a href="/api/modules">/api/modules</a></li>
        <li><a href="/api/badges">/api/badges</a></li>
        <li><a href="/api/roadmap">/api/roadmap</a></li>
        <li><a href="/api/db-test">/api/db-test</a></li>
      </ul>
    </main>
  );
}
