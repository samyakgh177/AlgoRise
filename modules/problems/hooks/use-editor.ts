"use client";
import { getJudge0languageId } from "@/lib/judge0";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { executeCode } from "../actions";

export function useEditor(problem: any, initialLanguage = "JAVASCRIPT") {
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResponse, setExecutionResponse] = useState<any>(null);

  useEffect(() => {
    if (problem?.codeSnippets?.[selectedLanguage]) {
      setCode(problem.codeSnippets[selectedLanguage]);
    }
  }, [selectedLanguage, problem]);

  const runCode = async (isSubmitMode: boolean) => {
    if (!problem || !code) {
      toast.error("Please enter code before running");
      return;
    }

    if (!Array.isArray(problem.testCases) || problem.testCases.length === 0) {
      toast.error("No test cases found for this problem");
      return;
    }

    try {
      if (isSubmitMode) {
        setIsSubmitting(true);
      } else {
        setIsRunning(true);
      }

      const language_id = getJudge0languageId(selectedLanguage);
      const stdin = problem.testCases.map((tc: any) => tc.input);
      const expected_outputs = problem.testCases.map((tc: any) => tc.output);

      const res = await executeCode(
        code,
        language_id,
        stdin,
        expected_outputs,
        problem.id
      );

      setExecutionResponse(res);

      if (res.success) {
        if (isSubmitMode) {
          toast.success(
            res.submission?.status === "Accepted"
              ? "All test cases passed! Solution Accepted."
              : "Submission finished. Check test case results below."
          );
        } else {
          toast.success("Execution completed");
        }
      } else {
        toast.error(res.error || "Failed to execute code");
      }
    } catch (error) {
      console.error("Error executing code:", error);
      toast.error("Error executing code");
    } finally {
      setIsRunning(false);
      setIsSubmitting(false);
    }
  };

  const handleRun = () => runCode(false);
  const handleSubmit = () => runCode(true);

  return {
    selectedLanguage,
    setSelectedLanguage,
    code,
    setCode,
    isRunning,
    isSubmitting,
    executionResponse,
    handleRun,
    handleSubmit,
  };
}