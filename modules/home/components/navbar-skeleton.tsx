import React from "react";
import Image from "next/image";
import Link from "next/link";

export const NavbarSkeleton = () => {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-5xl px-4">
      <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="TreeBio" width={42} height={42} priority />
          <span className="font-bold text-2xl tracking-widest text-amber-300">
            AlgoRise
          </span>
        </Link>

        <div className="flex flex-row items-center justify-center gap-x-4">
          <Link
            href="/problem"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-amber-600 cursor-pointer dark:hover:text-amber-400"
          >
            Problems
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-amber-600 cursor-pointer dark:hover:text-amber-400"
          >
            About
          </Link>
          <Link
            href="/profile"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-amber-600 cursor-pointer dark:hover:text-amber-400"
          >
            Profile
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-md bg-zinc-200/50 dark:bg-zinc-800/50" />
          <div className="w-16 h-8 rounded-md bg-zinc-200/50 dark:bg-zinc-800/50 animate-pulse" />
        </div>
      </div>
    </nav>
  );
};
