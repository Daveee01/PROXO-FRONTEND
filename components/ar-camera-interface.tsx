"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { X, Focus, Zap, MapPin, Camera, RotateCcw, Layers, Sparkles, Check, Wind, Droplets, Leaf, ChevronDown, ChevronUp, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIRecommendationCard } from "./ai-recommendation-card";

interface ARCameraInterfaceProps {
  onClose: () => void;
}

const treeData = [
  {
    id: 1,
    name: "Japanese Maple",
    scientificName: "Acer palmatum",
    co2PerYear: 22,
    waterRetention: 120,
    oxygenProduced: 118,
    matchScore: 94,
    reason: "Perfect for your climate zone with moderate sunlight exposure. Thrives in partial shade conditions.",
    color: "#dc2626",
  },
  {
    id: 2,
    name: "Oak Tree",
    scientificName: "Quercus robur",
    co2PerYear: 48,
    waterRetention: 450,
    oxygenProduced: 260,
    matchScore: 87,
    reason: "Excellent CO2 absorption and longevity. Will thrive in this soil type for 200+ years.",
    color: "#16a34a",
  },
  {
    id: 3,
    name: "Cherry Blossom",
    scientificName: "Prunus serrulata",
    co2PerYear: 18,
    waterRetention: 80,
    oxygenProduced: 95,
    matchScore: 91,
    reason: "Beautiful seasonal blooms with excellent air purification. Perfect for urban environments.",
    color: "#ec4899",
  },
];

type PlacementPos = { x: number; y: number };

// â”€â”€ Low-poly 3D tree built from Three.js primitives â”€â”€
function LowPolyTree({ color, dimmed }: { color: string; dimmed: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const threeColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.03;
  });

  const opacity = dimmed ? 0.7 : 1;

  return (
    <group ref={groupRef}>
      {/* Ground shadow */}
      <mesh position={[0, -1.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.65, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.18} />
      </mesh>
      {/* Trunk */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.09, 0.14, 1.1, 8]} />
        <meshStandardMaterial color="#92400e" transparent opacity={opacity} />
      </mesh>
      {/* Bottom canopy */}
      <mesh position={[0, 0.55, 0]}>
        <coneGeometry args={[0.85, 1.5, 7]} />
        <meshStandardMaterial color={threeColor} flatShading transparent opacity={opacity} />
      </mesh>
      {/* Mid canopy */}
      <mesh position={[0, 1.4, 0]}>
        <coneGeometry args={[0.6, 1.2, 6]} />
        <meshStandardMaterial color={threeColor} flatShading transparent opacity={opacity} />
      </mesh>
      {/* Top canopy */}
      <mesh position={[0, 2.1, 0]}>
        <coneGeometry args={[0.35, 0.9, 5]} />
        <meshStandardMaterial color={threeColor} flatShading transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

// Pulsing ground ring shown in placement mode
function GroundRing({ color }: { color: string }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const threeColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.08);
  });

  return (
    <mesh ref={ringRef} position={[0, -1.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.62, 0.78, 32]} />
      <meshBasicMaterial color={threeColor} transparent opacity={0.75} side={THREE.DoubleSide} />
    </mesh>
  );
}

// Scene â€” converts screen tap position to 3D world coords
function ARScene({
  showTree,
  treeColor,
  screenPos,
  isPlacementMode,
}: {
  showTree: boolean;
  treeColor: string;
  screenPos: PlacementPos;
  isPlacementMode: boolean;
}) {
  const { camera, size } = useThree();

  const worldPos = useMemo(() => {
    const ndcX = (screenPos.x / size.width) * 2 - 1;
    const ndcY = -((screenPos.y / size.height) * 2 - 1);
    const vec = new THREE.Vector3(ndcX, ndcY, 0.5);
    vec.unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    // Rayâ€“plane intersection at z = 0
    const t = -camera.position.z / dir.z;
    return camera.position.clone().add(dir.multiplyScalar(t));
  }, [screenPos.x, screenPos.y, size.width, size.height, camera]);

  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[4, 8, 4]} intensity={1.5} />
      {showTree && (
        <group position={[worldPos.x, worldPos.y, worldPos.z]}>
          <LowPolyTree color={treeColor} dimmed={isPlacementMode} />
          {isPlacementMode && <GroundRing color={treeColor} />}
        </group>
      )}
    </>
  );
}

export function ARCameraInterface({ onClose }: ARCameraInterfaceProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [selectedTree, setSelectedTree] = useState(treeData[0]);
  const [scanProgress, setScanProgress] = useState(0);
  const [placementMode, setPlacementMode] = useState(false);
  const [treePlaced, setTreePlaced] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [treePosition, setTreePosition] = useState<PlacementPos>({ x: 0, y: 0 });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const arViewRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start real camera
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" }, // rear cam on mobile
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setCameraError(err instanceof Error ? err.message : "Camera unavailable");
      }
    }
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Scanning progress
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            setIsScanning(false);
            setTimeout(() => setShowRecommendation(true), 300);
            return 100;
          }
          return prev + 1.5;
        });
      }, 40);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const handleSelectTree = (tree: (typeof treeData)[0]) => {
    setSelectedTree(tree);
    setShowRecommendation(false);
    setTreePosition({
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.72,
    });
    setPlacementMode(true);
  };

  // Supports both mouse (desktop) and touch (mobile)
  const handleGroundTap = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    if (!placementMode || !arViewRef.current) return;
    const rect = arViewRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    // Only place in the bottom 45% of screen (the "ground" zone)
    if (y > rect.height * 0.55) {
      setTreePosition({ x, y });
    }
  };

  const handleConfirmPlacement = () => {
    setPlacementMode(false);
    setTreePlaced(true);
  };

  const handleAddMore = () => {
    setTreePlaced(false);
    setShowImpact(false);
    setShowRecommendation(true);
  };

  const showTree = placementMode || treePlaced;

  return (
    <div
      ref={arViewRef}
      className="fixed inset-0 bg-black overflow-hidden touch-none"
      onClick={handleGroundTap as React.MouseEventHandler<HTMLDivElement>}
      onTouchStart={handleGroundTap as React.TouchEventHandler<HTMLDivElement>}
    >
      {/* â”€â”€ LAYER 1: Real camera video â”€â”€ */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Fallback gradient when camera is unavailable */}
      {cameraError && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-linear-to-b from-sky-400 via-sky-300 to-emerald-200" />
          <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-linear-to-t from-emerald-700 via-emerald-600 to-emerald-500" />
          <div className="absolute top-20 right-10 w-24 h-24 bg-yellow-200/60 rounded-full blur-2xl" />
        </div>
      )}

      {/* â”€â”€ LAYER 2: Three.js transparent canvas â”€â”€ */}
      <div className="absolute inset-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
        >
          <ARScene
            showTree={showTree}
            treeColor={selectedTree.color}
            screenPos={treePosition}
            isPlacementMode={placementMode}
          />
        </Canvas>
      </div>

      {/* â”€â”€ LAYER 3: AR grid (ground hint) â”€â”€ */}
      {!treePlaced && !isScanning && (
        <div className="absolute bottom-0 left-0 right-0 h-[40%] overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute inset-0" style={{ perspective: "500px" }}>
            <svg
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              style={{ transform: "rotateX(60deg)", transformOrigin: "bottom" }}
            >
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="200%" fill="url(#grid)" />
            </svg>
          </div>
        </div>
      )}

      {/* â”€â”€ LAYER 4: UI overlays â”€â”€ */}

      {/* TOP BAR */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-11 h-11 rounded-2xl bg-black/20 backdrop-blur-xl text-white hover:bg-black/40 border border-white/10"
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10">
            <div className={`w-2 h-2 rounded-full animate-pulse ${cameraError ? "bg-red-400" : "bg-emerald-400"}`} />
            <Camera className={`w-4 h-4 ${cameraError ? "text-red-400" : "text-emerald-400"}`} />
            <span className="text-white text-sm font-medium">
              {cameraError ? "Preview Mode" : "AR Active"}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => e.stopPropagation()}
            className="w-11 h-11 rounded-2xl bg-black/20 backdrop-blur-xl text-white hover:bg-black/40 border border-white/10"
          >
            <Layers className="w-5 h-5" />
          </Button>
        </div>

        {/* Environmental quick-stats after placement */}
        {treePlaced && (
          <div className="mt-3 pointer-events-auto animate-in slide-in-from-top-4 duration-500">
            <div className="flex gap-2 justify-center">
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold text-sm">{selectedTree.oxygenProduced} kg</span>
                <span className="text-white/50 text-xs">Oâ‚‚/yr</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10">
                <Wind className="w-4 h-4 text-sky-400" />
                <span className="text-sky-400 font-bold text-sm">{selectedTree.co2PerYear} kg</span>
                <span className="text-white/50 text-xs">COâ‚‚/yr</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-bold text-sm">{selectedTree.waterRetention}L</span>
                <span className="text-white/50 text-xs">/yr</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Side controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => e.stopPropagation()}
          className="w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-xl text-white hover:bg-black/40 border border-white/10"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* SCANNING INDICATOR */}
      {isScanning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-56 h-56">
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl animate-pulse" />
              <svg className="w-full h-full -rotate-90">
                <circle cx="112" cy="112" r="100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <circle
                  cx="112" cy="112" r="100" fill="none"
                  stroke="url(#scanGrad)" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={628}
                  strokeDashoffset={628 - (628 * scanProgress) / 100}
                  className="transition-all duration-100"
                />
                <defs>
                  <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Focus className="w-14 h-14 text-emerald-400 animate-pulse mb-2" />
                <span className="text-white text-3xl font-bold">{Math.round(scanProgress)}%</span>
              </div>
            </div>
            <div className="text-center bg-black/30 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/10">
              <div className="flex items-center gap-2 justify-center mb-1">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <p className="text-white font-semibold">AI Analyzing Environment</p>
              </div>
              <p className="text-white/60 text-sm">Detecting soil type, sunlight, and space...</p>
            </div>
          </div>
        </div>
      )}

      {/* AI RECOMMENDATION CARD */}
      {showRecommendation && (
        <div onClick={(e) => e.stopPropagation()}>
          <AIRecommendationCard trees={treeData} onSelectTree={handleSelectTree} />
        </div>
      )}

      {/* PLACEMENT MODE PANEL */}
      {placementMode && (
        <div
          className="absolute bottom-0 left-0 right-0 p-4 pb-8 animate-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Move className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-white/70 text-sm">Tap the ground to position your tree</p>
            </div>
            <div className="flex items-center gap-3 mb-4 bg-white/5 rounded-2xl p-3 border border-white/5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${selectedTree.color}25` }}
              >
                <Leaf className="w-5 h-5" style={{ color: selectedTree.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{selectedTree.name}</p>
                <p className="text-white/50 text-xs truncate">{selectedTree.scientificName}</p>
              </div>
              <div className="flex items-center gap-1 bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-500/30 shrink-0">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-bold">{selectedTree.matchScore}%</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => { setPlacementMode(false); setShowRecommendation(true); }}
                variant="outline"
                className="flex-1 rounded-xl py-5 bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirmPlacement}
                className="flex-1 rounded-xl py-5 bg-linear-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-600 hover:to-emerald-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Confirm Placement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* POST-PLACEMENT PANEL */}
      {treePlaced && (
        <div
          className="absolute bottom-0 left-0 right-0 animate-in slide-in-from-bottom-4 duration-500"
          onClick={(e) => e.stopPropagation()}
        >
          {showImpact && (
            <div className="mx-4 mb-2 bg-black/40 backdrop-blur-2xl rounded-3xl p-5 border border-white/10 animate-in slide-in-from-bottom-2 duration-300">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-400" />
                Environmental Impact
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-400" />
                    <span className="text-white/80 text-sm">Oxygen Produced</span>
                  </div>
                  <span className="text-emerald-400 font-bold">{selectedTree.oxygenProduced} kg/year</span>
                </div>
                <div className="flex items-center justify-between bg-sky-500/10 rounded-xl p-3 border border-sky-500/20">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-sky-400" />
                    <span className="text-white/80 text-sm">COâ‚‚ Absorbed</span>
                  </div>
                  <span className="text-sky-400 font-bold">{selectedTree.co2PerYear} kg/year</span>
                </div>
                <div className="flex items-center justify-between bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span className="text-white/80 text-sm">Water Retention</span>
                  </div>
                  <span className="text-blue-400 font-bold">{selectedTree.waterRetention} L/year</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 pb-8">
            <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold">Tree Planted!</h3>
                  <p className="text-white/60 text-sm truncate">{selectedTree.name} added to your garden</p>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/30 shrink-0">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-400 text-xs font-bold">+150 XP</span>
                </div>
              </div>
              <Button
                onClick={() => setShowImpact(!showImpact)}
                variant="outline"
                className="w-full rounded-xl py-4 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 mb-3 flex items-center justify-center gap-2"
              >
                <Leaf className="w-4 h-4" />
                {showImpact ? "Hide" : "Show"} Environmental Impact
                {showImpact ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </Button>
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 rounded-xl py-5 bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  Done
                </Button>
                <Button
                  onClick={handleAddMore}
                  className="flex-1 rounded-xl py-5 bg-linear-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-600 hover:to-emerald-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Plant More
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
