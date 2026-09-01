import React, { createContext, useState, useCallback } from "react";

export const UiContext = createContext();

export function UiProvider({ children }) {
  const [exploreOpen, setExploreOpenState] = useState(false);

  const setExploreOpen = useCallback((value) => {
    if (typeof value === "function") {
      setExploreOpenState((prev) => value(prev));
    } else {
      setExploreOpenState(value);
    }
  }, []);

  return (
    <UiContext.Provider value={{ exploreOpen, setExploreOpen }}>
      {children}
    </UiContext.Provider>
  );
}
