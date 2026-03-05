"use client";

import { useState, useCallback } from "react";
import { LoadingScreen } from "@/components/game/loading-screen";
import { FruitWheelGame } from "@/components/game/fruit-wheel-game";

export default function Page() {
  const [loaded, setLoaded] = useState(false);

  const handleLoadComplete = useCallback(() => {
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <LoadingScreen onComplete={handleLoadComplete} />;
  }

  return <FruitWheelGame />;
}
