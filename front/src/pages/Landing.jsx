import React from 'react'

export default function Landing() {
  return (
    <main className="page-center bg-gradient-to-b from-white via-slate-50 to-white dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <div className="max-w-5xl mx-auto w-full">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/90 flex items-center justify-center text-white font-bold">CV</div>
            <h1 className="text-2xl font-semibold">CodeVerse Campus</h1>
          </div>
          <nav className="space-x-4 text-sm">
            <a className="text-neutral-700 dark:text-neutral-200 hover:text-primary" href="#features">Features</a>
            <a className="text-neutral-700 dark:text-neutral-200 hover:text-primary" href="#how">How it works</a>
            <a className="px-4 py-2 bg-primary text-white rounded-md" href="/login">Get started</a>
          </nav>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-4xl font-extrabold mb-4">Host and join campus hackathons — simple, secure, realtime.</h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">Create hackathons, manage registrations, run contests with anti-cheat, and publish results with certificates and leaderboards.</p>
            <div className="flex gap-4">
              <a href="/create" className="px-5 py-3 bg-primary text-white rounded-md shadow">Create Hackathon</a>
              <a href="/browse" className="px-5 py-3 border rounded-md text-neutral-700 dark:text-neutral-200">Browse Events</a>
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-6">
            <div className="h-64 bg-white/60 dark:bg-neutral-900 rounded-lg flex items-center justify-center text-neutral-400">Hero / Illustration</div>
          </div>
        </section>

        <section id="features" className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Organize</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Customizable registration, team management, and schedules.</p>
          </div>
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Realtime</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Live leaderboards, notifications, and contest rooms via WebSockets.</p>
          </div>
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Secure</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Anti-cheat logging, verified results, and certificates.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
