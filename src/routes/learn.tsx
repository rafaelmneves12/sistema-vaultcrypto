import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Search, X } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  glossary,
  glossaryCategory,
  learnCategories,
  type LearnTopic,
} from "@/data/learnContent";

export const Route = createFileRoute("/learn")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Crypto Learning Center — Guides & Glossary | VaultX" },
      {
        name: "description",
        content:
          "Learn crypto from the ground up: blockchain, Bitcoin, Ethereum, stablecoins, wallets, DeFi, staking, tokenomics, security and a full glossary.",
      },
      { property: "og:title", content: "Crypto Learning Center | VaultX" },
      {
        property: "og:description",
        content: "Everything you need to know before investing in cryptocurrency.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <LearnPage />
    </ProtectedRoute>
  ),
});

const ALPHABET = ["All", ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];

function matches(topic: LearnTopic, q: string) {
  if (!q) return true;
  const haystack = [topic.title, topic.summary, ...topic.paragraphs, ...(topic.subtopics ?? []).flatMap((s) => [s.title, s.body])]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function LearnPage() {
  const [activeId, setActiveId] = useState<string>(learnCategories[0].id);
  const [query, setQuery] = useState("");
  const [openTopic, setOpenTopic] = useState<LearnTopic | null>(null);
  const [letter, setLetter] = useState("All");
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      learnCategories
        .map((c) => ({ ...c, topics: c.topics.filter((t) => matches(t, q)) }))
        .filter((c) => c.topics.length > 0),
    [q],
  );

  const glossaryMatches = useMemo(
    () =>
      glossary.filter((g) => {
        const byLetter = letter === "All" || g.term.toUpperCase().startsWith(letter);
        const byQuery = !q || `${g.term} ${g.definition}`.toLowerCase().includes(q);
        return byLetter && byQuery;
      }),
    [letter, q],
  );

  const showingGlossary = activeId === glossaryCategory.id;
  const visibleCategories = q ? filtered : learnCategories.filter((c) => c.id === activeId);

  const navItems = [
    ...learnCategories.map((c) => ({ id: c.id, label: c.label, icon: c.icon, count: c.topics.length })),
    { id: glossaryCategory.id, label: glossaryCategory.label, icon: glossaryCategory.icon, count: glossary.length },
  ];

  function onSheetScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max <= 0 ? 100 : Math.min(100, Math.round((el.scrollTop / max) * 100)));
  }

  function openArticle(topic: LearnTopic) {
    setProgress(0);
    setOpenTopic(topic);
  }

  return (
    <DashboardShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Crypto Learning Center</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything you need to know before investing in cryptocurrency.
        </p>
      </motion.div>

      <div className="relative mt-6 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topics, terms, concepts..."
          aria-label="Search learning topics"
          className="h-11 pl-9"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Category nav: sidebar on desktop, scrollable tabs on mobile */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {navItems.map((item) => {
              const active = !q && activeId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveId(item.id);
                  }}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors lg:w-full",
                    active
                      ? "bg-primary/15 text-primary ring-1 ring-primary/25"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  <span className="ml-auto hidden text-xs text-muted-foreground lg:inline">{item.count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0">
          {q && (
            <p className="mb-4 text-sm text-muted-foreground">
              {filtered.reduce((n, c) => n + c.topics.length, 0) + glossaryMatches.length} results for “{query}”
            </p>
          )}

          {(!showingGlossary || q) && (
            <div className="space-y-8">
              {visibleCategories.map((category) => (
                <section key={category.id}>
                  <h2 className="font-display text-lg font-semibold">{category.label}</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {category.topics.map((topic, i) => (
                      <motion.button
                        key={topic.id}
                        type="button"
                        onClick={() => openArticle(topic)}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.06 }}
                        className="glass-panel card-hover rounded-2xl p-5 text-left"
                      >
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                          <topic.icon className="h-5 w-5" />
                        </span>
                        <h3 className="font-display mt-4 text-base font-semibold">{topic.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{topic.summary}</p>
                        {topic.subtopics && (
                          <p className="mt-3 text-xs font-medium text-primary">
                            {topic.subtopics.length} subtopics · Read article
                          </p>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </section>
              ))}
              {visibleCategories.length === 0 && glossaryMatches.length === 0 && (
                <div className="glass-panel rounded-2xl p-10 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">No topics matched your search.</p>
                  <p className="mt-1 text-sm text-muted-foreground">Try a broader term, like “wallet” or “staking”.</p>
                </div>
              )}
            </div>
          )}

          {(showingGlossary || (q && glossaryMatches.length > 0)) && (
            <section className={cn(q && "mt-8")}>
              <h2 className="font-display text-lg font-semibold">Crypto Glossary</h2>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {ALPHABET.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLetter(l)}
                    className={cn(
                      "h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition-colors",
                      letter === l
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/60 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <dl className="mt-5 space-y-3">
                {glossaryMatches.map((entry) => (
                  <div key={entry.term} className="glass-panel rounded-xl px-5 py-4">
                    <dt className="text-sm font-semibold text-foreground">{entry.term}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{entry.definition}</dd>
                  </div>
                ))}
                {glossaryMatches.length === 0 && (
                  <p className="text-sm text-muted-foreground">No terms found for this filter.</p>
                )}
              </dl>
            </section>
          )}
        </div>
      </div>

      <Sheet open={!!openTopic} onOpenChange={(open) => !open && setOpenTopic(null)}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
          <SheetTitle className="sr-only">{openTopic?.title ?? "Article"}</SheetTitle>
          <div className="h-1 w-full bg-secondary/60">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div ref={scrollRef} onScroll={onSheetScroll} className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            <AnimatePresence mode="wait">
              {openTopic && (
                <motion.article
                  key={openTopic.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                    <openTopic.icon className="h-5 w-5" />
                  </span>
                  <h2 className="font-display mt-4 text-2xl font-bold tracking-tight">{openTopic.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{openTopic.summary}</p>

                  <div className="mt-6 space-y-4">
                    {openTopic.paragraphs.map((p) => (
                      <p key={p.slice(0, 32)} className="text-sm leading-relaxed text-muted-foreground">
                        {p}
                      </p>
                    ))}
                  </div>

                  {openTopic.subtopics && (
                    <div className="mt-8 space-y-3">
                      <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                        Key subtopics
                      </h3>
                      {openTopic.subtopics.map((s) => (
                        <div key={s.title} className="rounded-xl border border-border/60 bg-surface-elevated/50 p-4">
                          <p className="text-sm font-semibold text-foreground">{s.title}</p>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="mt-8 text-xs text-muted-foreground">
                    Educational content only — VaultX does not provide financial advice and never buys, sells or
                    transfers assets.
                  </p>
                </motion.article>
              )}
            </AnimatePresence>
          </div>
          <div className="border-t border-border/60 p-4">
            <Button variant="secondary" className="w-full" onClick={() => setOpenTopic(null)}>
              Close article
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardShell>
  );
}
