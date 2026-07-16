"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ScoreWeights, DEFAULT_WEIGHTS } from "@/lib/scoring";

interface ConfigContextType {
  weights: ScoreWeights;
  setWeights: React.Dispatch<React.SetStateAction<ScoreWeights>>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [weights, setWeights] = useState<ScoreWeights>(DEFAULT_WEIGHTS);

  return (
    <ConfigContext.Provider value={{ weights, setWeights }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}
