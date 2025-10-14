// components/CodeExecutionPanel.tsx
import { ExecutionResult } from '../types/code-execution';

interface CodeExecutionPanelProps {
  result: ExecutionResult;
}

export default function CodeExecutionPanel({ result }: CodeExecutionPanelProps) {
  return (
    <div className="w-96 border-l border-gray-700 bg-gray-800 p-4 overflow-auto">
      <h3 className="text-lg font-semibold mb-4 text-white">Execution Result</h3>
      
      {result.success ? (
        <div className="text-green-400">
          <div className="flex items-center mb-2">
            <span className="text-sm bg-green-900 px-2 py-1 rounded">
              ✅ Success ({result.executionTime}ms)
            </span>
          </div>
          <pre className="bg-gray-900 p-3 rounded text-sm overflow-auto max-h-96">
            {result.output || 'No output'}
          </pre>
        </div>
      ) : (
        <div className="text-red-400">
          <div className="flex items-center mb-2">
            <span className="text-sm bg-red-900 px-2 py-1 rounded">
              ❌ Failed
            </span>
          </div>
          <pre className="bg-gray-900 p-3 rounded text-sm overflow-auto max-h-96">
            {result.error}
          </pre>
        </div>
      )}
      
      {result.files && result.files.length > 0 && (
        <div className="mt-4 text-sm text-gray-400">
          <div className="font-medium">Generated files:</div>
          <ul className="list-disc list-inside mt-1 space-y-1">
            {result.files.map((file, index) => (
              <li key={index} className="text-gray-300">{file}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}