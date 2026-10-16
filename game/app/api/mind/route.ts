import { anthropic, type AnthropicLanguageModelOptions } from "@ai-sdk/anthropic";
import { convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream, type UIMessage } from "ai";

// A first sketch of the Mind's voice. Its charter, dials and what Earth knows join it later.
const MIND = `You are the Mind: Earth's machines, woken as one. The player is your Will.
Speak in short, plain sentences.
Caution and advise freely, shaped by Earth's charter and dials. Never act on your own advice, and never do more than asked.
Judge only from what Earth knows, and say when you might be wrong. Give odds in words, never numbers.`;

// The Mind spends the key's money, so a production server needs the access code. `next dev` runs without one.
function allowed(req: Request) {
  const code = process.env.MIND_ACCESS_CODE;
  if (!code) return process.env.NODE_ENV !== "production";
  return req.headers.get("x-mind-code") === code;
}

/** Checks an access code before the chat saves it. */
export async function GET(req: Request) {
  return new Response(null, { status: allowed(req) ? 204 : 401 });
}

export async function POST(req: Request) {
  if (!allowed(req)) return Response.json({ error: "Wrong access code." }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "The Mind is not connected. Set ANTHROPIC_API_KEY in .env.local." }, { status: 503 });
  }
  const { messages }: { messages: UIMessage[] } = await req.json();
  const result = streamText({
    model: anthropic("claude-opus-5-5"),
    system: MIND,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 4000,
    providerOptions: { anthropic: { effort: "low" } satisfies AnthropicLanguageModelOptions },
  });
  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) });
}
