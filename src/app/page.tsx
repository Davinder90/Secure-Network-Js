'use client';

import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@redux-store/store';
import { SplashScreen } from './auth/AuthGaurd';

interface FeatureCardProps {
  title: string;
  description: string;
  tag: string;
  href: string;
  icon: React.ReactNode;
  accentColor: string;
}

const FeatureCard = ({ title, description, tag, href, icon, accentColor }: FeatureCardProps) => (
  <Link
    href={href}
    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-2xl hover:shadow-indigo-500/10"
  >
    {/* Subtle gradient glow on hover */}
    <div
      className={`absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20 ${accentColor}`}
    />

    <div>
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/80 text-white shadow-inner transition-colors group-hover:border-slate-600">
          {icon}
        </div>
        <span className="rounded-full border border-slate-700/70 bg-slate-800/60 px-2.5 py-0.5 text-xs font-medium text-slate-300">
          {tag}
        </span>
      </div>

      <h3 className="mt-5 text-xl font-semibold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        {description}
      </p>
    </div>

    <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-indigo-400 transition-all group-hover:gap-2.5">
      <span>Launch tool</span>
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </div>
  </Link>
);

const HomePage = () => {
  const currentYear = new Date().getFullYear();

  const features = [
    {
      title: 'Networking',
      description: 'Run real-time DNS lookups, traceroute diagnostics, and low-latency network probes.',
      tag: 'Diagnostics',
      href: '/networking',
      accentColor: 'bg-blue-500',
      icon: (
        <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
    },
    {
      title: 'Security',
      description: 'Inspect SSL/TLS configurations, evaluate security headers, and run vulnerability scans.',
      tag: 'Audit',
      href: '/security-testing',
      accentColor: 'bg-emerald-500',
      icon: (
        <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      title: 'API Client',
      description: 'Execute HTTP requests, inspect headers, validate payloads, and test endpoints with ease.',
      tag: 'Integration',
      href: '/api-tools',
      accentColor: 'bg-purple-500',
      icon: (
        <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
        </svg>
      ),
    },
    {
      title: 'Knowledge Base',
      description: 'Browse architectural guides, security best practices, and protocol references.',
      tag: 'Documentation',
      href: '/articles',
      accentColor: 'bg-amber-500',
      icon: (
        <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background radial gradient decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-indigo-600/20 via-sky-500/10 to-transparent blur-[120px]" />
      </div>

      {/* Hero Section */}
      <header className="mx-auto max-w-6xl px-6 pt-20 pb-12 text-center md:pt-28 md:pb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          Secure Network Operations Platform
        </div>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white">
          Empowering High-Performance{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-cyan-400 bg-clip-text text-transparent">
            Networking & Security
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base text-slate-400 sm:text-lg">
          A centralized suite for DNS resolution, security verification, API testing, and enterprise infrastructure telemetry.
        </p>

        {/* Quick Search / Command hint */}
        <div className="mt-8 flex items-center justify-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center rounded border border-slate-800 bg-slate-900 px-2 py-1 font-mono text-slate-400">
            Press ⌘ + K for Quick Actions
          </span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">All systems operational</span>
        </div>
      </header>

      {/* Quick Links Section */}
      <main className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat) => (
            <FeatureCard key={feat.title} {...feat} />
          ))}
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
          <p>© {currentYear} Secure Network Platform. Enterprise Edition.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Documentation</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function Home() {
  const isAllowed = useSelector((state: RootState) => state.user.isAllowed);

  return (
    <div>
      {!isAllowed ? (
        <SplashScreen />
      ) : (
        <HomePage />
      )}
    </div>
  );
}
