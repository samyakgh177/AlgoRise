import { prisma } from "@/lib/db";
import { UserRole } from "@/lib/generated/prisma/enums";
import { executeTestCases, attachDriverHarnessIfMissing } from "@/lib/code-runner";
import { currentUserRole, getCurrentUserData } from "@/modules/auth/actions";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const userRole = await currentUserRole();
    const user = await getCurrentUserData();

    if (!user || !user.id) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    if (userRole !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      testCases,
      codeSnippets,
      referenceSolutions,
    } = await request.json();

    if (
      !title ||
      !description ||
      !difficulty ||
      !testCases ||
      !codeSnippets ||
      !referenceSolutions
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json(
        { error: "At least one test case is required" },
        { status: 400 },
      );
    }

    const verifiedSolutions: Record<string, string> = {};

    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const formattedTestCases = testCases.map(({ input, output }) => ({
        stdin: input,
        expectedOutput: output,
      }));

      const effectiveSolution = attachDriverHarnessIfMissing(
        language,
        solutionCode as string,
        codeSnippets?.[language],
      );
      verifiedSolutions[language] = effectiveSolution;

      const { allPassed, results } = await executeTestCases(
        language,
        effectiveSolution,
        formattedTestCases,
      );

      if (!allPassed) {
        const failedTestCase = results.find((r) => !r.passed) || results[0];
        const failedIndex = (failedTestCase?.testCase ?? 1) - 1;
        return NextResponse.json(
          {
            error: `Validation failed for ${language}`,
            testCase: {
              input: formattedTestCases[failedIndex]?.stdin,
              expectedOutput: formattedTestCases[failedIndex]?.expectedOutput,
              actualOutput: failedTestCase?.stdout,
              error: failedTestCase?.stderr || failedTestCase?.compile_output,
            },
            details: failedTestCase,
          },
          { status: 400 },
        );
      }
    }

    const newProblem = await prisma.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testCases,
        codeSnippets,
        referenceSolutions: verifiedSolutions,
        //   @ts-ignore
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Problem Created Successfully",
        data: newProblem,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to save problem to database" },
      { status: 500 },
    );
  }
}