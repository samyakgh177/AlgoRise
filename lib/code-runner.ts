import axios from "axios";

export type SupportedLanguage = "PYTHON" | "JAVASCRIPT" | "JAVA" | "TYPESCRIPT" | "CPP";

export interface TestCaseInput {
  input: string;
  output: string;
}

export interface TestCaseExecutionResult {
  testCase: number;
  passed: boolean;
  stdout: string | null;
  expected: string;
  stderr: string | null;
  compile_output: string | null;
  status: string;
  memory?: string;
  time?: string;
}

export interface ExecutionSummary {
  allPassed: boolean;
  results: TestCaseExecutionResult[];
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Compilation Error";
  language: string;
}

const WANDBOX_COMPILERS: Record<string, string> = {
  PYTHON: "cpython-3.12.7",
  JAVASCRIPT: "nodejs-20.17.0",
  JAVA: "openjdk-jdk-21+35",
  TYPESCRIPT: "typescript-5.6.2",
  CPP: "gcc-14.2.0",
};

const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  PYTHON: "Python",
  JAVASCRIPT: "JavaScript",
  JAVA: "Java",
  TYPESCRIPT: "TypeScript",
  CPP: "C++",
  "71": "Python",
  "63": "JavaScript",
  "62": "Java",
  "74": "TypeScript",
};

export function normalizeLanguage(lang: string | number): string {
  const str = String(lang).toUpperCase().trim();
  if (str === "71" || str === "PYTHON" || str === "PY") return "PYTHON";
  if (str === "63" || str === "JAVASCRIPT" || str === "JS" || str === "NODE") return "JAVASCRIPT";
  if (str === "62" || str === "JAVA") return "JAVA";
  if (str === "74" || str === "TYPESCRIPT" || str === "TS") return "TYPESCRIPT";
  if (str === "CPP" || str === "C++") return "CPP";
  return str;
}

export function getLanguageDisplayName(lang: string | number): string {
  const normalized = normalizeLanguage(lang);
  return LANGUAGE_DISPLAY_NAMES[normalized] || String(lang);
}

/**
 * Normalizes user code for single-file compilation environments (e.g. Wandbox).
 * Java requires the class to be non-public if filename is prog.java.
 */
function sanitizeCode(language: string, code: string): string {
  const normalized = normalizeLanguage(language);
  if (normalized === "JAVA") {
    return code.replace(/public\s+class\s+(\w+)/g, "class $1");
  }
  return code;
}

/**
 * Automatically merges the input/output driver harness from codeSnippets if the solutionCode
 * is only a raw function definition without I/O handling (e.g. readline, Scanner, sys.stdin).
 */
export function attachDriverHarnessIfMissing(
  language: string,
  solutionCode: string,
  snippetCode?: string
): string {
  if (!snippetCode || !solutionCode) return solutionCode;
  const normalized = normalizeLanguage(language);

  if (normalized === "JAVASCRIPT" || normalized === "TYPESCRIPT") {
    const hasDriver = /readline|process\.stdin|readFileSync|prompt\(/i.test(solutionCode);
    if (!hasDriver) {
      const driverMatch = snippetCode.match(/(\/\/\s*(?:Parse input|Add readline|Input parsing)[\s\S]*|const\s+readline\s*=[\s\S]*|const\s+fs\s*=[\s\S]*)/i);
      if (driverMatch && driverMatch[0]) {
        return `${solutionCode.trim()}\n\n${driverMatch[0].trim()}`;
      }
    }
  } else if (normalized === "PYTHON") {
    const hasDriver = /sys\.stdin|input\(|if\s+__name__\s*==/i.test(solutionCode);
    if (!hasDriver) {
      const driverMatch = snippetCode.match(/(\/\/\s*(?:Parse input|Input parsing)[\s\S]*|#\s*(?:Input parsing|Parse input)[\s\S]*|if\s+__name__\s*==\s*["']__main__["'][\s\S]*|import\s+sys[\s\S]*)/i);
      if (driverMatch && driverMatch[0]) {
        return `${solutionCode.trim()}\n\n${driverMatch[0].trim()}`;
      }
    }
  } else if (normalized === "JAVA") {
    const hasMain = /public\s+static\s+void\s+main/i.test(solutionCode);
    if (!hasMain) {
      const mainMatch = snippetCode.match(/(public\s+static\s+void\s+main\s*\([^)]*\)\s*\{[\s\S]*?\n\s*\})/);
      if (mainMatch && mainMatch[0]) {
        const lastBraceIdx = solutionCode.lastIndexOf("}");
        if (lastBraceIdx !== -1) {
          return `${solutionCode.slice(0, lastBraceIdx)}\n  ${mainMatch[0]}\n}`;
        }
      }
    }
  }

  return solutionCode;
}

/**
 * Execute a single test case using the Wandbox free API.
 */
async function runWithWandbox(
  language: string,
  code: string,
  stdin: string,
  timeoutMs = 35000
): Promise<{ stdout: string; stderr: string; compileOutput: string; exitCode: number; time: string }> {
  const normalized = normalizeLanguage(language);
  const compiler = WANDBOX_COMPILERS[normalized] || WANDBOX_COMPILERS.PYTHON;
  const sanitized = sanitizeCode(normalized, code);

  // Guarantee standard input terminates with a newline so line readers (e.g. Scanner.nextLine) don't hang
  const formattedStdin = stdin !== undefined && stdin !== null ? (stdin.endsWith("\n") ? stdin : stdin + "\n") : "\n";

  const startTime = Date.now();
  const response = await axios.post(
    "https://wandbox.org/api/compile.json",
    {
      compiler,
      code: sanitized,
      stdin: formattedStdin,
    },
    {
      timeout: timeoutMs,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(3);
  const data = response.data || {};

  const stdout = (data.program_output || "").trim();
  const stderr = (data.program_error || "").trim();
  const compileOutput = (data.compiler_error || data.compiler_message || "").trim();
  const exitCode = parseInt(data.status || "0", 10);

  return {
    stdout,
    stderr,
    compileOutput,
    exitCode,
    time: `${durationSec} s`,
  };
}

/**
 * Execute a single test case using a self-hosted or public Piston instance if configured.
 */
async function runWithPiston(
  pistonUrl: string,
  language: string,
  code: string,
  stdin: string,
  timeoutMs = 35000
): Promise<{ stdout: string; stderr: string; compileOutput: string; exitCode: number; time: string }> {
  const normalized = normalizeLanguage(language).toLowerCase();
  const sanitized = sanitizeCode(normalized, code);
  const formattedStdin = stdin !== undefined && stdin !== null ? (stdin.endsWith("\n") ? stdin : stdin + "\n") : "\n";

  const startTime = Date.now();
  const endpoint = pistonUrl.replace(/\/+$/, "") + "/execute";

  const response = await axios.post(
    endpoint,
    {
      language: normalized === "javascript" ? "node" : normalized,
      version: "*",
      files: [{ content: sanitized }],
      stdin: formattedStdin,
    },
    { timeout: timeoutMs }
  );

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(3);
  const run = response.data?.run || {};
  const compile = response.data?.compile || {};

  return {
    stdout: (run.stdout || "").trim(),
    stderr: (run.stderr || "").trim(),
    compileOutput: (compile.stderr || compile.stdout || "").trim(),
    exitCode: run.code ?? 0,
    time: `${durationSec} s`,
  };
}

/**
 * Main execution function: executes code across test cases sequentially.
 * Running sequentially prevents upstream queues from causing timeout spikes on compilers like openjdk.
 */
export async function executeTestCases(
  language: string | number,
  sourceCode: string,
  testCases: Array<{ stdin: string; expectedOutput: string }>
): Promise<ExecutionSummary> {
  const customPiston = process.env.PISTON_URL?.trim();
  const normalized = normalizeLanguage(language);
  const results: TestCaseExecutionResult[] = [];

  for (let index = 0; index < testCases.length; index++) {
    const tc = testCases[index];
    try {
      const raw = customPiston
        ? await runWithPiston(customPiston, normalized, sourceCode, tc.stdin)
        : await runWithWandbox(normalized, sourceCode, tc.stdin);

      const expected = (tc.expectedOutput || "").trim();
      const stdout = raw.stdout !== undefined && raw.stdout !== null ? raw.stdout : "";

      let status = "Accepted";
      let passed = false;

      if (raw.compileOutput && raw.exitCode !== 0) {
        status = "Compilation Error";
      } else if (raw.stderr && raw.exitCode !== 0) {
        status = "Runtime Error";
      } else if (stdout.trim() === expected) {
        status = "Accepted";
        passed = true;
      } else {
        status = "Wrong Answer";
      }

      results.push({
        testCase: index + 1,
        passed,
        stdout: stdout || null,
        expected,
        stderr: raw.stderr || null,
        compile_output: raw.compileOutput || null,
        status,
        memory: "1024 KB",
        time: raw.time,
      });
    } catch (err: any) {
      console.error(`Execution error for test case ${index + 1}:`, err.message);
      results.push({
        testCase: index + 1,
        passed: false,
        stdout: null,
        expected: (tc.expectedOutput || "").trim(),
        stderr: err.message || "Execution failed",
        compile_output: null,
        status: "Runtime Error",
        memory: undefined,
        time: "0.000 s",
      });
    }
  }

  const allPassed = results.length > 0 && results.every((r) => r.passed);
  let overallStatus: ExecutionSummary["status"] = "Wrong Answer";

  if (allPassed) {
    overallStatus = "Accepted";
  } else if (results.some((r) => r.status === "Compilation Error")) {
    overallStatus = "Compilation Error";
  } else if (results.some((r) => r.status === "Runtime Error")) {
    overallStatus = "Runtime Error";
  }

  return {
    allPassed,
    results,
    status: overallStatus,
    language: getLanguageDisplayName(language),
  };
}
