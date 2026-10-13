"use client";
import { useEffect, useState } from "react";
import { Session } from "@/types/campaign";
export const fresh = (): Session => ({
  stage: 0,
  started: Date.now(),
  timer: false,
  budgets: { broad: 3000000, lal: 3000000, rt: 2000000 },
  actions: [],
  rationale: "",
  evidence: [],
  monitors: [],
  rule: "",
  submissions: [],
});
const key = "glow-nature-session-v1";
export function useSession() {
  const [session, setSession] = useState<Session>(fresh);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const s = JSON.parse(raw);
        if (
          s &&
          s.budgets &&
          Array.isArray(s.actions) &&
          Array.isArray(s.evidence) &&
          Array.isArray(s.monitors) &&
          Array.isArray(s.submissions) &&
          typeof s.rationale === "string" &&
          typeof s.rule === "string" &&
          s.stage >= 0 &&
          s.stage <= 3
        )
          setSession(s);
      }
    } catch {
      setStorageError(true);
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded)
      try {
        localStorage.setItem(key, JSON.stringify(session));
      } catch {
        setStorageError(true);
      }
  }, [session, loaded]);
  return {
    session,
    setSession,
    loaded,
    storageError,
    reset: () => {
      setSession(fresh());
      try {
        localStorage.removeItem(key);
      } catch {
        setStorageError(true);
      }
    },
  };
}
