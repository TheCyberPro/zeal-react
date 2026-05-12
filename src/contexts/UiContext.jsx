import React, { createContext, useState } from "react";

export const UiContext = createContext();

export function UiProvider({ children }) {
  const [exploreOpen, setExploreOpen] = useState(false);
  return (
    <UiContext.Provider value={{ exploreOpen, setExploreOpen }}>
      {children}
    </UiContext.Provider>
  );
}
