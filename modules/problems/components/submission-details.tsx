import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CpuIcon, Code, CheckCircle2, XCircle } from "lucide-react";

interface SubmissionDetailsProps {
  submission: any;
}

export const SubmissionDetails = ({ submission }: SubmissionDetailsProps) => {
  const isSuccess = submission.status === "Accepted";

  const averageMemory = (() => {
    if (!submission.memory) return 0;
    try {
      const arr = JSON.parse(submission.memory);
      if (!Array.isArray(arr) || arr.length === 0) return 0;
      return arr.reduce((a: any, b: any) => parseFloat(a) + parseFloat(b), 0) / arr.length;
    } catch {
      return 0;
    }
  })();

  const averageTime = (() => {
    if (!submission.time) return 0;
    try {
      const arr = JSON.parse(submission.time);
      if (!Array.isArray(arr) || arr.length === 0) return 0;
      return (
        arr
          .map((t: string) => parseFloat(String(t).replace(" s", "")))
          .reduce((a: number, b: number) => a + b, 0) / arr.length
      );
    } catch {
      return 0;
    }
  })();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Submission Details</CardTitle>
          {isSuccess ? (
            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Success
            </Badge>
          ) : (
            <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
              <XCircle className="mr-1 h-3 w-3" />
              Failed
            </Badge>
          )}
        </div>
        <CardDescription>
          Submitted at {new Date(submission.createdAt).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Language</p>
              <p className="text-sm text-muted-foreground">{submission.language}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CpuIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Memory (avg)</p>
              <p className="text-sm text-muted-foreground">{averageMemory.toFixed(2)} KB</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Time (avg)</p>
              <p className="text-sm text-muted-foreground">{averageTime.toFixed(3)} s</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};