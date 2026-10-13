import { z } from "zod";
import { validate } from "@/lib/simulation";
export const identitySchema = z
  .object({
    studentName: z
      .string()
      .trim()
      .min(3, "Nhập họ và tên (ít nhất 3 ký tự).")
      .max(100)
      .regex(
        /^[\p{L}\p{M} .’'-]+$/u,
        "Họ tên chỉ gồm chữ, khoảng trắng và dấu tên.",
      )
      .refine((n) => n.split(/\s+/).length >= 2, "Nhập đầy đủ họ và tên."),
    classCode: z
      .string()
      .trim()
      .toUpperCase()
      .min(2, "Nhập mã lớp, ví dụ DP27.")
      .max(24)
      .regex(/^[A-Z0-9][A-Z0-9_-]+$/, "Mã lớp chỉ gồm chữ, số, dấu - hoặc _."),
  })
  .strict();
export const decisionSchema = z
  .object({
    budgets: z
      .object({
        broad: z.number().int().min(0).max(8000000),
        lal: z.number().int().min(0).max(8000000),
        rt: z.number().int().min(0).max(8000000),
      })
      .strict(),
    actions: z
      .array(
        z
          .object({
            id: z.string().max(40),
            target: z.enum(["broad", "lal", "rt", "all"]),
          })
          .strict(),
      )
      .min(1)
      .max(3),
    rationale: z.string().min(80).max(4000),
    evidence: z
      .array(
        z
          .object({
            kind: z.enum(["observation", "hypothesis"]),
            text: z.string().min(15).max(1000),
          })
          .strict(),
      )
      .min(1)
      .max(3),
    monitors: z.array(z.string().max(40)).min(2).max(3),
    rule: z.string().min(40).max(2000),
  })
  .strict()
  .superRefine((d, ctx) => {
    for (const message of validate(d))
      ctx.addIssue({ code: "custom", message });
  });
export const submissionSchema = z
  .object({
    id: z.string().uuid(),
    receiptToken: z.string().regex(/^[a-f0-9]{64}$/),
    identity: identitySchema,
    versions: z.array(decisionSchema).min(1).max(2),
    website: z.literal("").default(""),
  })
  .strict();
export type Identity = z.infer<typeof identitySchema>;
export type SubmissionInput = z.infer<typeof submissionSchema>;
