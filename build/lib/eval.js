import fs from "node:fs/promises";
import path from "node:path";
function tokenize(text) {
    return text
        .toLowerCase()
        .split(/[^a-z0-9]+/g)
        .filter(Boolean);
}
function scoreOverlap(query, content) {
    const qTokens = new Set(tokenize(query));
    if (qTokens.size === 0)
        return 0;
    const cTokens = new Set(tokenize(content));
    let overlap = 0;
    for (const token of qTokens) {
        if (cTokens.has(token))
            overlap += 1;
    }
    return overlap / qTokens.size;
}
function coverageScore(expected, content) {
    if (!expected || expected.length === 0)
        return null;
    const cTokens = new Set(tokenize(content));
    let hit = 0;
    for (const keyword of expected) {
        if (cTokens.has(keyword.toLowerCase()))
            hit += 1;
    }
    return hit / expected.length;
}
export async function loadQuestions(inputDir) {
    const candidate = path.join(inputDir, "eval", "questions.json");
    try {
        const data = await fs.readFile(candidate, "utf-8");
        const parsed = JSON.parse(data);
        return parsed;
    }
    catch {
        return null;
    }
}
export function runEval(questions, corpus) {
    const results = [];
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
    const coverageValues = results.map((r) => r.coverage).filter((v) => v !== null);
    const averageCoverage = coverageValues.length
        ? coverageValues.reduce((a, b) => a + b, 0) / coverageValues.length
        : null;
    return {
        generatedAt: new Date().toISOString(),
        totalQuestions: results.length,
        averageCoverage,
        results,
    };
}
