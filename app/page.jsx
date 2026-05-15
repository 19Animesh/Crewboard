import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/40">
            CB
          </div>
          <span className="text-xl font-bold text-white">CrewBoard</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-sm shadow-indigo-500/30">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-xs text-indigo-400 mb-8">
          ✦ Role-based team collaboration platform
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight max-w-4xl">
          Manage projects,
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"> ship faster</span>
        </h1>

        <p className="text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
          CrewBoard gives your team a shared space to create projects, assign tasks, track progress — 
          with role-based access so everyone sees exactly what they need.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link href="/signup" className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5">
            Start for free →
          </Link>
          <Link href="/login" className="px-8 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-all border border-gray-700">
            Demo login
          </Link>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl w-full">
          {[
            { icon: '🔐', title: 'Role-based access', desc: 'Admin and Member roles with distinct permissions. Members only see what they need.' },
            { icon: '📊', title: 'Live dashboard', desc: 'Real-time stats on total tasks, pending work, completions, and overdue items.' },
            { icon: '✅', title: 'Task tracking', desc: 'Assign tasks with priority, due date, and status tracking. Overdue detection built-in.' },
          ].map(f => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-left hover:border-gray-700 transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Demo creds hint */}
        <div className="mt-14 p-4 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-500 max-w-sm w-full">
          <p className="font-medium text-gray-400 mb-2">Demo credentials</p>
          <div className="flex justify-between"><span>Admin:</span><span className="text-gray-300">admin@example.com / Admin@123</span></div>
          <div className="flex justify-between mt-1"><span>Member:</span><span className="text-gray-300">member@example.com / Member@123</span></div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-600 border-t border-gray-800/50">
        CrewBoard — Built with Next.js, Prisma & PostgreSQL
      </footer>
    </div>
  );
}
