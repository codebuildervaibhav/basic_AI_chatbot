// hooks/useCodeExecution.ts
import { useState, useCallback } from 'react';
import { ExecutionResult } from '../types/code-execution';

export const useCodeExecution = () => {
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);

  const executeCode = useCallback(async (code: string, language: string = 'java'): Promise<ExecutionResult> => {
    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const response = await fetch('/api/code/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          dependencies: [
            {
              groupId: 'org.drools',
              artifactId: 'drools-core',
              version: '7.73.0.Final'
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ExecutionResult = await response.json();
      setExecutionResult(result);
      return result;
    } catch (error) {
      const errorResult: ExecutionResult = {
        success: false,
        error: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: 0
      };
      setExecutionResult(errorResult);
      return errorResult;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  return {
    executeCode,
    isExecuting,
    executionResult
  };
};