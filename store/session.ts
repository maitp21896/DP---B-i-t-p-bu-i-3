"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Session } from "@/types/campaign";
import {
  identitySchema,
  submissionSchema,
  decisionSchema,
} from "@/lib/submissions/schema";
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
  identity: { studentName: "", classCode: "" },
  sessionId: "",
  receiptToken: "",
  delivery: null,
  pendingSubmission: null,
});
const key = "glow-nature-session-v3";
const draftSchema = z.object({
  stage: z.number().int().min(0).max(5),
  started: z.number(),
  timer: z.boolean(),
  budgets: z.object({
    broad: z.number().int().min(0).max(8000000),
    lal: z.number().int().min(0).max(8000000),
    rt: z.number().int().min(0).max(8000000),
  }),
  actions: z
    .array(
      z.object({
        id: z.string().max(40),
        target: z.enum(["broad", "lal", "rt", "all"]),
      }),
    )
    .max(3),
  rationale: z.string().max(4000),
  evidence: z
    .array(
      z.object({
        text: z.string().max(1000),
        kind: z.enum(["observation", "hypothesis"]),
      }),
    )
    .max(3),
  monitors: z.array(z.string().max(40)).max(3),
  rule: z.string().max(2000),
  submissions: z.array(decisionSchema).max(2),
  identity: z.object({
    studentName: z.string().max(100),
    classCode: z.string().max(24),
  }),
  sessionId: z.string().uuid(),
  receiptToken: z.string().regex(/^[a-f0-9]{64}$/),
  delivery: z
    .object({
      id: z.string().uuid(),
      submittedAt: z.string().datetime(),
      status: z.literal("submitted"),
    })
    .nullable(),
  pendingSubmission: submissionSchema.nullable(),
});
function newIdentifiers() {
  return {
    sessionId: crypto.randomUUID(),
    receiptToken: Array.from(crypto.getRandomValues(new Uint8Array(32)), (n) =>
      n.toString(16).padStart(2, "0"),
    ).join(""),
  };
}
export function useSession() {
  const [session, setSession] = useState<Session>(fresh);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    let next = { ...fresh(), ...newIdentifiers() };
    try {
      const raw =
        localStorage.getItem(key) ||
        localStorage.getItem("glow-nature-session-v2") ||
        localStorage.getItem("glow-nature-session-v1");
      if (raw) {
        const saved = JSON.parse(raw);
        if (!localStorage.getItem(key))
          saved.stage =
            ({ 0: 0, 1: 1, 2: 2, 3: 5 } as Record<number, number>)[
              saved.stage
            ] ?? 0;
        const parsed = draftSchema.safeParse({ ...next, ...saved });
        if (
          parsed.success &&
          Date.now() - parsed.data.started < 90 * 24 * 60 * 60 * 1000
        ) {
          next = parsed.data;
          if (!identitySchema.safeParse(next.identity).success) next.stage = 0;
        } else setStorageError(true);
      }
    } catch {
      setStorageError(true);
    }
    setSession(next);
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded)
      try {
        localStorage.setItem(key, JSON.stringify(session));
        localStorage.removeItem("glow-nature-session-v1");
        localStorage.removeItem("glow-nature-session-v2");
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
      setSession({ ...fresh(), ...newIdentifiers() });
      try {
        localStorage.removeItem(key);
        localStorage.removeItem("glow-nature-session-v1");
        localStorage.removeItem("glow-nature-session-v2");
      } catch {
        setStorageError(true);
      }
    },
  };
}
