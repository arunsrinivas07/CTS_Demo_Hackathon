import React, { useState } from 'react';

const bgPattern = "data:image/jpeg;base64,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";

import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Radar,
  Users2,
  Eye,
  ChevronRight
} from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!role) {
      alert('Please select your role.');
      return;
    }

    if (!email || !password) {
      alert('Please enter your email and password.');
      return;
    }

    /*
      Pass the selected role to your parent App component.

      Investigator -> Investigator Dashboard
      Admin        -> Admin Dashboard
      User/Analyst -> User Dashboard
    */
    if (onLogin) {
      onLogin(role);
    }
  };

  const features = [
    {
      icon: Radar,
      title: 'Real-time claim risk intelligence',
      desc: 'Identify high-probability fraud patterns as claims are processed.'
    },
    {
      icon: Users2,
      title: 'Provider behavior analysis',
      desc: 'Map complex relationships and flag anomalous billing spikes.'
    },
    {
      icon: Eye,
      title: 'Explainable AI evidence',
      desc: 'Clear rationale and evidence trails for every flagged anomaly.'
    }
  ];

  return (
    <div className="min-h-screen flex bg-white">

      {/* =====================================================
          LEFT PANEL — BRAND / CONTEXT
      ====================================================== */}

      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden flex-col justify-between p-12">

        {/* Pattern background — tinted to match the panel's navy/cyan palette */}
        <div
          className="absolute inset-0 opacity-60 mix-blend-screen pointer-events-none"
          style={{
            backgroundImage: `url(${bgPattern})`,
            backgroundSize: '160%',
            backgroundPosition: 'center',
            filter: 'invert(1) hue-rotate(180deg) saturate(1.6) brightness(0.65) contrast(1.35)'
          }}
        ></div>

        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-16 w-80 h-80 bg-blue-700/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Darkening scrim for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/30 to-slate-950/70 pointer-events-none"></div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-blue-700 to-cyan-500 rounded-xl shadow-lg">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white leading-none">
              HealthGuard <span className="text-cyan-400">AI</span>
            </h1>
            <p className="text-[11px] tracking-wide text-slate-400 mt-1">
              Medicare Claims Fraud Intelligence Platform
            </p>
          </div>
        </div>

        {/* Headline + features */}
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Detect anomalous claims.<br />Investigate fraud with confidence.
          </h2>

          <p className="text-slate-400 text-base mb-10">
            AI-powered Medicare claims intelligence for investigators and fraud analytics teams.
          </p>

          <div className="space-y-6">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="shrink-0 w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                  <f.icon className="w-4.5 h-4.5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-0.5">
                    {f.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer spacer to balance layout */}
        <div className="relative z-10 text-xs text-slate-500">
          © 2026 HealthGuard AI. All rights reserved.
        </div>

      </div>

      {/* =====================================================
          RIGHT PANEL — SIGN IN
      ====================================================== */}

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">

        <div className="w-full max-w-sm">

          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-tr from-blue-700 to-cyan-500 rounded-xl shadow-lg">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-950">
              HealthGuard <span className="text-blue-700">AI</span>
            </h1>
          </div>

          {/* Welcome back */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-950 mb-1">
              Welcome back
            </h2>
            <p className="text-slate-500 text-sm">
              Sign in to access the HealthGuard AI investigation console
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ROLE */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Role
              </label>
              <div className="relative">
                <ShieldCheck className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700/30 focus:border-blue-700 transition-all bg-white text-slate-700 appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select your role</option>
                  <option value="investigator">Investigator</option>
                  <option value="admin">Admin</option>
                  <option value="user">User / Analyst</option>
                </select>
                <ChevronRight className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
              </div>
            </div>

            {/* WORK EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investigator@healthguard.ai"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700/30 focus:border-blue-700 transition-all"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-sm font-medium text-blue-700 hover:text-blue-800"
                  onClick={() => alert('Password reset link requested.')}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-16 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700/30 focus:border-blue-700 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-700 hover:text-blue-800"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* REMEMBER ME */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            {/* SIGN IN */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl transition-all transform hover:scale-[1.02]"
            >
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5" />
            </button>

          </form>

          {/* PROTECTED ACCESS */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              Protected enterprise access
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}