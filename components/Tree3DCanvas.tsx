"use client";

import * as THREE from "three";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Component, Suspense, type ReactNode } from "react";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";

const threeRuntime = THREE as unknown as Record<string, unknown>;
if (threeRuntime.Clock !== threeRuntime.Timer && typeof threeRuntime.Timer === "function") {
  // Keep r3f internals compatible with newer three versions that deprecate Clock.
  // Some builds expose Clock as a readonly getter, so guard the assignment.
  try {
    threeRuntime.Clock = threeRuntime.Timer;
  } catch {
    // Ignore when Clock is not writable; runtime can continue without this shim.
  }
}

class ModelErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function FallbackTree() {
  return (
    <group position={[0, -0.6, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 1.1, 16]} />
        <meshStandardMaterial color="#6b3f1f" />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <coneGeometry args={[0.55, 1.1, 18]} />
        <meshStandardMaterial color="#2f8f4e" />
      </mesh>
      <mesh position={[0, 1.95, 0]} castShadow>
        <coneGeometry args={[0.4, 0.9, 18]} />
        <meshStandardMaterial color="#3aa35a" />
      </mesh>
    </group>
  );
}

function Tree3D() {
  const materials = useLoader(MTLLoader, "/3d/Lowpoly_tree_sample.mtl");

  const obj = useLoader(OBJLoader, "/3d/Lowpoly_tree_sample.obj", (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  return <primitive object={obj} scale={[0.1, 0.1, 0.1]} position={[0, -1, 0]} />;
}

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[3, 2, 3]} />
      <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2} target={[0, 0.8, 0]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[8, 10, 6]} intensity={1.2} />
      <ModelErrorBoundary fallback={<FallbackTree />}>
        <Suspense fallback={<FallbackTree />}>
          <Tree3D />
        </Suspense>
      </ModelErrorBoundary>
    </>
  );
}

export default function Tree3DCanvas() {
  return (
    <div className="w-full h-full">
      <Canvas dpr={[1, 2]} shadows>
        <Scene />
      </Canvas>
    </div>
  );
}
