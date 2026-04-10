"use client";

interface Step {
  step?: number;
  action?: string;
  tool?: string;
  input?: string;
  result?: string;
  reasoning?: string;
}

export default function InvestigationLog({ log, theme = "dark" }: { log: string; theme?: string }) {
  const d = theme === "dark";
  let steps: Step[] = [];
  try {
    steps = JSON.parse(log);
  } catch {
    return <p className={`text-sm ${d ? "text-gray-400" : "text-gray-500"}`}>{log}</p>;
  }

  if (!Array.isArray(steps) || steps.length === 0) {
    return <p className={`text-sm ${d ? "text-gray-400" : "text-gray-500"}`}>No investigation log available.</p>;
  }

  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-xs text-blue-400 font-bold">
              {step.step || i + 1}
            </div>
            {i < steps.length - 1 && <div className={`w-px h-full mt-1 ${d ? "bg-gray-700" : "bg-gray-300"}`} />}
          </div>
          <div className="flex-1 pb-3">
            {step.reasoning && (
              <p className={`text-sm italic mb-1 ${d ? "text-gray-300" : "text-gray-600"}`}>
                &quot;{step.reasoning}&quot;
              </p>
            )}
            {step.tool && (
              <div className={`text-xs font-mono rounded px-2 py-1 inline-block mb-1 border ${d ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200"}`}>
                <span className="text-yellow-500">Tool:</span>{" "}
                <span className={d ? "text-gray-300" : "text-gray-700"}>{step.tool}</span>
                {step.input && <span className={d ? "text-gray-400" : "text-gray-500"}>({step.input})</span>}
              </div>
            )}
            {step.result && (
              <p className={`text-xs mt-1 ${d ? "text-gray-400" : "text-gray-500"}`}>
                Result: {step.result}
              </p>
            )}
            {step.action && !step.tool && (
              <p className={`text-sm ${d ? "text-gray-300" : "text-gray-600"}`}>{step.action}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
