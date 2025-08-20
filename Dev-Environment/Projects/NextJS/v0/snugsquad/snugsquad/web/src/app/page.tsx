export default function Home() {
  return (
    <main className="min-h-screen bg-semantic-bg text-semantic-fg">
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h1 data-testid="brand-title" className="text-h1 font-heading text-brand-primary mb-4">
            SnugSquad
          </h1>
          <p data-testid="brand-subtitle" className="text-lg font-ui text-semantic-fg/80">
            Personalized home care made human.
          </p>
        </div>
      </section>
      <section className="py-12 bg-brand-surface">
        <div className="mx-auto max-w-4xl px-6">
          <div data-testid="brand-card" className="rounded-xl border border-semantic-border bg-semantic-bg p-6 shadow-sm">
            <p className="font-body">If you can see plum and lavender, the theme loaded correctly.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
