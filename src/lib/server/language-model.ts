import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function languageModel(signal: AbortSignal) {
  const { AZYMUT_MODEL_URL, AZYMUT_MODEL_NAME } = process.env;
  if (!AZYMUT_MODEL_URL || !AZYMUT_MODEL_NAME) return null;

  const provider = createOpenAICompatible({
    name: "azymut-internal",
    baseURL: AZYMUT_MODEL_URL,
    apiKey: process.env.AZYMUT_MODEL_TOKEN || undefined,
    supportsStructuredOutputs: true,
  });
  const timeout = Number(process.env.AZYMUT_MODEL_TIMEOUT_MS);
  return {
    model: provider.chatModel(AZYMUT_MODEL_NAME),
    providerOptions:
      AZYMUT_MODEL_NAME === "gemma4:12b" ||
      process.env.AZYMUT_DISABLE_REASONING === "1"
        ? { azymutInternal: { reasoningEffort: "none" } }
        : undefined,
    abortSignal: AbortSignal.any([
      signal,
      AbortSignal.timeout(
        Number.isInteger(timeout) && timeout >= 1000 && timeout <= 120000
          ? timeout
          : 25000,
      ),
    ]),
    maxRetries: 0,
  };
}
