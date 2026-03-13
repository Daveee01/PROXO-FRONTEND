"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { XR, XRDomOverlay, createXRStore } from "@react-three/xr";
import * as THREE from "three";
import {
  X,
  Focus,
  Zap,
  MapPin,
  Camera,
  RotateCcw,
  Layers,
  Sparkles,
  Check,
  Wind,
  Droplets,
  Leaf,
  ChevronDown,
  ChevronUp,
  Move,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIRecommendationCard } from "./ai-recommendation-card";

interface ARCameraInterfaceProps {
  onClose: () => void;
}

type Tree = {
  id: number;
  name: string;
  scientificName: string;
  co2PerYear: number;
  waterRetention: number;
  oxygenProduced: number;
  matchScore: number;
  reason: string;
  color: string;
};

type PlacementPos = { x: number; y: number };

type XrPose = {
  position: [number, number, number];
  quaternion: [number, number, number, number];
};

const treeData: Tree[] = [
  {
    id: 1,
    name: "Japanese Maple",
    scientificName: "Acer palmatum",
    co2PerYear: 22,
    waterRetention: 120,
    oxygenProduced: 118,
    matchScore: 94,
    reason:
      "Perfect for your climate zone with moderate sunlight exposure. Thrives in partial shade conditions.",
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
    reason:
      "Excellent CO2 absorption and longevity. Will thrive in this soil type for 200+ years.",
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
    reason:
      "Beautiful seasonal blooms with excellent air purification. Perfect for urban environments.",
    color: "#ec4899",
  },
];

const xrStore = createXRStore({
  offerSession: false,
  hitTest: true,
  domOverlay: true,
  anchors: false,
  hand: false,
  controller: false,
  gaze: false,
  screenInput: false,
  transientPointer: false,
  meshDetection: false,
  planeDetection: false,
  layers: false,
  depthSensing: false,
});

function LowPolyTree({ color, dimmed }: { color: string; dimmed: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const threeColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }
    // Gentle sway only — no vertical bobbing so tree feels grounded
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.035;
  });

  const opacity = dimmed ? 0.72 : 1;

  return (
    <group ref={groupRef}>
      <mesh position={[0, -1.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.65, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.18} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.09, 0.14, 1.1, 8]} />
        <meshStandardMaterial color="#92400e" transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <coneGeometry args={[0.85, 1.5, 7]} />
        <meshStandardMaterial color={threeColor} flatShading transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <coneGeometry args={[0.6, 1.2, 6]} />
        <meshStandardMaterial color={threeColor} flatShading transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 2.1, 0]}>
        <coneGeometry args={[0.35, 0.9, 5]} />
        <meshStandardMaterial color={threeColor} flatShading transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

function GroundRing({ color }: { color: string }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const threeColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame((state) => {
    if (!ringRef.current) {
      return;
    }
    ringRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.08);
  });

  return (
    <mesh ref={ringRef} position={[0, -1.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.62, 0.78, 32]} />
      <meshBasicMaterial
        color={threeColor}
        transparent
        opacity={0.75}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function FallbackPlacementScene({
  tree,
  screenPos,
  isPlacementMode,
  showTree,
}: {
  tree: Tree;
  screenPos: PlacementPos;
  isPlacementMode: boolean;
  showTree: boolean;
}) {
  const { camera, size } = useThree();

  const worldPos = useMemo(() => {
    const ndcX = (screenPos.x / size.width) * 2 - 1;
    const ndcY = -((screenPos.y / size.height) * 2 - 1);
    const projected = new THREE.Vector3(ndcX, ndcY, 0.5);
    projected.unproject(camera);
    const direction = projected.sub(camera.position).normalize();
    const distance = -camera.position.z / direction.z;
    return camera.position.clone().add(direction.multiplyScalar(distance));
  }, [camera, screenPos.x, screenPos.y, size.height, size.width]);

  if (!showTree) {
    return null;
  }

  return (
    <group position={[worldPos.x, worldPos.y, worldPos.z]} scale={0.18}>
      <LowPolyTree color={tree.color} dimmed={isPlacementMode} />
      {isPlacementMode && <GroundRing color={tree.color} />}
    </group>
  );
}

// ─── XR Demo Scene ────────────────────────────────────────────────────────────
// Tree is auto-placed 2 m in front at floor level (y = 0 in local-floor space).
// No hit-test required → always visible, world-locked, never drifts.
const XR_SCALE = 0.5;          // scale → ~1.8 m tall sapling
const XR_DEPTH = -2.0;         // metres in front of user
const XR_FLOOR_OFFSET = 1.06 * XR_SCALE; // lifts trunk base to sit on y = 0

function XRPulsingRing({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const threeColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2.8) * 0.07);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity =
      0.55 + Math.sin(state.clock.elapsedTime * 2.8) * 0.2;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, XR_DEPTH]}>
      <ringGeometry args={[XR_SCALE * 0.78, XR_SCALE * 0.95, 48]} />
      <meshBasicMaterial color={threeColor} transparent opacity={0.55} side={THREE.DoubleSide} />
    </mesh>
  );
}

function XRDemoScene({ tree, placed }: { tree: Tree; placed: boolean }) {
  return (
    <>
      {/* Soft shadow circle on the floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, XR_DEPTH]}>
        <circleGeometry args={[XR_SCALE * 0.82, 40]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} />
      </mesh>

      {/* Pulsing anchor ring while awaiting confirmation */}
      {!placed && <XRPulsingRing color={tree.color} />}

      {/* Static confirmation ring after tree is placed */}
      {placed && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, XR_DEPTH]}>
          <ringGeometry args={[XR_SCALE * 0.78, XR_SCALE * 0.95, 48]} />
          <meshBasicMaterial color={tree.color} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Warm fill light so tree looks vivid against the passthrough feed */}
      <pointLight
        position={[0.6, XR_FLOOR_OFFSET + 2 * XR_SCALE, XR_DEPTH - 0.4]}
        intensity={4}
        color="#fffbe6"
      />

      {/* The tree — perfectly floor-seated at a fixed world coordinate */}
      <group position={[0, XR_FLOOR_OFFSET, XR_DEPTH]} scale={XR_SCALE}>
        <LowPolyTree color={tree.color} dimmed={!placed} />
      </group>
    </>
  );
}

export function ARCameraInterfaceWebXR({ onClose }: ARCameraInterfaceProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [selectedTree, setSelectedTree] = useState<Tree>(treeData[0]);
  const [scanProgress, setScanProgress] = useState(0);
  const [placementMode, setPlacementMode] = useState(false);
  const [treePlaced, setTreePlaced] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [treePosition, setTreePosition] = useState<PlacementPos>({ x: 0, y: 0 });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [xrSupported, setXrSupported] = useState(false);
  const [xrSupportChecked, setXrSupportChecked] = useState(false);
  const [xrActive, setXrActive] = useState(false);
  const [xrSurfaceFound, setXrSurfaceFound] = useState(false);
  const [xrError, setXrError] = useState<string | null>(null);
  const [xrPlacedPose, setXrPlacedPose] = useState<XrPose | null>(null);
  const arViewRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const latestHitRef = useRef<XrPose | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current != null) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (typeof navigator === "undefined" || navigator.mediaDevices?.getUserMedia == null) {
      setCameraError("Camera API is not available in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraError(null);

      if (videoRef.current != null) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setCameraError(
        error instanceof Error ? error.message : "Camera unavailable on this device.",
      );
    }
  }, []);

  useEffect(() => {
    void startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    let cancelled = false;

    async function checkXRSupport() {
      if (typeof navigator === "undefined" || navigator.xr?.isSessionSupported == null) {
        if (!cancelled) {
          setXrSupported(false);
          setXrSupportChecked(true);
        }
        return;
      }

      try {
        const supported = await navigator.xr.isSessionSupported("immersive-ar");
        if (!cancelled) {
          setXrSupported(supported);
          setXrSupportChecked(true);
        }
      } catch {
        if (!cancelled) {
          setXrSupported(false);
          setXrSupportChecked(true);
        }
      }
    }

    void checkXRSupport();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = xrStore.subscribe((state) => {
      const active = state.session != null;
      setXrActive(active);

      if (active) {
        // Demo mode: tree is auto-placed so surface is always "found" instantly
        setXrSurfaceFound(true);
      } else {
        setXrSurfaceFound(false);
        latestHitRef.current = null;
        if (streamRef.current == null) {
          void startCamera();
        }
      }
    });

    return unsubscribe;
  }, [startCamera]);

  useEffect(() => {
    if (!isScanning) {
      return;
    }

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
  }, [isScanning]);

  useEffect(() => {
    if (placementMode && !xrActive) {
      setTreePosition({
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.72,
      });
    }
  }, [placementMode, xrActive]);

  const handleSelectTree = (tree: Tree) => {
    setSelectedTree(tree);
    setShowRecommendation(false);
    setPlacementMode(true);
    setTreePlaced(false);
    setShowImpact(false);
    setXrPlacedPose(null);
    setXrError(null);
    latestHitRef.current = null;
  };

  const handleGroundTap = (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (xrActive || !placementMode || !arViewRef.current) {
      return;
    }

    const rect = arViewRef.current.getBoundingClientRect();

    let clientX: number;
    let clientY: number;

    if ("touches" in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (y > rect.height * 0.55) {
      setTreePosition({ x, y });
    }
  };

  const handleStartRealAR = async () => {
    if (!xrSupported) {
      setXrError("This phone/browser does not support immersive WebXR AR.");
      return;
    }

    setXrError(null);
    stopCamera();

    try {
      await xrStore.enterAR();
    } catch (error) {
      setXrError(
        error instanceof Error
          ? error.message
          : "Could not start WebXR AR on this device.",
      );
      void startCamera();
    }
  };

  const handleConfirmPlacement = () => {
    if (xrActive) {
      setPlacementMode(false);
      setTreePlaced(true);
      setXrError(null);
      return;
    }

    setPlacementMode(false);
    setTreePlaced(true);
  };

  const handleResetPlacement = () => {
    if (xrActive) {
      setTreePlaced(false);
      setPlacementMode(true);
      setShowImpact(false);
      setXrPlacedPose(null);
      latestHitRef.current = null;
      setXrSurfaceFound(false);
      return;
    }

    setTreePosition({
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.72,
    });
  };

  const handleAddMore = () => {
    setTreePlaced(false);
    setShowImpact(false);
    setShowRecommendation(true);
    setPlacementMode(false);
    setXrPlacedPose(null);
    setXrError(null);
    latestHitRef.current = null;
    setXrSurfaceFound(false);
  };

  const handleExitXR = async () => {
    await xrStore.getState().session?.end();
  };

  const cameraStatus = xrActive
    ? "WebXR Live"
    : cameraError
      ? "Preview Mode"
      : "Camera Mode";

  const showFallbackTree = !xrActive && (placementMode || treePlaced);

  return (
    <div
      ref={arViewRef}
      className="fixed inset-0 overflow-hidden bg-black touch-none"
      onClick={handleGroundTap as React.MouseEventHandler<HTMLDivElement>}
      onTouchStart={handleGroundTap as React.TouchEventHandler<HTMLDivElement>}
    >
      {!xrActive && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        />
      )}

      {!xrActive && cameraError && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-linear-to-b from-sky-400 via-sky-300 to-emerald-200" />
          <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-linear-to-t from-emerald-700 via-emerald-600 to-emerald-500" />
          <div className="absolute top-20 right-10 h-24 w-24 rounded-full bg-yellow-200/60 blur-2xl" />
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
        >
          <XR store={xrStore}>
            <ambientLight intensity={1} />
            <directionalLight position={[4, 8, 4]} intensity={1.5} />

            <FallbackPlacementScene
              tree={selectedTree}
              screenPos={treePosition}
              isPlacementMode={placementMode}
              showTree={showFallbackTree}
            />

            {xrActive && (
              <XRDemoScene tree={selectedTree} placed={treePlaced} />
            )}

            <XRDomOverlay>
              {xrActive && (
                <div className="fixed inset-0 flex flex-col justify-between p-4 pointer-events-none">
                  <div className="pointer-events-auto flex items-center justify-between gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-2 text-sm text-white backdrop-blur-xl">
                      {placementMode && !treePlaced
                        ? "Tree is ready — tap Place Tree Here to anchor it."
                        : "Tree anchored in AR space."}
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleExitXR}
                      className="border-white/20 bg-black/35 text-white hover:bg-white/10"
                    >
                      Exit AR
                    </Button>
                  </div>

                  <div className="pointer-events-auto pb-6">
                    {placementMode && !treePlaced && (
                      <div className="mx-auto max-w-sm rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur-2xl">
                        <div className="mb-3 flex items-center gap-2">
                          <Move className="h-4 w-4 text-emerald-400" />
                          <p className="text-sm text-white/80">
                            Scan the floor, then anchor the tree at the reticle.
                          </p>
                        </div>
                        <Button
                          onClick={handleConfirmPlacement}
                          className="w-full bg-linear-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Place Tree Here
                        </Button>
                      </div>
                    )}

                    {treePlaced && (
                      <div className="mx-auto max-w-sm rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur-2xl">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
                            <Check className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">Tree Planted</h3>
                            <p className="text-sm text-white/60">{selectedTree.name} anchored in AR</p>
                          </div>
                        </div>

                        <div className="mb-3 grid grid-cols-3 gap-2">
                          <div className="rounded-xl border border-white/5 bg-white/5 p-2 text-center">
                            <p className="text-sm font-bold text-emerald-400">{selectedTree.oxygenProduced}</p>
                            <p className="text-[10px] text-white/50">kg O2/yr</p>
                          </div>
                          <div className="rounded-xl border border-white/5 bg-white/5 p-2 text-center">
                            <p className="text-sm font-bold text-sky-400">{selectedTree.co2PerYear}</p>
                            <p className="text-[10px] text-white/50">kg CO2/yr</p>
                          </div>
                          <div className="rounded-xl border border-white/5 bg-white/5 p-2 text-center">
                            <p className="text-sm font-bold text-blue-400">{selectedTree.waterRetention}</p>
                            <p className="text-[10px] text-white/50">L/yr</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={handleResetPlacement}
                            className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10"
                          >
                            Reposition
                          </Button>
                          <Button
                            onClick={handleExitXR}
                            className="flex-1 bg-linear-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
                          >
                            Done
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </XRDomOverlay>
          </XR>
        </Canvas>
      </div>

      {!xrActive && !treePlaced && !isScanning && (
        <div className="absolute bottom-0 left-0 right-0 h-[40%] overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute inset-0" style={{ perspective: "500px" }}>
            <svg
              className="h-full w-full"
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

      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={(event) => {
              event.stopPropagation();
              void xrStore.getState().session?.end();
              onClose();
            }}
            className="h-11 w-11 rounded-2xl border border-white/10 bg-black/20 text-white backdrop-blur-xl hover:bg-black/40"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-xl">
            <div
              className={`h-2 w-2 rounded-full animate-pulse ${
                xrActive ? "bg-emerald-400" : cameraError ? "bg-red-400" : "bg-sky-400"
              }`}
            />
            <MapPin className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">{cameraStatus}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={(event) => {
              event.stopPropagation();
              handleResetPlacement();
            }}
            className="h-11 w-11 rounded-2xl border border-white/10 bg-black/20 text-white backdrop-blur-xl hover:bg-black/40"
          >
            <Layers className="h-5 w-5" />
          </Button>
        </div>

        {treePlaced && !xrActive && (
          <div className="mt-3 animate-in slide-in-from-top-4 duration-500 pointer-events-auto">
            <div className="flex justify-center gap-2">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-xl">
                <Leaf className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">{selectedTree.oxygenProduced} kg</span>
                <span className="text-xs text-white/50">O2/yr</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-xl">
                <Wind className="h-4 w-4 text-sky-400" />
                <span className="text-sm font-bold text-sky-400">{selectedTree.co2PerYear} kg</span>
                <span className="text-xs text-white/50">CO2/yr</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-xl">
                <Droplets className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-bold text-blue-400">{selectedTree.waterRetention}L</span>
                <span className="text-xs text-white/50">/yr</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {!xrActive && (
        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-3 pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={(event) => {
              event.stopPropagation();
              handleResetPlacement();
            }}
            className="h-12 w-12 rounded-2xl border border-white/10 bg-black/20 text-white backdrop-blur-xl hover:bg-black/40"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>
      )}

      {isScanning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-6">
            <div className="relative h-56 w-56">
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl animate-pulse" />
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="112"
                  cy="112"
                  r="100"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="3"
                />
                <circle
                  cx="112"
                  cy="112"
                  r="100"
                  fill="none"
                  stroke="url(#scanGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
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
                <Focus className="mb-2 h-14 w-14 animate-pulse text-emerald-400" />
                <span className="text-3xl font-bold text-white">{Math.round(scanProgress)}%</span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 px-6 py-4 text-center backdrop-blur-xl">
              <div className="mb-1 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <p className="font-semibold text-white">AI Analyzing Environment</p>
              </div>
              <p className="text-sm text-white/60">Detecting soil type, sunlight, and space...</p>
            </div>
          </div>
        </div>
      )}

      {showRecommendation && (
        <div onClick={(event) => event.stopPropagation()}>
          <AIRecommendationCard trees={treeData} onSelectTree={handleSelectTree} />
        </div>
      )}

      {placementMode && !xrActive && (
        <div
          className="absolute bottom-0 left-0 right-0 animate-in slide-in-from-bottom-4 p-4 pb-8 duration-300"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="rounded-3xl border border-white/10 bg-black/40 p-4 backdrop-blur-2xl">
            <div className="mb-3 flex items-center gap-2 px-1">
              <Move className="h-4 w-4 shrink-0 text-emerald-400" />
              <p className="text-sm text-white/70">Tap the ground to position your tree</p>
            </div>

            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${selectedTree.color}25` }}
              >
                <Leaf className="h-5 w-5" style={{ color: selectedTree.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{selectedTree.name}</p>
                <p className="truncate text-xs text-white/50">{selectedTree.scientificName}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-2 py-1">
                <Sparkles className="h-3 w-3 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">{selectedTree.matchScore}%</span>
              </div>
            </div>

            {xrSupportChecked && (
              <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-sky-400" />
                  <p className="text-sm font-medium text-white">Real AR Ground Scan</p>
                </div>
                <p className="text-xs text-white/60">
                  {xrSupported
                    ? "Supported here. Start WebXR to scan the floor and anchor the tree on a detected surface."
                    : "Not supported on this browser/device. The app will stay in camera preview mode."}
                </p>
              </div>
            )}

            {xrError && (
              <div className="mb-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {xrError}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setPlacementMode(false);
                  setShowRecommendation(true);
                  setXrError(null);
                }}
                variant="outline"
                className="flex-1 rounded-xl border-white/10 bg-white/5 py-5 text-white hover:bg-white/10"
              >
                Back
              </Button>
              {xrSupported ? (
                <Button
                  onClick={() => void handleStartRealAR()}
                  className="flex-1 rounded-xl bg-linear-to-r from-sky-500 to-cyan-500 py-5 font-semibold text-white hover:from-sky-600 hover:to-cyan-600"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Start Real AR
                </Button>
              ) : (
                <Button
                  onClick={handleConfirmPlacement}
                  className="flex-1 rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 py-5 font-semibold text-white hover:from-emerald-600 hover:to-emerald-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Confirm Placement
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {treePlaced && !xrActive && (
        <div
          className="absolute bottom-0 left-0 right-0 animate-in slide-in-from-bottom-4 duration-500"
          onClick={(event) => event.stopPropagation()}
        >
          {showImpact && (
            <div className="mx-4 mb-2 animate-in slide-in-from-bottom-2 rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-2xl duration-300">
              <h4 className="mb-4 flex items-center gap-2 font-bold text-white">
                <Leaf className="h-4 w-4 text-emerald-400" />
                Environmental Impact
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-white/80">Oxygen Produced</span>
                  </div>
                  <span className="font-bold text-emerald-400">
                    {selectedTree.oxygenProduced} kg/year
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-sky-400" />
                    <span className="text-sm text-white/80">CO2 Absorbed</span>
                  </div>
                  <span className="font-bold text-sky-400">{selectedTree.co2PerYear} kg/year</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-white/80">Water Retention</span>
                  </div>
                  <span className="font-bold text-blue-400">{selectedTree.waterRetention} L/year</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 pb-8">
            <div className="rounded-3xl border border-white/10 bg-black/40 p-4 backdrop-blur-2xl">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-white">Tree Planted!</h3>
                  <p className="truncate text-sm text-white/60">{selectedTree.name} added to your garden</p>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/20 px-2 py-1">
                  <Zap className="h-3 w-3 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400">+150 XP</span>
                </div>
              </div>

              <Button
                onClick={() => setShowImpact(!showImpact)}
                variant="outline"
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border-emerald-500/30 bg-emerald-500/10 py-4 text-emerald-400 hover:bg-emerald-500/20"
              >
                <Leaf className="h-4 w-4" />
                {showImpact ? "Hide" : "Show"} Environmental Impact
                {showImpact ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>

              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 rounded-xl border-white/10 bg-white/5 py-5 text-white hover:bg-white/10"
                >
                  Done
                </Button>
                <Button
                  onClick={handleAddMore}
                  className="flex-1 rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 py-5 font-semibold text-white hover:from-emerald-600 hover:to-emerald-700"
                >
                  <Zap className="mr-2 h-4 w-4" />
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
