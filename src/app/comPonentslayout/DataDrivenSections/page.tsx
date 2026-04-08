"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, FolderKanban, Flame, MessageCircleMore, Sparkles, Trophy } from "lucide-react";

import { getIdeas, Idea } from "@/services/ideas";
import { getCategories } from "@/services/category";

function ideaVotes(idea: Idea) {
  return idea._count?.votes ?? idea.votes?.length ?? 0;
}

function ideaComments(idea: Idea) {
  return idea._count?.comments ?? 0;
}

function AnimatedBlock({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  overline,
  title,
  icon,
}: {
  overline: string;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300 mb-1">
          {overline}
        </p>
        <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-200">
            {icon}
          </span>
          {title}
        </h2>
      </div>
    </div>
  );
}

export default function DataDrivenSections() {
  const { data: ideasData, isLoading: ideasLoading } = useQuery({
    queryKey: ["ideas"],
    queryFn: getIdeas,
    staleTime: 3 * 60 * 1000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });

  const ideas = ideasData ?? [];
  const approvedIdeas = ideas.filter((idea) => idea.status === "APPROVED");

  const totalVotes = useMemo(
    () => ideas.reduce((sum, idea) => sum + ideaVotes(idea), 0),
    [ideas]
  );

  const totalComments = useMemo(
    () => ideas.reduce((sum, idea) => sum + ideaComments(idea), 0),
    [ideas]
  );

  const paidIdeas = useMemo(
    () => approvedIdeas.filter((idea) => idea.isPaid).slice(0, 3),
    [approvedIdeas]
  );

  const freeIdeas = useMemo(
    () => approvedIdeas.filter((idea) => !idea.isPaid).slice(0, 3),
    [approvedIdeas]
  );

  const recentIdeas = useMemo(
    () =>
      [...approvedIdeas]
        .sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 4),
    [approvedIdeas]
  );

  const mostDiscussed = useMemo(
    () =>
      [...approvedIdeas]
        .sort((a, b) => ideaComments(b) - ideaComments(a))
        .slice(0, 3),
    [approvedIdeas]
  );

  const topContributors = useMemo(() => {
    const contributorMap = new Map<string, { name: string; ideaCount: number }>();

    for (const idea of approvedIdeas) {
      const id = idea.author?.id ?? idea.authorId;
      if (!id) continue;
      const name = idea.author?.name ?? "Community Member";
      const current = contributorMap.get(id);
      if (current) {
        current.ideaCount += 1;
      } else {
        contributorMap.set(id, { name, ideaCount: 1 });
      }
    }

    return [...contributorMap.values()]
      .sort((a, b) => b.ideaCount - a.ideaCount)
      .slice(0, 5);
  }, [approvedIdeas]);

  const topCategories = useMemo(() => {
    const categoryCount = new Map<string, number>();

    for (const idea of approvedIdeas) {
      const categoryName = idea.category?.name;
      if (!categoryName) continue;
      categoryCount.set(categoryName, (categoryCount.get(categoryName) ?? 0) + 1);
    }

    return [...categoryCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [approvedIdeas]);

  if (ideasLoading) {
    return null;
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-800/30" />
      <div className="pointer-events-none absolute top-1/3 -left-16 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl dark:bg-emerald-900/30" />

      <section className="container py-6 md:py-8">
        <AnimatedBlock>
          <div className="rounded-3xl border border-emerald-100 dark:border-emerald-900/70 bg-linear-to-r from-emerald-900 via-emerald-800 to-emerald-900 p-6 md:p-8 shadow-lg shadow-emerald-900/20">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200 mb-2">Data Driven Highlights</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              Live Community Insights From Your Backend
            </h2>
            <p className="text-sm md:text-base text-emerald-100/90 mt-3 max-w-2xl">
              Every section below is generated from ideas, votes, comments, categories,
              and contributor activity fetched from your API.
            </p>
          </div>
        </AnimatedBlock>
      </section>

      <section className="container py-6 md:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedBlock>
            <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/70 bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300 mb-1">Approved</p>
              <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                {approvedIdeas.length}
              </p>
              <p className="text-sm text-muted-foreground">Approved ideas</p>
            </div>
          </AnimatedBlock>
          <AnimatedBlock delay={0.05}>
            <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/70 bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300 mb-1">Votes</p>
              <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                {totalVotes}
              </p>
              <p className="text-sm text-muted-foreground">Total votes</p>
            </div>
          </AnimatedBlock>
          <AnimatedBlock delay={0.1}>
            <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/70 bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300 mb-1">Discussion</p>
              <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                {totalComments}
              </p>
              <p className="text-sm text-muted-foreground">Total comments</p>
            </div>
          </AnimatedBlock>
          <AnimatedBlock delay={0.15}>
            <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/70 bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300 mb-1">Topics</p>
              <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                {categoriesData?.length ?? 0}
              </p>
              <p className="text-sm text-muted-foreground">Active categories</p>
            </div>
          </AnimatedBlock>
        </div>
      </section>

      <section className="container py-10 space-y-5">
        <SectionHeading overline="Categories" title="Most active topics" icon={<FolderKanban className="h-4 w-4" />} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {topCategories.map(([name, count], index) => (
            <AnimatedBlock key={name} delay={index * 0.03}>
              <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/70 bg-card px-4 py-3 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/30 transition-colors">
                <p className="font-semibold text-emerald-800 dark:text-emerald-200">{name}</p>
                <p className="text-xs text-muted-foreground">{count} ideas</p>
              </div>
            </AnimatedBlock>
          ))}
        </div>
      </section>

      <section className="container py-10 space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <SectionHeading overline="Fresh updates" title="Recent ideas (blog-style)" icon={<Flame className="h-4 w-4" />} />
          </div>
          <Link href="/ideas" className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">
            Browse all
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentIdeas.map((idea, index) => (
            <AnimatedBlock key={idea.id} delay={index * 0.05}>
              <Link href={`/All.ideas/${idea.id}`} className="rounded-2xl border border-emerald-100 dark:border-emerald-900/70 bg-card p-5 hover:shadow-md transition-shadow block">
                <p className="text-xs text-emerald-600 dark:text-emerald-300 mb-2">{idea.category?.name ?? "General"}</p>
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 line-clamp-2">{idea.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{idea.description || idea.problem}</p>
              </Link>
            </AnimatedBlock>
          ))}
        </div>
      </section>

      <section className="container py-10 space-y-5">
        <SectionHeading overline="Discussions" title="Most discussed ideas" icon={<MessageCircleMore className="h-4 w-4" />} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mostDiscussed.map((idea, index) => (
            <AnimatedBlock key={idea.id} delay={index * 0.05}>
              <Link href={`/All.ideas/${idea.id}`} className="rounded-2xl border border-emerald-100 dark:border-emerald-900/70 bg-card p-5 block hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 line-clamp-2">{idea.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {ideaComments(idea)} comments
                </p>
              </Link>
            </AnimatedBlock>
          ))}
        </div>
      </section>

      <section className="container py-10 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnimatedBlock>
          <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/70 bg-card p-6 space-y-4 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300 mb-1">
              Premium
            </p>
            <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">Paid idea opportunities</h2>
          </div>
          <div className="space-y-3">
            {paidIdeas.map((idea) => (
              <Link key={idea.id} href={`/All.ideas/${idea.id}`} className="block rounded-xl border border-emerald-100 dark:border-emerald-900/70 px-4 py-3">
                <p className="font-semibold text-emerald-800 dark:text-emerald-200 line-clamp-1">{idea.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {typeof idea.price === "number" ? `$${idea.price.toFixed(2)}` : "Premium"}
                </p>
              </Link>
            ))}
          </div>
          </div>
        </AnimatedBlock>

        <AnimatedBlock delay={0.08}>
          <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/70 bg-card p-6 space-y-4 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300 mb-1">
              Free to start
            </p>
            <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">Community free ideas</h2>
          </div>
          <div className="space-y-3">
            {freeIdeas.map((idea) => (
              <Link key={idea.id} href={`/All.ideas/${idea.id}`} className="block rounded-xl border border-emerald-100 dark:border-emerald-900/70 px-4 py-3">
                <p className="font-semibold text-emerald-800 dark:text-emerald-200 line-clamp-1">{idea.title}</p>
                <p className="text-xs text-muted-foreground mt-1">No payment required</p>
              </Link>
            ))}
          </div>
          </div>
        </AnimatedBlock>
      </section>

      <section className="container py-10 space-y-5">
        <SectionHeading overline="Contributors" title="Top contributors" icon={<Trophy className="h-4 w-4" />} />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {topContributors.map((contributor, index) => (
            <AnimatedBlock key={contributor.name} delay={index * 0.03}>
              <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/70 bg-card px-4 py-4 text-center hover:bg-emerald-50/60 dark:hover:bg-emerald-900/30 transition-colors">
                <p className="font-semibold text-emerald-800 dark:text-emerald-200 line-clamp-1">{contributor.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{contributor.ideaCount} approved ideas</p>
              </div>
            </AnimatedBlock>
          ))}
        </div>
      </section>

      <section className="container py-12">
        <AnimatedBlock>
          <div className="rounded-3xl border border-emerald-100 dark:border-emerald-900/70 bg-linear-to-br from-white to-emerald-100/60 dark:from-emerald-950 dark:to-emerald-900/70 p-7 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-lg shadow-emerald-200/30 dark:shadow-emerald-950/50">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300 mb-1 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Call to action
            </p>
            <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Share your next sustainable idea</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              Join {topContributors.length > 0 ? topContributors.length : "many"} active contributors and help the community grow beyond {approvedIdeas.length} approved ideas.
            </p>
          </div>
          <Link
            href="/dashboard/create-idea"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            Submit an idea
          </Link>
          </div>
        </AnimatedBlock>
      </section>
    </div>
  );
}
