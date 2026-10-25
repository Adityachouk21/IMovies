import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Server, Database, Activity, CheckCircle2, AlertCircle, 
  Film, Sparkles, ShieldCheck, Ticket, Play, ArrowRight, Zap 
} from 'lucide-react';
import api from '../services/api.js';

export default function HomePage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        setLoading(true);
        const response = await api.get('/health');
        setHealth(response.data);
        setError(null);
      } catch (err) {
        console.error('Health check failed:', err);
        setError(err.message || 'Unable to connect to backend server');
      } finally {
        setLoading(false);
      }
    };

    checkBackendHealth();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden pt-8 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-cinema-red/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cinema-850 border border-cinema-700/80 text-xs font-medium text-slate-300">
              <Sparkles className="w-4 h-4 text-cinema-red" />
              <span>Full-Stack Cinema Ticket Booking Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
              Experience Cinema Like <span className="bg-gradient-to-r from-cinema-red to-orange-500 bg-clip-text text-transparent">Never Before</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
              Explore blockbuster releases, book seats in real-time with Socket.io synchronization, 
              and enjoy seamless test payment integration with Razorpay.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                to="/movies"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-cinema-red hover:bg-cinema-red-hover text-white font-medium shadow-glow-red hover:shadow-red-600/60 transition-all transform hover:-translate-y-0.5"
              >
                <Ticket className="w-5 h-5" />
                <span>Explore Movies</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#system-status"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-cinema-850 hover:bg-cinema-800 border border-cinema-700 text-slate-200 font-medium transition-all"
              >
                <Activity className="w-5 h-5 text-emerald-400" />
                <span>System Status</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 1 Verification & Live Backend Architecture Monitor */}
      <section id="system-status" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-cinema-800/80 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-xl font-bold text-white tracking-wide">Phase 1: Architecture & Server Health Check</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">Live status verification between Vite frontend and Express + MongoDB backend</p>
            </div>

            <button
              onClick={() => {
                setLoading(true);
                api.get('/health')
                  .then(res => { setHealth(res.data); setError(null); })
                  .catch(err => setError(err.message))
                  .finally(() => setLoading(false));
              }}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-cinema-800 hover:bg-cinema-700 text-xs font-medium text-slate-200 transition-colors border border-cinema-700/60"
            >
              <Activity className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cinema-red' : 'text-emerald-400'}`} />
              <span>{loading ? 'Pinging...' : 'Refresh Health'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            
            {/* Express API Service */}
            <div className="bg-cinema-900/80 rounded-xl p-5 border border-cinema-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-cinema-red">
                    <Server className="w-5 h-5" />
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    health?.status === 'healthy' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                      : error 
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {loading ? 'Checking...' : health?.status === 'healthy' ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Express Backend API</h3>
                  <p className="text-xs text-slate-400 mt-0.5">REST APIs, Security Middleware & Rate Limiting</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-cinema-800/80 text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Port:</span>
                  <span className="text-slate-200 font-mono">5000</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="text-slate-200 font-mono">{health?.uptimeSeconds ? `${health.uptimeSeconds}s` : '--'}</span>
                </div>
              </div>
            </div>

            {/* MongoDB Database */}
            <div className="bg-cinema-900/80 rounded-xl p-5 border border-cinema-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    health?.database?.status === 'connected' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {loading ? 'Checking...' : health?.database?.status || 'Connecting...'}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">MongoDB Persistence</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Mongoose ODM & Atomic Reservations</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-cinema-800/80 text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Connection:</span>
                  <span className="text-slate-200 font-mono capitalize">{health?.database?.status || 'Pending'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Database:</span>
                  <span className="text-slate-200 font-mono">{health?.database?.database || 'imovies'}</span>
                </div>
              </div>
            </div>

            {/* Socket.io & Security Stack */}
            <div className="bg-cinema-900/80 rounded-xl p-5 border border-cinema-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-violet-500/10 text-violet-300 border border-violet-500/30">
                    Ready
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Real-Time & Security</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Socket.io, Helmet, CORS & JWT Cookies</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-cinema-800/80 text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>WebSockets:</span>
                  <span className="text-slate-200 font-mono">Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span>Node:</span>
                  <span className="text-slate-200 font-mono">{health?.system?.nodeVersion || 'v24+'}</span>
                </div>
              </div>
            </div>

          </div>

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-rose-200">Backend Connection Notice: </span>
                <span>{error}</span>
                <p className="mt-1 text-slate-400">Ensure the backend server is running with <code className="bg-black/40 px-1 py-0.5 rounded text-slate-200">npm run dev</code> inside <code className="bg-black/40 px-1 py-0.5 rounded text-slate-200">backend/</code>.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature Pillars Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl bg-cinema-900 border border-cinema-800/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cinema-red/10 flex items-center justify-center text-cinema-red">
              <Film className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Trending Movie Catalog</h4>
            <p className="text-xs text-slate-400">Filter by genre, language, city theaters and showtimes.</p>
          </div>

          <div className="p-5 rounded-xl bg-cinema-900 border border-cinema-800/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Ticket className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Live Seat Locking</h4>
            <p className="text-xs text-slate-400">Real-time cinema seat map with atomic lock protection.</p>
          </div>

          <div className="p-5 rounded-xl bg-cinema-900 border border-cinema-800/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Verified Razorpay Checkout</h4>
            <p className="text-xs text-slate-400">Server-side HMAC-SHA256 signature verification.</p>
          </div>

          <div className="p-5 rounded-xl bg-cinema-900 border border-cinema-800/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Digital QR Tickets</h4>
            <p className="text-xs text-slate-400">Downloadable confirmation pass with scannable QR code.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
