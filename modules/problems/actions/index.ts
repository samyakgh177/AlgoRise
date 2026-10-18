"use server";
import { prisma } from "@/lib/db";
import { executeTestCases } from "@/lib/code-runner";
import { getCurrentUserData } from "@/modules/auth/actions";

export const getAllProblems = async () => {
  try {
    const problems = await prisma.problem.findMany({
      include: {
        solvedBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: problems,
    };
  } catch (error) {
    console.error("❌ Error fetching problems:", error);
    return { success: false, error: "Failed to fetch problems" };
  }
};

export const getProblemById = async (id: string) => {
  try {
    const problem = await prisma.problem.findUnique({
      where: {
        id: id,
      },
    });

    return {
      success: true,
      data: problem,
    };
  } catch (error) {
    console.error("❌ Error fetching problem:", error);
    return { success: false, error: "Failed to fetch problem" };
  }
};

export const executeCode = async (
  source_code: string,
  language_id: string | number,
  stdin: string[],
  expected_outputs: string[],
  id: string,
) => {
  const user = await getCurrentUserData();

  if (!user || !user.id) {
    return { success: false, error: "Please log in to submit code" };
  }

  if (
    !Array.isArray(stdin) ||
    stdin.length === 0 ||
    !Array.isArray(expected_outputs) ||
    expected_outputs.length !== stdin.length
  ) {
    return { success: false, error: "Invalid Test Cases" };
  }

  const testCases = stdin.map((input, idx) => ({
    stdin: input,
    expectedOutput: expected_outputs[idx] ?? "",
  }));

  const execution = await executeTestCases(language_id, source_code, testCases);
  const { allPassed, results, language } = execution;

  const submission = await prisma.submission.create({
    data: {
      userId: user.id,
      problemId: id,
      sourceCode: source_code,
      language,
      stdin: stdin.join("\n"),
      stdout: JSON.stringify(results.map((r) => r.stdout)),
      stderr: results.some((r) => r.stderr)
        ? JSON.stringify(results.map((r) => r.stderr))
        : null,
      compileOutput: results.some((r) => r.compile_output)
        ? JSON.stringify(results.map((r) => r.compile_output))
        : null,
      status: allPassed ? "Accepted" : "Wrong Answer",
      memory: results.some((r) => r.memory)
        ? JSON.stringify(results.map((r) => r.memory))
        : null,
      time: results.some((r) => r.time)
        ? JSON.stringify(results.map((r) => r.time))
        : null,
    },
  });

  if (allPassed) {
    await prisma.problemSolved.upsert({
      where: {
        userId_problemId: { userId: user.id, problemId: id },
      },
      update: {},
      create: {
        userId: user.id,
        problemId: id,
      },
    });
  }

  const testCaseResults = results.map((result) => ({
    submissionId: submission.id,
    testCase: result.testCase,
    passed: result.passed,
    stdout: result.stdout,
    expected: result.expected,
    stderr: result.stderr,
    compileOutput: result.compile_output,
    status: result.status,
    memory: result.memory,
    time: result.time,
  }));

  await prisma.testCaseResult.createMany({ data: testCaseResults });

  const submissionWithTestCases = await prisma.submission.findUnique({
    where: { id: submission.id },
    include: {
      testCases: true,
    },
  });

  return {
    success: true,
    submission: submissionWithTestCases,
  };
};

export const getAllSubmissionByCurrentUserForProblem = async (
  problemId: string,
) => {
  const user = await getCurrentUserData();

  if (!user || !user.id) {
    return {
      success: true,
      data: [],
    };
  }

  const submissions = await prisma.submission.findMany({
    where: {
      problemId: problemId,
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    success: true,
    data: submissions,
  };
};