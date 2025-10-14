// types/code-execution.ts
export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
  files?: string[];
}