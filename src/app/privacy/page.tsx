export default function PrivacyPage() {
  return (
    <main className="container max-w-4xl py-10 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We value your privacy and protect your personal information.
        </p>
      </header>

      <section className="rounded-2xl border bg-card p-6 space-y-4 text-sm text-muted-foreground">
        <p>
          EcoSpark Hub collects account and activity data to provide portal features such as
          authentication, idea moderation, voting, and payments.
        </p>
        <p>
          We do not sell your personal information. Data is used only for platform functionality,
          security, analytics, and service improvement.
        </p>
        <p>
          By using this platform, you consent to this privacy policy. Contact
          support@ecosparkhub.org for privacy-related requests.
        </p>
      </section>
    </main>
  );
}
