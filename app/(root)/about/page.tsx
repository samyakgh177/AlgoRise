import React from "react";
import Link from "next/link";
import {
  Code2,
  Terminal,
  Zap,
  Shield,
  Layers,
  Users,
  Award,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  const principles = [
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: "Real-Time Execution",
      description:
        "Instant multi-language code compilation and feedback powered by robust sandbox runners supporting Python, JavaScript, Java, TypeScript, and C++.",
    },
    {
      icon: <Layers className="w-6 h-6 text-indigo-500" />,
      title: "Curated Problem Sets",
      description:
        "From fundamental data structures to advanced dynamic programming, tackle hand-picked challenges crafted to elevate technical interview readiness.",
    },
    {
      icon: <Terminal className="w-6 h-6 text-emerald-500" />,
      title: "Interactive Monaco Editor",
      description:
        "A full-featured IDE experience directly in your browser with syntax highlighting, keyboard shortcuts, multi-language snippets, and clean output panes.",
    },
    {
      icon: <Award className="w-6 h-6 text-amber-500" />,
      title: "Custom Problem Playlists",
      description:
        "Organize, bookmark, and curate personalized learning paths to target your weak spots and master specific patterns systematically.",
    },
    {
      icon: <Users className="w-6 h-6 text-indigo-500" />,
      title: "Transparent Progress",
      description:
        "Track submission metrics, runtime speed, memory usage, and solved problem counts with granular statistics on your developer profile.",
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-500" />,
      title: "Zero Paywalls",
      description:
        "AlgoRise is designed to give every engineer equal access to high-caliber algorithmic preparation without restrictive paywalls.",
    },
  ];

  const technologies = [
    { name: "Next.js 16", role: "Framework with Turbopack & PPR" },
    { name: "React 19", role: "UI Foundation" },
    { name: "TypeScript", role: "Strict Type Safety" },
    { name: "Prisma ORM", role: "PostgreSQL Database Layer" },
    { name: "Clerk", role: "Secure Authentication" },
    { name: "Monaco Editor", role: "Industry-standard Code Editor" },
  ];

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-4 mb-16">
        <Badge
          variant="secondary"
          className="px-4 py-1.5 text-sm font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800"
        >
          <BookOpen className="w-4 h-4 mr-1.5 inline" />
          About AlgoRise
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Empowering Developers to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-indigo-500">
            Master Algorithms
          </span>
        </h1>
        <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          AlgoRise is an open, modern coding platform designed to make technical interview preparation, competitive programming, and algorithmic intuition accessible and enjoyable for everyone.
        </p>
      </div>

      {/* Core Principles Grid */}
      <section className="mb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
          Why Engineers Choose AlgoRise
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {principles.map((p) => (
            <Card
              key={p.title}
              className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-gray-200/60 dark:border-zinc-800/60 hover:shadow-lg transition-all"
            >
              <CardHeader className="space-y-2">
                <div className="p-3 w-fit rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                  {p.icon}
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  {p.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                  {p.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-20">
        <Card className="bg-gradient-to-br from-zinc-50 to-amber-50/30 dark:from-zinc-900/80 dark:to-zinc-950 border border-gray-200 dark:border-zinc-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <Code2 className="w-6 h-6 text-amber-500" />
              Modern Engineering Stack
            </CardTitle>
            <CardDescription>
              Engineered with modern technologies for speed, reliability, and security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {technologies.map((t) => (
                <div
                  key={t.name}
                  className="p-4 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-gray-200/50 dark:border-zinc-800/80"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t.role}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Banner */}
      <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-center shadow-xl">
        <h2 className="text-3xl font-extrabold mb-4">
          Ready to test your algorithmic skills?
        </h2>
        <p className="text-white/90 max-w-xl mx-auto mb-8 text-base sm:text-lg">
          Dive into our problem catalog, write solutions in your favorite programming language, and track your progress today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/problem">
            <Button
              size="lg"
              className="bg-white text-amber-700 hover:bg-gray-100 font-semibold shadow-md"
            >
              Explore Problems
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
