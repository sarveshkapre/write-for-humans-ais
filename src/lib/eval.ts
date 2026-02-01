import fs from "node:fs/promises";
import path from "node:path";

export type EvalQuestion = {
  id: string;
  query: string;
  expectedKeywords?: string[];
};

export type EvalResult = {
  id: string;
  query: string;
  topMatches: { path: string; score: number }[];
  coverage: number | null;
  ambiguity: number | null;
};

export type EvalReport = {
  generatedAt: string;
  totalQuestions: number;
  averageCoverage: number | null;
  results: EvalResult[];
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(Boolean);
}

function scoreOverlap(query: string, content: string): number {
  const qTokens = new Set(tokenize(query));
  if (qTokens.size === 0) return 0;
  const cTokens = new Set(tokenize(content));
  let overlap = 0;
  for (const token of qTokens) {
    if (cTokens.has(token)) overlap += 1;
  }
  return overlap / qTokens.size;
}

function coverageScore(expected: string[] | undefined, content: string): number | null {
  if (!expected || expected.length === 0) return null;
  const cTokens = new Set(tokenize(content));
  let hit = 0;
  for (const keyword of expected) {
    if (cTokens.has(keyword.toLowerCase())) hit += 1;
  }
  return hit / expected.length;
}

export async function loadQuestions(inputDir: string): Promise<EvalQuestion[] | null> {
  const candidate = path.join(inputDir, "eval", "questions.json");
  try {
    const data = await fs.readFile(candidate, "utf-8");
    const parsed = JSON.parse(data) as EvalQuestion[];
    return parsed;
  } catch {
    return null;
  }
}

export function runEval(
  questions: EvalQuestion[],
  corpus: { path: string; content: string }[],
  generatedAt: string,
): EvalReport {
  const results: EvalResult[] = [];

  for (const question of questions) {
    const ranked = corpus
      .map((entry) => ({
        path: entry.path,
        score: scoreOverlap(question.query, entry.content),
        coverage: coverageScore(question.expectedKeywords, entry.content),
      }))
      .sort((a, b) => b.score - a.score);

    const topMatches = ranked.slice(0, 3).map(({ path: p, score }) => ({ path: p, score }));
    const bestCoverage = ranked[0]?.coverage ?? null;
    const ambiguity = ranked.length > 1 ? Math.max(0, 1 - (ranked[0].score / (ranked[1].score + 0.01))) : null;

    results.push({
      id: question.id,
      query: question.query,
      topMatches,
      coverage: bestCoverage,
      ambiguity,
    });
  }

  const coverageValues = results.map((r) => r.coverage).filter((v): v is number => v !== null);
  const averageCoverage = coverageValues.length
    ? coverageValues.reduce((a, b) => a + b, 0) / coverageValues.length
    : null;

  return {
    generatedAt,
    totalQuestions: results.length,
    averageCoverage,
    results,
  };
}
