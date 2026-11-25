"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Calendar, MapPin, Users, Wallet } from "lucide-react";
import Hero3DCanvas from "@/components/Hero3DCanvas";
import TiltCard from "@/components/TiltCard";
import ParticipantForm from "@/components/ParticipantForm";
import CrownVotingForm from "@/components/CrownVotingForm";
import VoteGraph from "@/components/VoteGraph";
import { CROWN_CATEGORIES, EVENT_TITLE, SCHOOL_NAME } from "@/lib/constants";
import type { CandidateTally } from "@/lib/voteCounter";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SCHOOL_LOGO_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQnNkkFI2cqfvb085dubJIIm0VRZ-N_Vu8NLog3QZeig&s";

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
      // Ignore transient load error
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
        y: 28,
        opacity: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "transform",
      });

      gsap.utils.toArray<HTMLElement>(".reveal-section").forEach((section) => {
        gsap.from(section, {
          y: 36,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: section,
            start: "top 86%",
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

      {/* Heritage Top Ribbon */}
      <div className="kvs-ribbon h-1.5 w-full" />

      {/* Editorial Masthead */}
      <header className="sticky top-0 z-30 border-b border-navy/10 bg-ivory/90 backdrop-blur-md dark:border-white/10 dark:bg-navy-deep/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <a href="#" className="flex items-center gap-3">
            <img
              src={SCHOOL_LOGO_URL}
              alt="PM SHRI KV No. 3 Jhansi Logo"
              className="h-11 w-11 rounded-full border border-navy/15 bg-white p-0.5 object-contain shadow-sm"
            />
            <div className="leading-tight">
              <p className="font-serif text-base font-bold text-navy dark:text-ivory sm:text-lg">
                KV No. 3, Jhansi
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-saffron dark:text-saffron-light">
                Class XII Farewell
              </p>
            </div>
          </a>

          <nav className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-navy/85 dark:text-ivory/85 sm:gap-7">
            <a href="#register" className="transition hover:text-saffron">
              RSVP
            </a>
            <a href="#vote" className="transition hover:text-saffron">
              Ballot
            </a>
            <a
              href="#results"
              className="rounded-full bg-navy px-4 py-2 text-ivory transition hover:bg-saffron dark:bg-brass-light dark:text-navy-deep"
            >
              Live Tally
            </a>
          </nav>
        </div>
      </header>

      {/* Split Editorial Hero */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 pb-20 pt-14 lg:grid-cols-12 lg:pt-20">
        <div className="lg:col-span-7">
          <p className="hero-stagger inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-saffron-dark dark:border-saffron-light/40 dark:text-saffron-light">
            {SCHOOL_NAME}
          </p>

          <h1 className="hero-stagger mt-6 font-serif text-5xl font-bold leading-[1.05] tracking-tight text-navy dark:text-ivory sm:text-7xl">
            The Final Bell.{" "}
            <span className="italic text-saffron dark:text-saffron-light">
              Class XII Adieu.
            </span>
          </h1>

          <p className="hero-stagger mt-5 max-w-xl text-base leading-relaxed text-navy/75 dark:text-ivory/75 sm:text-lg">
            Celebrating the outgoing batch of Kendriya Vidyalaya No. 3, Jhansi.
            Confirm your attendance for the {EVENT_TITLE}, vote for{" "}
            <strong className="font-semibold text-navy dark:text-ivory">
              Mr. Farewell
            </strong>{" "}
            &amp;{" "}
            <strong className="font-semibold text-navy dark:text-ivory">
              Miss Farewell
            </strong>
            , and track the live standings.
          </p>

          <div className="hero-stagger mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#register"
              className="inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-ivory shadow-editorial transition hover:bg-navy-soft dark:bg-brass-light dark:text-navy-deep"
            >
              Confirm Your RSVP
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#vote"
              className="inline-flex items-center gap-2 rounded-full border border-navy/25 bg-white/85 px-7 py-3.5 text-sm font-semibold text-navy transition hover:border-saffron hover:text-saffron dark:border-white/20 dark:bg-navy-deep/80 dark:text-ivory dark:hover:border-brass-light"
            >
              Vote for Crowns
            </a>
          </div>

          {/* Live Batch Counters */}
          <div className="hero-stagger mt-10 grid max-w-md grid-cols-2 gap-4">
            <div className="rounded-2xl border border-navy/15 bg-white/90 p-4 shadow-sm dark:border-white/15 dark:bg-navy-deep/85">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-navy/70 dark:text-ivory/70">
                <Users className="h-3.5 w-3.5 text-saffron" />
                Total RSVPs
              </div>
              <p className="mt-1 font-serif text-3xl font-bold text-navy dark:text-ivory">
                {participantStats.total}
              </p>
            </div>
            <div className="rounded-2xl border border-navy/15 bg-white/90 p-4 shadow-sm dark:border-white/15 dark:bg-navy-deep/85">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-navy/70 dark:text-ivory/70">
                <Wallet className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                Willing to Pay
              </div>
              <p className="mt-1 font-serif text-3xl font-bold text-emerald-800 dark:text-emerald-300">
                {participantStats.willingToPayCount}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive 3D-Tilt School Crest Gala Pass */}
        <div className="hero-stagger lg:col-span-5">
          <TiltCard className="navy-surface rounded-3xl p-8 text-ivory shadow-crest">
            <div className="flex items-center justify-between border-b border-ivory/20 pb-5">
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-brass-light">
                Official Gala Pass
              </span>
              <span className="rounded-full border border-brass-light/50 bg-brass/25 px-3 py-0.5 text-[11px] font-semibold text-brass-light">
                Class XII
              </span>
            </div>

            <div className="my-8 flex flex-col items-center text-center">
              <div className="rounded-full border-2 border-brass-light/70 bg-white p-2 shadow-lg">
                <img
                  src={SCHOOL_LOGO_URL}
                  alt="KV No. 3 Jhansi Crest"
                  className="h-28 w-28 rounded-full object-contain"
                />
              </div>
              <h2 className="mt-5 font-serif text-3xl font-bold tracking-wide text-ivory">
                PM SHRI KV No. 3
              </h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-saffron-light">
                Jhansi &bull; Uttar Pradesh
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-ivory/20 pt-5 text-xs text-ivory/90">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brass-light" />
                <span>KV3 Jhansi Campus</span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Calendar className="h-4 w-4 text-brass-light" />
                <span>Outgoing Batch</span>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* Main Content */}
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

      <footer className="border-t border-navy/10 bg-parchment/70 py-8 text-center text-xs text-navy/75 dark:border-white/10 dark:bg-navy-deep/80 dark:text-ivory/75">
        <p className="font-serif text-base font-semibold text-navy dark:text-ivory">
          {SCHOOL_NAME}
        </p>
        <p className="mt-1">
          {EVENT_TITLE} &bull; Crafted for the Outgoing Class XII Batch
        </p>
      </footer>
    </div>
  );
}
