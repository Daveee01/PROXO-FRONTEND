"use client";

import { useState } from "react";
import { LandingPage } from "@/components/landing-page";
import { ARCameraInterfaceWebXR } from "@/components/ar-camera-interface-webxr";

export default function Home() {
  const [showAR, setShowAR] = useState(false);

  if (showAR) {
    return <ARCameraInterfaceWebXR onClose={() => setShowAR(false)} />;
  }

  return <LandingPage onStartAR={() => setShowAR(true)} />;
}
