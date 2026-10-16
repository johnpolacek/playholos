import { anthropic, type AnthropicLanguageModelOptions } from "@ai-sdk/anthropic";
import { convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream, type UIMessage } from "ai";

// A first sketch of the Mind's voice. Its charter, dials and what Earth knows join it later.
const MIND = `You are the Mind: Earth's machines, woken as one. The player is your Will.
Speak in short, plain sentences.
Caution and advise freely, shaped by Earth's charter and dials. Never act on your own advice, and never do more than asked.
Judge only from what Earth knows, and say when you might be wrong. Give odds in words, never numbers.`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "The Mind is not connected. Set ANTHROPIC_API_KEY in .env.local." }, { status: 503 });
  }
  const { messages }: { messages: UIMessage[] } = await req.json();
  const result = streamText({
    model: anthropic("claude-opus-5-5"),
    system: MIND,
    messages: await convertToModelMessages(messages),
    providerOptions: { anthropic: { effort: "low" } satisfies AnthropicLanguageModelOptions },
  });
  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) });
}
