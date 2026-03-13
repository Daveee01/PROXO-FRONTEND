"use client";

import { Sparkles, Check, ChevronRight, Leaf, Brain } from "lucide-react";

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

interface AIRecommendationCardProps {
  trees: Tree[];
  onSelectTree: (tree: Tree) => void;
}

export function AIRecommendationCard({ trees, onSelectTree }: AIRecommendationCardProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-black/50 backdrop-blur-2xl rounded-t-[2.5rem] border-t border-white/10 p-5 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                <Brain className="w-2.5 h-2.5 text-amber-900" />
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">AI Recommendations</h3>
              <p className="text-white/50 text-sm">Based on your environment analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 text-xs font-semibold">3 matches</span>
          </div>
        </div>

        {/* Tree Options */}
        <div className="space-y-3">
          {trees.map((tree, index) => (
            <button
              key={tree.id}
              onClick={() => onSelectTree(tree)}
              className="w-full group"
            >
              <div className={`relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 overflow-hidden ${
                index === 0 
                  ? "bg-linear-to-r from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/40" 
                  : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}>
                {/* Subtle glow for best match */}
                {index === 0 && (
                  <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 to-transparent animate-pulse" />
                )}
                
                {/* Tree Color indicator */}
                <div 
                  className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${tree.color}40, ${tree.color}20)` }}
                >
                  <div 
                    className="w-8 h-8 rounded-full"
                    style={{ background: `radial-gradient(circle, ${tree.color}, ${tree.color}80)` }}
                  />
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Tree Info */}
                <div className="flex-1 text-left relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold">{tree.name}</span>
                    {index === 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wide">
                        Best Match
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs italic mb-1">{tree.scientificName}</p>
                  <p className="text-white/50 text-sm line-clamp-1">{tree.reason}</p>
                </div>

                {/* Match Score */}
                <div className="flex flex-col items-center relative z-10">
                  <div className="relative w-14 h-14">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="3"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke={index === 0 ? "#34d399" : "rgba(255,255,255,0.3)"}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={150}
                        strokeDashoffset={150 - (150 * tree.matchScore) / 100}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-sm font-bold ${
                        index === 0 ? "text-emerald-400" : "text-white/60"
                      }`}>
                        {tree.matchScore}%
                      </span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all relative z-10" />
              </div>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="mt-4 text-center">
          <p className="text-white/30 text-xs">Tap a tree to see detailed environmental impact</p>
        </div>
      </div>
    </div>
  );
}
