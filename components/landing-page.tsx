"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, Leaf, Eye, Zap, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Tree3DCanvas from "@/components/Tree3DCanvas";

interface LandingPageProps {
  onStartAR: () => void;
}

export function LandingPage({ onStartAR }: LandingPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent, total: number) => {
    const touchEnd = e.changedTouches[0].clientX;

    if (touchStart - touchEnd > 50 && activeFeature < total - 1) {
      setActiveFeature(activeFeature + 1);
    } else if (touchEnd - touchStart > 50 && activeFeature > 0) {
      setActiveFeature(activeFeature - 1);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Leaf className="w-4 sm:w-5 h-4 sm:h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg text-foreground">GreenSight</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">AR Experience</p>
            </div>
          </div>
          <Button
            onClick={onStartAR}
            className="bg-primary hover:bg-accent text-primary-foreground rounded-full px-4 sm:px-6 py-2 text-xs sm:text-sm h-auto"
          >
            Launch AR
          </Button>
        </div>
      </nav>

      <section className="relative min-h-screen pt-20 pb-12 sm:pt-32 sm:pb-20 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 relative z-10 w-full">
          <div className="inline-block">
            <div className="bg-secondary/50 backdrop-blur-sm border border-border rounded-full px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 w-fit mx-auto animate-in fade-in slide-in-from-top duration-700">
              <Zap className="w-3 sm:w-4 h-3 sm:h-4 text-primary shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-foreground">Revolutionary AR Technology</span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom duration-1000 delay-100">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-balance leading-tight">
              <span className="text-foreground">See Your</span>{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-accent">
                Green Future
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2 leading-relaxed">
              Transform your environment with AR. Place virtual trees, see real impact.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4 justify-center pt-6 sm:pt-8 animate-in fade-in slide-in-from-bottom duration-1000 delay-300 w-full px-2">
            <Button
              onClick={onStartAR}
              className="bg-primary hover:bg-accent text-primary-foreground rounded-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base h-auto w-full sm:w-auto sm:mx-auto"
            >
              <Leaf className="w-4 sm:w-5 h-4 sm:h-5 mr-2 shrink-0" />
              Start AR Experience
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5 rounded-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base h-auto w-full sm:w-auto sm:mx-auto"
            >
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>

        <div className="absolute top-32 sm:top-20 left-0 sm:left-10 w-40 sm:w-72 h-40 sm:h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 sm:bottom-20 right-0 sm:right-10 w-48 sm:w-96 h-48 sm:h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </section>

      <section id="features" className="relative py-16 sm:py-24 px-4 sm:px-6 bg-secondary/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">Powerful Features</h3>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Everything you need to visualize and track your environmental impact
            </p>
          </div>

          <div className="relative">
            <div className="hidden sm:grid md:grid-cols-3 gap-4 sm:gap-6">
              {[
                {
                  icon: Eye,
                  title: "Immersive AR Placement",
                  description:
                    "Experience photorealistic trees in your actual environment with precise placement and realistic scaling.",
                  gradient: "from-primary/20 to-primary/5",
                },
                {
                  icon: Zap,
                  title: "AI-Powered Intelligence",
                  description:
                    "Smart recommendations based on your location, climate, and soil conditions for optimal tree selection.",
                  gradient: "from-accent/20 to-accent/5",
                },
                {
                  icon: Leaf,
                  title: "Real-Time Impact",
                  description:
                    "Instantly visualize environmental benefits including CO2 absorption, oxygen production, and water retention.",
                  gradient: "from-primary/20 to-accent/20",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className={`group bg-linear-to-br ${feature.gradient} border border-border rounded-2xl p-6 sm:p-8 hover:border-primary/50 transition-all duration-500 hover:shadow-lg hover:-translate-y-1`}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 sm:w-7 h-6 sm:h-7 text-primary" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="sm:hidden overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={(e) => handleTouchEnd(e, 3)}>
              <div className="flex transition-transform duration-300 ease-out" style={{ transform: `translateX(-${activeFeature * 100}%)` }}>
                {[
                  {
                    icon: Eye,
                    title: "Immersive AR Placement",
                    description:
                      "Experience photorealistic trees in your actual environment with precise placement and realistic scaling.",
                    gradient: "from-primary/20 to-primary/5",
                  },
                  {
                    icon: Zap,
                    title: "AI-Powered Intelligence",
                    description:
                      "Smart recommendations based on your location, climate, and soil conditions for optimal tree selection.",
                    gradient: "from-accent/20 to-accent/5",
                  },
                  {
                    icon: Leaf,
                    title: "Real-Time Impact",
                    description:
                      "Instantly visualize environmental benefits including CO2 absorption, oxygen production, and water retention.",
                    gradient: "from-primary/20 to-accent/20",
                  },
                ].map((feature, idx) => (
                  <div key={idx} className="w-full shrink-0 px-2">
                    <div className={`bg-linear-to-br ${feature.gradient} border border-border rounded-2xl p-6 h-full`}>
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="text-lg font-bold text-foreground mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sm:hidden flex justify-center gap-2 mt-6">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveFeature(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${activeFeature === idx ? "bg-primary w-6" : "bg-muted"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="impact" className="relative py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 order-2 md:order-1">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">Track Your Impact</h3>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                Every tree you plant through GreenSight creates measurable environmental change. Monitor growth and join a global movement toward a greener future.
              </p>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { label: "CO2 Absorption", value: "25 kg/year" },
                  { label: "Oxygen Production", value: "260 lbs/year" },
                  { label: "Water Retention", value: "1000 gallons/year" },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-secondary/50 rounded-xl border border-border hover:border-primary/50 transition-colors"
                  >
                    <Check className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-base sm:text-lg font-semibold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-64 sm:h-96 bg-linear-to-br from-primary/10 to-accent/10 rounded-3xl border border-border overflow-hidden group order-1 md:order-2">
              <Tree3DCanvas />
              <div className="absolute inset-0 bg-linear-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-24 px-4 sm:px-6 bg-linear-to-r from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">Ready to Plant?</h3>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Join thousands transforming their environment with GreenSight AR.
          </p>
          <Button
            onClick={onStartAR}
            className="bg-primary hover:bg-accent text-primary-foreground rounded-full px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-base h-auto w-full sm:w-auto"
          >
            Launch AR Experience Now
            <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2 shrink-0" />
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">GreenSight</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">Revolutionary AR tree planting technology.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-xs sm:text-base">Product</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#impact" className="hover:text-primary transition-colors">
                    Impact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-xs sm:text-base">Company</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <a href="https://example.com" className="hover:text-primary transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="https://example.com" className="hover:text-primary transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-xs sm:text-base">Legal</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <a href="https://example.com" className="hover:text-primary transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="https://example.com" className="hover:text-primary transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between text-xs sm:text-sm text-muted-foreground gap-4">
            <p>Copyright 2024 GreenSight. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="https://x.com" className="hover:text-primary transition-colors">
                Twitter
              </a>
              <a href="https://linkedin.com" className="hover:text-primary transition-colors">
                LinkedIn
              </a>
              <a href="https://instagram.com" className="hover:text-primary transition-colors">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
