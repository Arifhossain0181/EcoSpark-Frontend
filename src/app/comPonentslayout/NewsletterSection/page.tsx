const NewsletterSection = () => {
    return (
        <section className="border-t bg-muted/40 py-12 md:py-16">
            <div className="container flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-3">
                    <h2 className="text-2xl md:text-3xl font-bold">
                        Stay updated with EcoSpark
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-xl">
                        Get a monthly digest of new sustainability ideas, top voted
                        projects, and important announcements from the EcoSpark community.
                    </p>
                </div>
                <form className="flex-1 flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <input
                        type="email"
                        required
                        placeholder="Enter your email address"
                        className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
                    >
                        Subscribe
                    </button>
                </form>
            </div>
        </section>
    );
};

export default NewsletterSection;