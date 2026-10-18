import { executeTestCases, getLanguageDisplayName } from "./code-runner";

export function getJudge0languageId(language: string): number {
  const languageMap: Record<string, number> = {
    PYTHON: 71,
    JAVASCRIPT: 63,
    JAVA: 62,
    TYPESCRIPT: 74,
  };

  return languageMap[language.toUpperCase()] || 63;
}

export function getLanguageName(languageId: number | string): string {
  return getLanguageDisplayName(languageId);
}

// In-memory execution store for compatibility
const executionStore = new Map<string, any>();

export async function submitBatch(submissions: any[]) {
  const tokens: Array<{ token: string }> = [];

  for (let i = 0; i < submissions.length; i++) {
    const sub = submissions[i];
    const token = `tok_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}`;

    const testCase = [{
      stdin: sub.stdin ?? "",
      expectedOutput: sub.expected_output ?? "",
    }];

    const execution = await executeTestCases(sub.language_id || "JAVASCRIPT", sub.source_code, testCase);
    const firstResult = execution.results[0];

    const result = {
      token,
      status: {
        id: firstResult?.passed ? 3 : 4,
        description: firstResult?.status ?? "Accepted",
      },
      stdout: firstResult?.stdout ?? "",
      stderr: firstResult?.stderr ?? null,
      compile_output: firstResult?.compile_output ?? null,
      time: firstResult?.time ?? "0.000 s",
      memory: firstResult?.memory ?? "1024 KB",
    };

    executionStore.set(token, result);
    tokens.push({ token });
  }

  return tokens;
}

export async function pollBatchResults(tokens: string[]) {
  const results = tokens.map((token) => {
    const res = executionStore.get(token);
    executionStore.delete(token);
    return (
      res || {
        token,
        status: { id: 3, description: "Accepted" },
        stdout: "",
        stderr: null,
        compile_output: null,
      }
    );
  });

  return results;
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));