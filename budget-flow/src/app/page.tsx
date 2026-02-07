"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";

// Pre-computed mosaic tiles - varying sizes and opacities for artistic effect
const MOSAIC_TILES = [
  // Large prominent tiles
  { id: 0, x: 2, y: 5, color: "#10b981", delay: 0, duration: 4, size: "lg", opacity: 0.4 },
  { id: 1, x: 88, y: 8, color: "#6366f1", delay: 0.5, duration: 5, size: "lg", opacity: 0.35 },
  { id: 2, x: 5, y: 75, color: "#8b5cf6", delay: 1, duration: 4.5, size: "lg", opacity: 0.4 },
  { id: 3, x: 85, y: 70, color: "#ec4899", delay: 1.5, duration: 5, size: "lg", opacity: 0.35 },
  { id: 4, x: 45, y: 85, color: "#f59e0b", delay: 0.3, duration: 4, size: "lg", opacity: 0.3 },

  // Medium tiles - scattered across
  { id: 5, x: 15, y: 20, color: "#14b8a6", delay: 0.2, duration: 3.5, size: "md", opacity: 0.5 },
  { id: 6, x: 75, y: 25, color: "#10b981", delay: 0.8, duration: 4, size: "md", opacity: 0.45 },
  { id: 7, x: 25, y: 45, color: "#6366f1", delay: 1.2, duration: 3.8, size: "md", opacity: 0.5 },
  { id: 8, x: 70, y: 50, color: "#8b5cf6", delay: 0.6, duration: 4.2, size: "md", opacity: 0.45 },
  { id: 9, x: 20, y: 65, color: "#ec4899", delay: 1.8, duration: 3.6, size: "md", opacity: 0.5 },
  { id: 10, x: 65, y: 80, color: "#f59e0b", delay: 0.4, duration: 4, size: "md", opacity: 0.45 },
  { id: 11, x: 92, y: 40, color: "#14b8a6", delay: 1.4, duration: 3.9, size: "md", opacity: 0.5 },
  { id: 12, x: 8, y: 35, color: "#10b981", delay: 0.9, duration: 4.1, size: "md", opacity: 0.45 },
  { id: 13, x: 50, y: 15, color: "#6366f1", delay: 1.6, duration: 3.7, size: "md", opacity: 0.4 },
  { id: 14, x: 35, y: 90, color: "#8b5cf6", delay: 0.7, duration: 4.3, size: "md", opacity: 0.5 },

  // Small accent tiles - many of them
  { id: 15, x: 10, y: 12, color: "#ec4899", delay: 0.1, duration: 3, size: "sm", opacity: 0.6 },
  { id: 16, x: 30, y: 8, color: "#f59e0b", delay: 0.5, duration: 3.2, size: "sm", opacity: 0.55 },
  { id: 17, x: 55, y: 5, color: "#14b8a6", delay: 0.9, duration: 3.4, size: "sm", opacity: 0.6 },
  { id: 18, x: 78, y: 12, color: "#10b981", delay: 1.3, duration: 3.1, size: "sm", opacity: 0.55 },
  { id: 19, x: 95, y: 18, color: "#6366f1", delay: 0.3, duration: 3.3, size: "sm", opacity: 0.6 },
  { id: 20, x: 4, y: 28, color: "#8b5cf6", delay: 0.7, duration: 3.5, size: "sm", opacity: 0.55 },
  { id: 21, x: 22, y: 32, color: "#ec4899", delay: 1.1, duration: 3, size: "sm", opacity: 0.6 },
  { id: 22, x: 42, y: 25, color: "#f59e0b", delay: 1.5, duration: 3.2, size: "sm", opacity: 0.55 },
  { id: 23, x: 62, y: 30, color: "#14b8a6", delay: 0.2, duration: 3.4, size: "sm", opacity: 0.6 },
  { id: 24, x: 82, y: 35, color: "#10b981", delay: 0.6, duration: 3.1, size: "sm", opacity: 0.55 },
  { id: 25, x: 12, y: 48, color: "#6366f1", delay: 1.0, duration: 3.3, size: "sm", opacity: 0.6 },
  { id: 26, x: 38, y: 55, color: "#8b5cf6", delay: 1.4, duration: 3.5, size: "sm", opacity: 0.55 },
  { id: 27, x: 58, y: 45, color: "#ec4899", delay: 0.4, duration: 3, size: "sm", opacity: 0.6 },
  { id: 28, x: 78, y: 58, color: "#f59e0b", delay: 0.8, duration: 3.2, size: "sm", opacity: 0.55 },
  { id: 29, x: 94, y: 52, color: "#14b8a6", delay: 1.2, duration: 3.4, size: "sm", opacity: 0.6 },
  { id: 30, x: 6, y: 62, color: "#10b981", delay: 1.6, duration: 3.1, size: "sm", opacity: 0.55 },
  { id: 31, x: 28, y: 72, color: "#6366f1", delay: 0.1, duration: 3.3, size: "sm", opacity: 0.6 },
  { id: 32, x: 48, y: 68, color: "#8b5cf6", delay: 0.5, duration: 3.5, size: "sm", opacity: 0.55 },
  { id: 33, x: 68, y: 62, color: "#ec4899", delay: 0.9, duration: 3, size: "sm", opacity: 0.6 },
  { id: 34, x: 88, y: 75, color: "#f59e0b", delay: 1.3, duration: 3.2, size: "sm", opacity: 0.55 },
  { id: 35, x: 16, y: 82, color: "#14b8a6", delay: 0.3, duration: 3.4, size: "sm", opacity: 0.6 },
  { id: 36, x: 52, y: 78, color: "#10b981", delay: 0.7, duration: 3.1, size: "sm", opacity: 0.55 },
  { id: 37, x: 72, y: 88, color: "#6366f1", delay: 1.1, duration: 3.3, size: "sm", opacity: 0.6 },
  { id: 38, x: 92, y: 92, color: "#8b5cf6", delay: 1.5, duration: 3.5, size: "sm", opacity: 0.55 },
  { id: 39, x: 3, y: 95, color: "#ec4899", delay: 0.2, duration: 3, size: "sm", opacity: 0.6 },

  // Tiny sparkle tiles
  { id: 40, x: 18, y: 3, color: "#f59e0b", delay: 0, duration: 2.5, size: "xs", opacity: 0.7 },
  { id: 41, x: 40, y: 10, color: "#14b8a6", delay: 0.4, duration: 2.8, size: "xs", opacity: 0.65 },
  { id: 42, x: 60, y: 2, color: "#10b981", delay: 0.8, duration: 2.6, size: "xs", opacity: 0.7 },
  { id: 43, x: 85, y: 5, color: "#6366f1", delay: 1.2, duration: 2.9, size: "xs", opacity: 0.65 },
  { id: 44, x: 33, y: 38, color: "#8b5cf6", delay: 0.3, duration: 2.5, size: "xs", opacity: 0.7 },
  { id: 45, x: 53, y: 35, color: "#ec4899", delay: 0.7, duration: 2.8, size: "xs", opacity: 0.65 },
  { id: 46, x: 73, y: 42, color: "#f59e0b", delay: 1.1, duration: 2.6, size: "xs", opacity: 0.7 },
  { id: 47, x: 93, y: 28, color: "#14b8a6", delay: 1.5, duration: 2.9, size: "xs", opacity: 0.65 },
  { id: 48, x: 8, y: 55, color: "#10b981", delay: 0.2, duration: 2.5, size: "xs", opacity: 0.7 },
  { id: 49, x: 25, y: 58, color: "#6366f1", delay: 0.6, duration: 2.8, size: "xs", opacity: 0.65 },
  { id: 50, x: 45, y: 52, color: "#8b5cf6", delay: 1.0, duration: 2.6, size: "xs", opacity: 0.7 },
  { id: 51, x: 65, y: 55, color: "#ec4899", delay: 1.4, duration: 2.9, size: "xs", opacity: 0.65 },
  { id: 52, x: 85, y: 48, color: "#f59e0b", delay: 0.1, duration: 2.5, size: "xs", opacity: 0.7 },
  { id: 53, x: 12, y: 75, color: "#14b8a6", delay: 0.5, duration: 2.8, size: "xs", opacity: 0.65 },
  { id: 54, x: 32, y: 82, color: "#10b981", delay: 0.9, duration: 2.6, size: "xs", opacity: 0.7 },
  { id: 55, x: 58, y: 88, color: "#6366f1", delay: 1.3, duration: 2.9, size: "xs", opacity: 0.65 },
  { id: 56, x: 78, y: 95, color: "#8b5cf6", delay: 0.4, duration: 2.5, size: "xs", opacity: 0.7 },
  { id: 57, x: 98, y: 85, color: "#ec4899", delay: 0.8, duration: 2.8, size: "xs", opacity: 0.65 },
  { id: 58, x: 2, y: 42, color: "#f59e0b", delay: 1.2, duration: 2.6, size: "xs", opacity: 0.7 },
  { id: 59, x: 97, y: 62, color: "#14b8a6", delay: 1.6, duration: 2.9, size: "xs", opacity: 0.65 },
];

const TILE_SIZES = {
  xs: "w-4 h-4",
  sm: "w-8 h-8",
  md: "w-14 h-14",
  lg: "w-20 h-20",
};

// Mosaic tile component for background
function MosaicTile({
  delay, x, y, color, duration, size, opacity
}: {
  delay: number; x: number; y: number; color: string; duration: number; size: string; opacity: number
}) {
  return (
    <div
      className={`absolute ${TILE_SIZES[size as keyof typeof TILE_SIZES]} rounded-sm animate-pulse`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        backgroundColor: color,
        opacity: opacity,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        boxShadow: `0 0 ${size === 'lg' ? '30px' : size === 'md' ? '20px' : '10px'} ${color}40`,
      }}
    />
  );
}

// Mosaic background with pre-computed tiles
function MosaicBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary" />

      {/* Mosaic tiles */}
      {MOSAIC_TILES.map((tile) => (
        <MosaicTile key={tile.id} {...tile} />
      ))}

      {/* Subtle overlay to blend */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-bg-primary/50" />
    </div>
  );
}

// Login Modal Component
function AuthModal({ isOpen, onClose, mode }: { isOpen: boolean; onClose: () => void; mode: "login" | "signup" }) {
  const router = useRouter();
  const { setUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "signup" ? "/api/auth/register" : "/api/auth/login";
      const body = mode === "signup"
        ? { name, email, password }
        : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Authentication failed");
        setLoading(false);
        return;
      }

      // Save user to context
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          monthlyIncome: data.user.monthlyIncome,
        });
      }

      // Success - redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-bg-card border border-border-main rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-text-secondary">
            {mode === "login" ? "Sign in to view your financial mosaic" : "Start building your financial picture"}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg text-accent-red text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-bg-secondary border border-border-main rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-purple transition-colors disabled:opacity-50"
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-bg-secondary border border-border-main rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-purple transition-colors disabled:opacity-50"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-bg-secondary border border-border-main rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-purple transition-colors disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-accent-purple to-accent-blue text-white font-semibold rounded-lg hover:opacity-90 transition-opacity mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : (mode === "login" ? "Sign In" : "Create Account")}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-border-main"></div>
          <span className="px-4 text-text-secondary text-sm">or continue with</span>
          <div className="flex-1 border-t border-border-main"></div>
        </div>

        {/* Social login */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            disabled={loading}
            className="flex-1 py-3 bg-bg-secondary border border-border-main rounded-lg text-text-primary hover:bg-bg-card-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
            </svg>
            Google
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            disabled={loading}
            className="flex-1 py-3 bg-bg-secondary border border-border-main rounded-lg text-text-primary hover:bg-bg-card-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  return (
    <div className="group relative bg-bg-card/60 backdrop-blur-sm border border-border-main rounded-xl p-6 hover:bg-bg-card-hover transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden">
      {/* Decorative corner tiles */}
      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-sm opacity-20" style={{ backgroundColor: color }} />
      <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-sm opacity-15" style={{ backgroundColor: color }} />

      <div
        className="relative w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white"
        style={{ backgroundColor: color, boxShadow: `0 4px 20px ${color}50` }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// Decorative mosaic cluster for hero
function MosaicCluster({ position }: { position: "left" | "right" }) {
  const tiles = position === "left" ? [
    { x: 0, y: 0, size: 20, color: "#8b5cf6", opacity: 0.6, delay: 0 },
    { x: 25, y: 15, size: 16, color: "#6366f1", opacity: 0.5, delay: 0.2 },
    { x: 5, y: 35, size: 14, color: "#ec4899", opacity: 0.55, delay: 0.4 },
    { x: 30, y: 45, size: 12, color: "#10b981", opacity: 0.5, delay: 0.6 },
    { x: 15, y: 60, size: 18, color: "#f59e0b", opacity: 0.55, delay: 0.3 },
    { x: 40, y: 70, size: 10, color: "#14b8a6", opacity: 0.45, delay: 0.5 },
  ] : [
    { x: 60, y: 5, size: 18, color: "#10b981", opacity: 0.55, delay: 0.1 },
    { x: 80, y: 20, size: 22, color: "#6366f1", opacity: 0.6, delay: 0.3 },
    { x: 55, y: 35, size: 14, color: "#f59e0b", opacity: 0.5, delay: 0.5 },
    { x: 75, y: 50, size: 16, color: "#8b5cf6", opacity: 0.55, delay: 0.2 },
    { x: 90, y: 65, size: 12, color: "#ec4899", opacity: 0.5, delay: 0.4 },
    { x: 65, y: 75, size: 20, color: "#14b8a6", opacity: 0.55, delay: 0.6 },
  ];

  return (
    <div className={`absolute ${position === "left" ? "left-0" : "right-0"} top-1/2 -translate-y-1/2 w-48 h-96 hidden lg:block`}>
      {tiles.map((tile, i) => (
        <div
          key={i}
          className="absolute rounded-sm animate-pulse"
          style={{
            left: `${tile.x}%`,
            top: `${tile.y}%`,
            width: `${tile.size * 4}px`,
            height: `${tile.size * 4}px`,
            backgroundColor: tile.color,
            opacity: tile.opacity,
            animationDelay: `${tile.delay}s`,
            animationDuration: "3s",
            boxShadow: `0 0 20px ${tile.color}40`,
          }}
        />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: "login" | "signup" }>({
    open: false,
    mode: "login",
  });
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary overflow-x-hidden">
      <MosaicBackground />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-bg-primary/70 backdrop-blur-lg border-b border-border-main/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo with mosaic effect */}
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent-purple to-accent-blue" />
              <div className="absolute top-1 left-1 w-4 h-4 rounded-sm bg-accent-green/60" />
              <div className="absolute bottom-1 right-1 w-3 h-3 rounded-sm bg-accent-pink/60" />
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">BF</span>
            </div>
            <span className="text-xl font-bold text-text-primary">Budget Flow</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAuthModal({ open: true, mode: "login" })}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthModal({ open: true, mode: "signup" })}
              className="px-5 py-2.5 bg-gradient-to-r from-accent-purple to-accent-blue text-white rounded-lg font-medium hover:opacity-90 transition-all hover:shadow-lg hover:shadow-accent-purple/25"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Decorative mosaic clusters on sides */}
        <MosaicCluster position="left" />
        <MosaicCluster position="right" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Floating mosaic pieces around text */}
          <div className="absolute -top-16 left-1/4 w-16 h-16 rounded-md bg-accent-purple/40 rotate-12 animate-bounce" style={{ animationDuration: "3s", boxShadow: "0 0 30px #8b5cf640" }} />
          <div className="absolute -top-8 right-1/3 w-10 h-10 rounded-sm bg-accent-blue/50 -rotate-6 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "0.5s" }} />
          <div className="absolute top-20 right-1/4 w-14 h-14 rounded-md bg-accent-green/40 -rotate-12 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s", boxShadow: "0 0 25px #10b98140" }} />
          <div className="absolute top-32 left-1/5 w-8 h-8 rounded-sm bg-accent-yellow/50 rotate-45 animate-bounce" style={{ animationDuration: "3.2s", animationDelay: "0.3s" }} />
          <div className="absolute bottom-32 left-1/4 w-12 h-12 rounded-md bg-accent-pink/40 rotate-45 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "0.5s", boxShadow: "0 0 20px #ec489940" }} />
          <div className="absolute bottom-20 right-1/3 w-10 h-10 rounded-sm bg-accent-teal/50 -rotate-12 animate-bounce" style={{ animationDuration: "4.2s", animationDelay: "0.8s" }} />

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-text-primary">See the </span>
            <span className="bg-gradient-to-r from-accent-purple via-accent-blue to-accent-green bg-clip-text text-transparent">
              Full Picture
            </span>
            <br />
            <span className="text-text-primary">of Your Finances</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
            Every transaction is a tile in your financial mosaic. Budget Flow connects them all,
            giving you AI-powered insights to build a clearer picture of where your money goes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setAuthModal({ open: true, mode: "signup" })}
              className="px-8 py-4 bg-gradient-to-r from-accent-purple to-accent-blue text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-accent-purple/25"
            >
              Start Building Your Mosaic
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-8 py-4 bg-bg-card border border-border-main text-text-primary rounded-xl font-semibold text-lg hover:bg-bg-card-hover transition-all hover:scale-105"
            >
              View Demo
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Every Piece Matters
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Like a mosaic, your financial health is made up of many small pieces.
              Our tools help you see how they all fit together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="Visual Flow Diagrams"
              description="Watch your money flow through interactive Sankey diagrams that reveal spending patterns at a glance."
              color="#10b981"
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              title="AI-Powered Insights"
              description="Get personalized recommendations from our AI that analyzes your unique spending mosaic."
              color="#6366f1"
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
              title="Goal Tracking"
              description="Set savings goals and watch each tile fill in as you make progress toward your dreams."
              color="#8b5cf6"
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Budget Categories"
              description="Organize spending into colorful categories that make your financial mosaic easy to understand."
              color="#ec4899"
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title="Bank-Level Security"
              description="Your financial data is encrypted and protected with the same security used by major banks."
              color="#f59e0b"
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              }
              title="Custom Dashboard"
              description="Arrange your financial tiles exactly how you want with our flexible, customizable dashboard."
              color="#14b8a6"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-accent-purple/20 via-accent-blue/20 to-accent-green/20 rounded-3xl p-12 border border-border-main overflow-hidden">
            {/* Many decorative mosaic tiles for artistic effect */}
            <div className="absolute top-4 right-4 w-20 h-20 rounded-md bg-accent-purple/40 rotate-12" style={{ boxShadow: "0 0 30px #8b5cf630" }} />
            <div className="absolute top-8 right-28 w-12 h-12 rounded-sm bg-accent-blue/35 -rotate-6" />
            <div className="absolute top-20 right-8 w-8 h-8 rounded-sm bg-accent-pink/40 rotate-45" />
            <div className="absolute bottom-4 left-4 w-16 h-16 rounded-md bg-accent-green/40 -rotate-12" style={{ boxShadow: "0 0 25px #10b98130" }} />
            <div className="absolute bottom-8 left-24 w-10 h-10 rounded-sm bg-accent-teal/35 rotate-6" />
            <div className="absolute bottom-16 left-6 w-6 h-6 rounded-sm bg-accent-yellow/40 -rotate-45" />
            <div className="absolute top-1/2 right-8 w-14 h-14 rounded-md bg-accent-blue/35 rotate-45" />
            <div className="absolute top-1/3 left-6 w-10 h-10 rounded-sm bg-accent-pink/30 -rotate-12" />
            <div className="absolute bottom-1/3 right-20 w-8 h-8 rounded-sm bg-accent-yellow/35 rotate-12" />

            <div className="relative text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Ready to Complete Your Picture?
              </h2>
              <p className="text-text-secondary mb-8 max-w-xl mx-auto">
                Join thousands of users who have discovered the clarity that comes from seeing their finances as a beautiful, complete mosaic.
              </p>
              <button
                onClick={() => setAuthModal({ open: true, mode: "signup" })}
                className="px-8 py-4 bg-gradient-to-r from-accent-purple to-accent-blue text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-accent-purple/25"
              >
                Create Free Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border-main py-12 px-6 overflow-hidden">
        {/* Footer mosaic accents */}
        <div className="absolute bottom-2 left-8 w-6 h-6 rounded-sm bg-accent-purple/20" />
        <div className="absolute bottom-4 left-20 w-4 h-4 rounded-sm bg-accent-blue/25" />
        <div className="absolute bottom-2 right-12 w-5 h-5 rounded-sm bg-accent-green/20" />
        <div className="absolute bottom-6 right-24 w-3 h-3 rounded-sm bg-accent-pink/25" />

        <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Logo with mosaic effect */}
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent-purple to-accent-blue" />
              <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-sm bg-accent-green/60" />
              <div className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-sm bg-accent-pink/60" />
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">BF</span>
            </div>
            <span className="text-text-secondary">Budget Flow</span>
          </div>
          <p className="text-text-secondary text-sm">
            Built with 💜 at TartanHacks 2026 — CMU
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Privacy</a>
            <a href="#" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Terms</a>
            <a href="https://github.com" target="_blank" className="text-text-secondary hover:text-text-primary transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.open}
        onClose={() => setAuthModal({ ...authModal, open: false })}
        mode={authModal.mode}
      />
    </div>
  );
}
