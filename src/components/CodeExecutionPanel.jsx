// components/CodeExecutionPanel.jsx
export default function CodeExecutionPanel({ result }) {
    if (!result) return null;

    return (
        <div className="w-1/3 border-l border-gray-700 bg-gray-800 p-4 overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Execution Result</h3>
            
            {result.success ? (
                <div className="text-green-400">
                    <div className="flex items-center mb-2">
                        <span className="text-sm bg-green-900 px-2 py-1 rounded">
                            ✅ Success ({result.executionTime}ms)
                        </span>
                    </div>
                    <pre className="bg-gray-900 p-3 rounded text-sm overflow-auto">
                        {result.output}
                    </pre>
                </div>
            ) : (
                <div className="text-red-400">
                    <div className="flex items-center mb-2">
                        <span className="text-sm bg-red-900 px-2 py-1 rounded">
                            ❌ Failed
                        </span>
                    </div>
                    <pre className="bg-gray-900 p-3 rounded text-sm overflow-auto">
                        {result.error}
                    </pre>
                </div>
            )}
            
            {result.files && (
                <div className="mt-4 text-sm text-gray-400">
                    <div>Generated files:</div>
                    <ul className="list-disc list-inside mt-1">
                        {result.files.map((file, index) => (
                            <li key={index}>{file}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}