"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown, Crown, Sparkles, Users, Wallet } from "lucide-react";
import Hero3DCanvas from "@/components/Hero3DCanvas";
import ParticipantForm from "@/components/ParticipantForm";
import CrownVotingForm from "@/components/CrownVotingForm";
import VoteGraph from "@/components/VoteGraph";
import { CROWN_CATEGORIES, EVENT_TITLE, SCHOOL_NAME } from "@/lib/constants";
import type { CandidateTally } from "@/lib/voteCounter";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>(
    CROWN_CATEGORIES[0].id
  );
  const [voteResults, setVoteResults] = useState<CandidateTally[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [knownCandidates, setKnownCandidates] = useState<string[]>([]);
  const [loadingVotes, setLoadingVotes] = useState(false);

  const [participantStats, setParticipantStats] = useState({
    total: 0,
    willingToPayCount: 0,
    mode: "supabase" as "supabase" | "demo",
  });

  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch("/api/participants", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setParticipantStats({
        total: data.total ?? 0,
        willingToPayCount: data.willingToPayCount ?? 0,
        mode: data.mode ?? "supabase",
      });
    } catch {
      // Ignore transient fetch errors on initial load
    }
  }, []);

  const fetchVotes = useCallback(async (category: string) => {
    setLoadingVotes(true);
    try {
      const res = await fetch(
        `/api/votes?category=${encodeURIComponent(category)}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data = await res.json();
      setVoteResults(data.results ?? []);
      setTotalVotes(data.totalVotes ?? 0);
      setKnownCandidates(data.knownCandidates ?? []);
    } finally {
      setLoadingVotes(false);
    }
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  useEffect(() => {
    fetchVotes(selectedCategory);
  }, [fetchVotes, selectedCategory]);

  useGSAP(
    () => {
      gsap.from(".hero-stagger", {
        y: 36,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        clearProps: "transform",
      });

      gsap.utils.toArray<HTMLElement>(".reveal-section").forEach((section) => {
        gsap.from(section, {
          y: 44,
          opacity: 0,
          duration: 0.85,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            once: true,
          },
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="relative min-h-screen">
      <Hero3DCanvas />

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-obsidian/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Crown className="h-5 w-5 text-gold-400" />
            <span className="font-display text-sm font-bold tracking-wide text-white sm:text-base">
              KV3 JHANSI &bull; ADIEU XII
            </span>
          </div>
          <nav className="flex items-center gap-4 text-xs font-semibold text-zinc-300 sm:gap-6 sm:text-sm">
            <a href="#register" className="transition hover:text-gold-300">
              Register
            </a>
            <a href="#vote" className="transition hover:text-gold-300">
              Vote
            </a>
            <a href="#results" className="transition hover:text-gold-300">
              Live Graph
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto flex min-h-[82vh] max-w-5xl flex-col items-center justify-center px-5 py-20 text-center">
        <div className="hero-stagger mb-5 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-300">
          <Sparkles className="h-3.5 w-3.5" />
          {SCHOOL_NAME}
        </div>

        <h1 className="hero-stagger font-display text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-7xl">
          One Last Night.{" "}
          <span className="gold-gradient-text block sm:inline">
            Forever Legends.
          </span>
        </h1>

        <p className="hero-stagger mt-6 max-w-2xl text-base text-zinc-300 sm:text-lg">
          Welcome to the official {EVENT_TITLE} portal. Register your Class XII
          attendance, vote for the KV Farewell Crowns, and watch the live tally
          unfold.
        </p>

        {/* Live Counters */}
        <div className="hero-stagger mt-9 grid w-full max-w-xl grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <Users className="h-4 w-4 text-gold-400" />
              Registered
            </div>
            <p className="mt-1 font-display text-3xl font-extrabold text-white">
              {participantStats.total}
            </p>
          </div>
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <Wallet className="h-4 w-4 text-emerald-400" />
              Willing to Pay
            </div>
            <p className="mt-1 font-display text-3xl font-extrabold text-emerald-300">
              {participantStats.willingToPayCount}
            </p>
          </div>
        </div>

        <div className="hero-stagger mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="#register"
            className="rounded-full bg-gold-400 px-7 py-3.5 text-sm font-bold text-black shadow-glow transition hover:scale-105"
          >
            Register for Farewell
          </a>
          <a
            href="#vote"
            className="rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:border-purple-400/60 hover:bg-purple-500/10"
          >
            Vote for Crowns
          </a>
        </div>

        <a
          href="#register"
          aria-label="Scroll down"
          className="hero-stagger mt-14 animate-bounce text-zinc-500 hover:text-gold-300"
        >
          <ArrowDown className="h-5 w-5" />
        </a>
      </section>

      {/* Main Forms Grid */}
      <main className="mx-auto max-w-6xl space-y-16 px-5 pb-28">
        <section
          id="register"
          className="reveal-section grid grid-cols-1 gap-8 lg:grid-cols-2"
        >
          <ParticipantForm onRegistered={fetchParticipants} />
          <div id="vote">
            <CrownVotingForm
              knownCandidates={knownCandidates}
              onVoteCast={(cat) => {
                setSelectedCategory(cat);
                fetchVotes(cat);
              }}
            />
          </div>
        </section>

        {/* Live Vote Graph */}
        <section id="results" className="reveal-section">
          <VoteGraph
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            results={voteResults}
            totalVotes={totalVotes}
            loading={loadingVotes}
            onRefresh={() => fetchVotes(selectedCategory)}
          />
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-500">
        Built for {SCHOOL_NAME} &bull; {EVENT_TITLE}
      </footer>
    </div>
  );
}
