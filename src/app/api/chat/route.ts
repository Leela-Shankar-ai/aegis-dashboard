import { store } from "@/lib/db";
import { NextRequest } from "next/server";

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function POST(request: NextRequest) {
  const { message } = await request.json();

  if (!message) {
    return Response.json({ error: "No message provided" }, { status: 400 });
  }

  // Get all cases as context
  const allCases = store.findAll(undefined, 100);

  const caseSummaries = allCases.map((c) => ({
    id: c.id.slice(0, 8),
    source: c.source,
    type: c.alertType,
    severity: c.severity,
    verdict: c.verdict,
    summary: c.summary,
    status: c.status,
    iocs: c.iocs.map((i) => `${i.type}: ${i.value}`).join(", "),
    mitre: c.mitreTechniques,
    time: c.createdAt,
  }));

  // Stats
  const total = allCases.length;
  const critical = allCases.filter((c) => c.severity >= 9).length;
  const high = allCases.filter((c) => c.severity >= 7 && c.severity < 9).length;
  const malicious = allCases.filter((c) => c.verdict === "MALICIOUS").length;
  const open = allCases.filter((c) => c.status === "open").length;

  const systemPrompt = `You are AEGIS Assistant, the AI chatbot for the AEGIS Autonomous SOC (Security Operations Center) Agent dashboard. You have access to all current security cases and threat data.

## Current Dashboard Stats
- Total cases: ${total}
- Critical (9-10): ${critical}
- High (7-8): ${high}
- Malicious verdicts: ${malicious}
- Open cases: ${open}

## All Cases
${JSON.stringify(caseSummaries, null, 1)}

## Your Role
- Answer questions about the current security posture, threats, and cases
- Explain what specific attacks mean in plain English
- Provide recommendations based on the data
- Help analysts understand patterns and correlations
- If asked about a specific case, provide full details from the data above
- If asked about attack types, MITRE techniques, or security concepts, explain clearly
- Keep answers concise but thorough
- Use the actual case data in your responses — don't make things up
- If the data doesn't contain what the user is asking about, say so`;

  // If no Gemini key, use a simple keyword-based response
  if (!GEMINI_KEY) {
    return Response.json({
      reply: generateFallbackResponse(message, allCases, { total, critical, high, malicious, open }),
    });
  }

  // Call Gemini
  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "Understood. I'm AEGIS Assistant with full access to the dashboard data. How can I help?" }] },
          { role: "user", parts: [{ text: message }] },
        ],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini error:", res.status, err);
      return Response.json({
        reply: `**AI service error (${res.status}).** ${truncate(err, 300)}\n\nFalling back to basic responses:\n\n${generateFallbackResponse(message, allCases, { total, critical, high, malicious, open })}`,
      });
    }

    const data = await res.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).filter(Boolean).join("\n") ||
      `Gemini returned an empty response. Raw: ${truncate(JSON.stringify(data), 300)}`;

    return Response.json({ reply });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Chat error:", err);
    return Response.json({
      reply: `**Connection error.** ${msg}\n\nFalling back to basic responses:\n\n${generateFallbackResponse(message, allCases, { total, critical, high, malicious, open })}`,
    });
  }
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

// Fallback when Gemini key isn't set — basic keyword responses using real data
function generateFallbackResponse(
  message: string,
  cases: ReturnType<typeof store.findAll>,
  stats: { total: number; critical: number; high: number; malicious: number; open: number }
): string {
  const q = message.toLowerCase();

  if (q.includes("status") || q.includes("overview") || q.includes("summary") || q.includes("how many")) {
    return `**Dashboard Overview:**\n- Total cases: ${stats.total}\n- Critical: ${stats.critical}\n- High: ${stats.high}\n- Malicious verdicts: ${stats.malicious}\n- Open cases: ${stats.open}\n\nThe most severe case is: ${cases.find((c) => c.severity >= 9)?.summary || "No critical cases found."}`;
  }

  if (q.includes("critical") || q.includes("severe") || q.includes("worst")) {
    const criticalCases = cases.filter((c) => c.severity >= 9);
    if (criticalCases.length === 0) return "No critical cases at the moment.";
    return `**${criticalCases.length} Critical Case(s):**\n${criticalCases.map((c) => `- **${c.alertType.replace(/_/g, " ")}** (${c.severity}/10): ${c.summary}`).join("\n")}`;
  }

  if (q.includes("phishing") || q.includes("email")) {
    const emailCases = cases.filter((c) => c.source === "gmail");
    return `**${emailCases.length} Email Cases:**\n${emailCases.map((c) => `- **${c.verdict}** (${c.severity}/10): ${c.summary.substring(0, 100)}...`).join("\n")}`;
  }

  if (q.includes("ip") || q.includes("attacker")) {
    const ips = cases.flatMap((c) => c.iocs.filter((i) => i.type === "ip").map((i) => i.value));
    const unique = [...new Set(ips)];
    return `**${unique.length} Unique Attacker IPs Detected:**\n${unique.map((ip) => `- ${ip}`).join("\n")}`;
  }

  if (q.includes("recommend") || q.includes("action") || q.includes("what should")) {
    const openCritical = cases.filter((c) => c.status === "open" && c.severity >= 7);
    if (openCritical.length === 0) return "No high-priority open cases. The dashboard looks clean.";
    return `**${openCritical.length} High-Priority Open Cases Need Attention:**\n${openCritical.map((c) => `- **${c.alertType.replace(/_/g, " ")}** (${c.severity}/10) — ${c.summary.substring(0, 80)}...`).join("\n")}\n\nRecommendation: Review and resolve these cases first.`;
  }

  return `I have access to ${stats.total} cases on the dashboard. You can ask me about:\n- **"Give me a status overview"**\n- **"Show critical cases"**\n- **"Any phishing emails?"**\n- **"List attacker IPs"**\n- **"What should I prioritize?"**`;
}
