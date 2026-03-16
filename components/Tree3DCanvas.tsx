"use client";

import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense } from "react";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";

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
      <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Tree3D />
    </>
  );
}

export default function Tree3DCanvas() {
  return (
    <div className="w-full h-full">
      <Canvas>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
