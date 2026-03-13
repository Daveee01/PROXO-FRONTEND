"use client";

import { useEffect, useState } from "react";
import {
  Leaf,
  TreePine,
  Sparkles,
  ArrowRight,
  Wind,
  Droplets,
  Trophy,
  Users,
  Zap,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  onStartAR: () => void;
}

// Floating particle component
function FloatingParticle({ delay, duration, size, left }: { delay: number; duration: number; size: number; left: number }) {
  return (
    <div
      className="absolute bottom-0 opacity-0 animate-float"
      style={{
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      <div 
        className="rounded-full bg-primary/30"
        style={{ width: size, height: size }}
      />
    </div>
  );
}

export function LandingPage({ onStartAR }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate particles
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 6,
    size: 6 + Math.random() * 10,
    left: Math.random() * 100,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Animated background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Floating particles */}
      {mounted && particles.map((p) => (
        <FloatingParticle key={p.id} {...p} />
      ))}

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-foreground leading-tight">GreenSight</span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">AR Platform</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary/80 backdrop-blur-sm">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-foreground">Level 12</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Badge */}
        <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-foreground text-sm font-medium mb-6 border border-primary/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>AI-Powered AR Experience</span>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>

        {/* Main heading */}
        <div className={`transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <h1 className="text-5xl font-extrabold text-foreground leading-[1.1] mb-4 text-balance tracking-tight">
            Plant Trees
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Anywhere</span>
          </h1>
        </div>

        <p className={`text-muted-foreground text-lg leading-relaxed mb-8 max-w-xs text-pretty transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          Visualize trees in AR, track environmental impact, and compete with friends to save the planet.
        </p>

        {/* CTA Button */}
        <div className={`transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Button
            onClick={onStartAR}
            size="lg"
            className="rounded-full px-8 py-7 text-lg font-bold gap-3 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-xl hover:shadow-primary/25 hover:scale-105 transition-all duration-300 group"
          >
            <TreePine className="w-6 h-6" />
            Start AR Planting
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Quick stats row */}
        <div className={`flex items-center gap-6 mt-8 transition-all duration-700 delay-400 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground"><strong className="text-foreground">42K</strong> planters</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-muted-foreground"><strong className="text-foreground">Live</strong> now</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-3 gap-3 mt-10 w-full max-w-sm transition-all duration-700 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="group flex flex-col items-center p-4 rounded-3xl bg-card/80 backdrop-blur-sm border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <TreePine className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-extrabold text-foreground">24K</span>
            <span className="text-[11px] text-muted-foreground font-medium mt-0.5">Trees Planted</span>
          </div>
          <div className="group flex flex-col items-center p-4 rounded-3xl bg-card/80 backdrop-blur-sm border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Wind className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-extrabold text-foreground">480T</span>
            <span className="text-[11px] text-muted-foreground font-medium mt-0.5">CO2 Absorbed</span>
          </div>
          <div className="group flex flex-col items-center p-4 rounded-3xl bg-card/80 backdrop-blur-sm border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Droplets className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-2xl font-extrabold text-foreground">12M</span>
            <span className="text-[11px] text-muted-foreground font-medium mt-0.5">Liters Saved</span>
          </div>
        </div>

        {/* Achievement badges */}
        <div className={`mt-8 transition-all duration-700 delay-600 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <p className="text-xs text-muted-foreground mb-3">Recent Achievements</p>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/20">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
              <span className="text-muted-foreground text-xs font-bold">+5</span>
            </div>
          </div>
        </div>
      </main>

      {/* Scroll indicator */}
      <footer className="relative z-10 px-6 py-6 flex flex-col items-center">
        <ChevronDown className="w-5 h-5 text-muted-foreground animate-bounce" />
        <p className="text-xs text-muted-foreground mt-2">
          Scroll to explore more
        </p>
      </footer>

      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh) scale(0.5);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}
