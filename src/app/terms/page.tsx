export default function TermsPage() {
  return (
    <main className="container max-w-4xl py-10 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Terms of Use</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          By using EcoSpark Hub, you agree to use the platform responsibly and lawfully.
        </p>
      </header>

      <section className="rounded-2xl border bg-card p-6 space-y-4 text-sm text-muted-foreground">
        <p>
          Users are responsible for the ideas and comments they submit. Content that is harmful,
          abusive, misleading, or violates applicable laws may be removed by administrators.
        </p>
        <p>
          Paid ideas require valid payment before access is granted. Refund requests and disputes
          are subject to payment provider rules and applicable platform policy.
        </p>
        <p>
          EcoSpark Hub may update these terms over time. Continued use of the portal means you
          accept the updated terms.
        </p>
      </section>
    </main>
  );
}
