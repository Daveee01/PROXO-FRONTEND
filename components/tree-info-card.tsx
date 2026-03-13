"use client";

import { ArrowLeft, Wind, Droplets, Leaf, TreePine, Sparkles, Clock, Sun, ThermometerSun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Tree {
  id: number;
  name: string;
  scientificName: string;
  co2PerYear: number;
  waterRetention: number;
  oxygenProduced: number;
  matchScore: number;
  reason: string;
  color: string;
}

interface TreeInfoCardProps {
  tree: Tree;
  onPlace: () => void;
  onBack: () => void;
}

export function TreeInfoCard({ tree, onPlace, onBack }: TreeInfoCardProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-black/50 backdrop-blur-2xl rounded-t-[2.5rem] border-t border-white/10 p-5 pb-8 max-h-[85vh] overflow-y-auto">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/50 hover:text-white mb-4 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Back to recommendations</span>
        </button>

        {/* Tree Header */}
        <div className="flex items-start gap-4 mb-6">
          <div 
            className="w-20 h-20 rounded-3xl flex items-center justify-center relative"
            style={{ background: `linear-gradient(135deg, ${tree.color}40, ${tree.color}20)` }}
          >
            <div 
              className="w-12 h-12 rounded-full shadow-lg"
              style={{ 
                background: `radial-gradient(circle, ${tree.color}, ${tree.color}80)`,
                boxShadow: `0 8px 32px ${tree.color}40`
              }}
            />
            {/* Decorative leaves */}
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Leaf className="w-3 h-3 text-emerald-400" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-xl mb-0.5">{tree.name}</h2>
            <p className="text-white/40 text-sm italic mb-2">{tree.scientificName}</p>
            <div className="flex items-center gap-2">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={176}
                    strokeDashoffset={176 - (176 * tree.matchScore) / 100}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-emerald-400 text-lg font-bold">{tree.matchScore}%</span>
                </div>
              </div>
              <span className="text-white/50 text-xs">Match<br/>Score</span>
            </div>
          </div>
        </div>

        {/* Quick facts */}
        <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex-shrink-0">
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="text-white/70 text-xs">Partial shade</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex-shrink-0">
            <ThermometerSun className="w-4 h-4 text-orange-400" />
            <span className="text-white/70 text-xs">Zone 5-8</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex-shrink-0">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-white/70 text-xs">50+ years</span>
          </div>
        </div>

        {/* Environmental Impact Stats */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-white font-semibold">Environmental Impact</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {/* CO2 Absorption */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-2xl p-4 border border-emerald-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-400/10 rounded-full blur-xl group-hover:bg-emerald-400/20 transition-colors" />
              <div className="relative">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 mb-3 shadow-lg shadow-emerald-500/20">
                  <Wind className="w-5 h-5 text-white" />
                </div>
                <p className="text-white text-2xl font-bold">{tree.co2PerYear}</p>
                <p className="text-emerald-400/70 text-xs font-medium">kg CO2/year</p>
              </div>
            </div>

            {/* Water Retention */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl p-4 border border-blue-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-400/10 rounded-full blur-xl group-hover:bg-blue-400/20 transition-colors" />
              <div className="relative">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 mb-3 shadow-lg shadow-blue-500/20">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <p className="text-white text-2xl font-bold">{tree.waterRetention}</p>
                <p className="text-blue-400/70 text-xs font-medium">L water/year</p>
              </div>
            </div>

            {/* Oxygen Produced */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-2xl p-4 border border-emerald-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-400/10 rounded-full blur-xl group-hover:bg-emerald-400/20 transition-colors" />
              <div className="relative">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 mb-3 shadow-lg shadow-emerald-500/20">
                  <TreePine className="w-5 h-5 text-white" />
                </div>
                <p className="text-white text-2xl font-bold">{tree.oxygenProduced}</p>
                <p className="text-emerald-400/70 text-xs font-medium">kg O2/year</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-gradient-to-r from-emerald-500/15 to-blue-500/10 rounded-2xl p-4 border border-emerald-500/20 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl" />
          <div className="flex items-start gap-3 relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-emerald-400 text-sm font-semibold mb-1">AI Recommendation</p>
              <p className="text-white/70 text-sm leading-relaxed">{tree.reason}</p>
            </div>
          </div>
        </div>

        {/* Place Button */}
        <Button
          onClick={onPlace}
          size="lg"
          className="w-full rounded-2xl py-7 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-lg shadow-xl shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <TreePine className="w-6 h-6 mr-2" />
          Place {tree.name}
        </Button>

        {/* Footer */}
        <p className="text-white/30 text-xs text-center mt-4">
          Tap to place this tree in your AR environment
        </p>
      </div>
    </div>
  );
}
