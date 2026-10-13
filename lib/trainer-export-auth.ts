import { createHash, timingSafeEqual } from "node:crypto";
export function validExportToken(
  supplied: string,
  expected: string | undefined,
) {
  if (
    !expected ||
    expected.length < 32 ||
    supplied.length < 32 ||
    supplied.length > 512
  )
    return false;
  const hash = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(hash(supplied), hash(expected));
}
