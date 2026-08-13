import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Brain,
  TrendingUp,
  Shield,
  Zap,
  Award,
  Users,
  Target,
  ChevronRight
} from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showLogin, setShowLogin] = useState(false);
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

  const handleSSO = () => {
    if (!role) {
      alert('Please select your role before continuing with SSO.');
      return;
    }

    if (onLogin) {
      onLogin(role);
    }
  };

  /* =========================================================
     LOGIN SCREEN
  ========================================================= */

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-slate-900 to-navy-900 flex items-center justify-center p-4">

        <div className="w-full max-w-md">

          {/* HealthGuard AI Logo */}
          <div className="text-center mb-8">

            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-brand-blue to-cyan-500 rounded-2xl shadow-2xl mb-4 animate-pulse">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
              HealthGuard <span className="text-cyan-400">AI</span>
            </h1>

            <p className="text-slate-400 text-sm font-medium">
              Medicare Claims Fraud Intelligence Platform
            </p>

          </div>


          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">

            {/* Welcome Back */}
            <div className="text-center mb-6">

              <h2 className="text-2xl font-bold text-navy-900 mb-1">
                Welcome back
              </h2>

              <p className="text-slate-500 text-sm">
                Sign in to access the HealthGuard AI investigation console
              </p>

            </div>


            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* =====================================================
                  ROLE
              ====================================================== */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Role
                </label>

                <div className="relative">

                  <Shield
                    className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  />

                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all bg-white text-slate-700 appearance-none cursor-pointer"
                    required
                  >

                    <option value="">
                      Select your role
                    </option>

                    <option value="investigator">
                      Investigator
                    </option>

                    <option value="admin">
                      Admin
                    </option>

                    <option value="user">
                      User / Analyst
                    </option>

                  </select>

                  {/* Dropdown arrow */}
                  <ChevronRight
                    className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none"
                  />

                </div>

              </div>


              {/* =====================================================
                  WORK EMAIL
              ====================================================== */}

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
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                    required
                  />

                </div>

              </div>


              {/* =====================================================
                  PASSWORD
              ====================================================== */}

              <div>

                <div className="flex items-center justify-between mb-2">

                  <label className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-sm font-medium text-brand-blue hover:text-brand-darkBlue"
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
                    className="w-full pl-10 pr-16 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand-blue hover:text-brand-darkBlue"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>

                </div>

              </div>


              {/* =====================================================
                  REMEMBER ME
              ====================================================== */}

              <div className="flex items-center">

                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
                  />

                  <span>
                    Remember me for 30 days
                  </span>

                </label>

              </div>


              {/* =====================================================
                  SIGN IN
              ====================================================== */}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-blue to-cyan-600 hover:from-brand-darkBlue hover:to-cyan-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl transition-all transform hover:scale-[1.02]"
              >

                <span>
                  Sign In
                </span>

                <ArrowRight className="w-5 h-5" />

              </button>


              {/* =====================================================
                  DIVIDER
              ====================================================== */}

              <div className="flex items-center gap-3 py-2">

                <div className="flex-1 h-px bg-slate-200"></div>

                <span className="text-sm text-slate-500">
                  Or
                </span>

                <div className="flex-1 h-px bg-slate-200"></div>

              </div>


              {/* =====================================================
                  SSO
              ====================================================== */}

              <button
                type="button"
                onClick={handleSSO}
                className="w-full bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
              >

                <span className="text-base">
                  🔑
                </span>

                <span>
                  Continue with SSO
                </span>

              </button>

            </form>


            {/* =====================================================
                PROTECTED ACCESS
            ====================================================== */}

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


  /* =========================================================
     LANDING PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-slate-900 to-navy-900 overflow-hidden relative">

      {/* Animated Background Elements */}

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-blue/20 rounded-full blur-3xl animate-pulse"></div>

        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>

      </div>


      {/* Content */}

      <div className="relative z-10">

        {/* =====================================================
            NAVIGATION
        ====================================================== */}

        <nav className="container mx-auto px-6 py-6 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="p-2 bg-gradient-to-tr from-brand-blue to-cyan-500 rounded-xl shadow-lg">

              <ShieldCheck className="w-8 h-8 text-white" />

            </div>

            <div>

              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">

                HealthGuard <span className="text-cyan-400">AI</span>

              </h1>

              <p className="text-xs text-slate-400">
                Fraud Detection Platform
              </p>

            </div>

          </div>


          <button
            onClick={() => setShowLogin(true)}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all transform hover:scale-105"
          >
            Sign In
          </button>

        </nav>


        {/* =====================================================
            HERO SECTION
        ====================================================== */}

        <div className="container mx-auto px-6 py-20">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* LEFT CONTENT */}

            <div className="space-y-8">

              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-full">

                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />

                <span className="text-sm font-bold text-cyan-300">
                  AI-Powered Medicare Fraud Detection
                </span>

              </div>


              <h2 className="text-4xl font-extrabold text-white leading-tight">

                Protect Medicare with{" "}

                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  AI-Powered Detection
                </span>

              </h2>


              <p className="text-lg text-slate-300 leading-relaxed">

                Enterprise-grade machine learning platform that identifies Medicare fraud patterns with SHAP explainability and HistGradientBoosting algorithms. Designed for healthcare payers and Special Investigation Units.

              </p>


              <div className="flex flex-wrap gap-4">

                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-gradient-to-r from-brand-blue to-cyan-600 hover:from-brand-darkBlue hover:to-cyan-700 text-white px-8 py-4 rounded-xl font-bold text-base flex items-center gap-3 shadow-2xl transition-all transform hover:scale-105"
                >

                  <span>
                    Access Platform
                  </span>

                  <ArrowRight className="w-6 h-6" />

                </button>


                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/20 text-white px-8 py-4 rounded-xl font-bold text-base flex items-center gap-3 transition-all transform hover:scale-105"
                >

                  <Shield className="w-6 h-6" />

                  <span>
                    Request Demo
                  </span>

                </button>

              </div>


              {/* =====================================================
                  PROJECT STATS
              ====================================================== */}

              <div className="grid grid-cols-3 gap-6 pt-8">

                <div className="text-center">

                  <div className="text-2xl font-extrabold text-white mb-1">
                    95.56%
                  </div>

                  <div className="text-sm text-slate-400">
                    Model Accuracy
                  </div>

                </div>


                <div className="text-center">

                  <div className="text-2xl font-extrabold text-white mb-1">
                    81.93%
                  </div>

                  <div className="text-sm text-slate-400">
                    Precision
                  </div>

                </div>


                <div className="text-center">

                  <div className="text-2xl font-extrabold text-white mb-1">
                    5,410
                  </div>

                  <div className="text-sm text-slate-400">
                    Providers Analyzed
                  </div>

                </div>

              </div>

            </div>


            {/* =====================================================
                RIGHT VISUAL
            ====================================================== */}

            <div className="relative">

              <div className="bg-white rounded-2xl shadow-2xl p-6 transform hover:scale-105 transition-all duration-500">

                <div className="flex items-center justify-between mb-4">

                  <h3 className="text-lg font-bold text-navy-900">
                    Live Risk Analysis
                  </h3>

                  <div className="flex items-center gap-2">

                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>

                    <span className="text-xs font-semibold text-emerald-600">
                      Active
                    </span>

                  </div>

                </div>


                {/* Risk Gauge */}

                <div className="relative w-40 h-40 mx-auto mb-6">

                  <svg
                    className="transform -rotate-90"
                    width="160"
                    height="160"
                  >

                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#E2E8F0"
                      strokeWidth="12"
                      fill="transparent"
                    />

                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#DC2626"
                      strokeWidth="12"
                      strokeDasharray="440"
                      strokeDashoffset="44"
                      strokeLinecap="round"
                      fill="transparent"
                      className="animate-pulse"
                    />

                  </svg>


                  <div className="absolute inset-0 flex items-center justify-center flex-col">

                    <span className="text-3xl font-extrabold text-red-600">
                      91%
                    </span>

                    <span className="text-xs text-slate-500 font-semibold">
                      Fraud Risk
                    </span>

                  </div>

                </div>


                <div className="space-y-2 text-sm">

                  <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">

                    <span className="text-slate-600">
                      Claim Amount
                    </span>

                    <span className="font-bold text-slate-900">
                      $14,250
                    </span>

                  </div>


                  <div className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">

                    <span className="text-slate-600">
                      Risk Level
                    </span>

                    <span className="font-bold text-red-600">
                      HIGH
                    </span>

                  </div>


                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">

                    <span className="text-slate-600">
                      Model Confidence
                    </span>

                    <span className="font-bold text-brand-blue">
                      95.56%
                    </span>

                  </div>

                </div>

              </div>


              {/* Floating SHAP Card */}

              <div className="absolute -top-6 -left-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl shadow-xl animate-bounce">

                <Brain className="w-8 h-8 mb-2" />

                <div className="text-xs font-bold">
                  SHAP AI
                </div>

                <div className="text-base font-extrabold">
                  Explainable
                </div>

              </div>


              {/* Floating Real-Time Card */}

              <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-xl shadow-xl animate-bounce delay-500">

                <Zap className="w-8 h-8 mb-2" />

                <div className="text-xs font-bold">
                  Real-Time
                </div>

                <div className="text-base font-extrabold">
                  Detection
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            FEATURES
        ====================================================== */}

        <div className="container mx-auto px-6 py-20">

          <div className="text-center mb-16">

            <h3 className="text-3xl font-extrabold text-white mb-4">
              Enterprise Healthcare Solutions
            </h3>

            <p className="text-base text-slate-400">
              AI-powered fraud detection for Medicare payers and SIU teams
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {[
              {
                icon: Brain,
                title: 'SHAP Explainability',
                desc: 'Understand every prediction with feature attribution analysis',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: TrendingUp,
                title: '95.56% Accuracy',
                desc: 'HistGradientBoosting model with 81.93% precision',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Zap,
                title: 'Real-Time Monitoring',
                desc: 'Continuous claim surveillance with instant risk alerts',
                color: 'from-amber-500 to-orange-500'
              },
              {
                icon: Shield,
                title: 'Secure & Compliant',
                desc: 'Enterprise-focused security and audit support',
                color: 'from-emerald-500 to-teal-500'
              }
            ].map((feature, i) => (

              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all transform hover:scale-105 hover:shadow-2xl group"
              >

                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition-transform`}
                >

                  <feature.icon className="w-6 h-6 text-white" />

                </div>

                <h4 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h4>

                <p className="text-slate-400 text-sm">
                  {feature.desc}
                </p>

              </div>

            ))}

          </div>

        </div>


        {/* =====================================================
            PROJECT METRICS
        ====================================================== */}

        <div className="container mx-auto px-6 py-20">

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">

              <div>

                <Award className="w-12 h-12 text-cyan-400 mx-auto mb-4" />

                <div className="text-3xl font-extrabold text-white mb-2">
                  81.93%
                </div>

                <div className="text-slate-400">
                  Precision
                </div>

              </div>


              <div>

                <Users className="w-12 h-12 text-cyan-400 mx-auto mb-4" />

                <div className="text-3xl font-extrabold text-white mb-2">
                  5,410
                </div>

                <div className="text-slate-400">
                  Providers Analyzed
                </div>

              </div>


              <div>

                <Target className="w-12 h-12 text-cyan-400 mx-auto mb-4" />

                <div className="text-3xl font-extrabold text-white mb-2">
                  95.56%
                </div>

                <div className="text-slate-400">
                  Model Accuracy
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            CTA
        ====================================================== */}

        <div className="container mx-auto px-6 py-20">

          <div className="bg-gradient-to-r from-brand-blue to-cyan-600 rounded-3xl p-12 text-center relative overflow-hidden">

            <div className="absolute inset-0 opacity-10">

              <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent animate-gradient"></div>

            </div>


            <div className="relative z-10">

              <h3 className="text-3xl font-extrabold text-white mb-4">
                Secure Your Medicare Program
              </h3>

              <p className="text-base text-blue-100 mb-8 max-w-2xl mx-auto">
                Use HealthGuard AI to identify suspicious Medicare claims and provider behavior with explainable machine learning.
              </p>


              <button
                onClick={() => setShowLogin(true)}
                className="bg-white hover:bg-slate-100 text-brand-blue px-10 py-5 rounded-xl font-bold text-base inline-flex items-center gap-3 shadow-2xl transition-all transform hover:scale-105"
              >

                <span>
                  Access Platform
                </span>

                <ChevronRight className="w-6 h-6" />

              </button>

            </div>

          </div>

        </div>


        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer className="container mx-auto px-6 py-8 border-t border-white/10">

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            <div className="text-slate-400 text-sm">
              © 2026 HealthGuard AI. All rights reserved.
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-400">

              <a
                href="#"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </a>

              <a
                href="#"
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </a>

              <a
                href="#"
                className="hover:text-white transition-colors"
              >
                Contact
              </a>

            </div>

          </div>

        </footer>

      </div>

    </div>
  );
}