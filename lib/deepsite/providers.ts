/** Provider/model presets for DeepSite v2 UI (backend resolves keys). */

export const PROVIDERS = {
  "openai-compatible": {
    name: "OpenAI Compatible",
    max_tokens: 128_000,
    id: "openai-compatible",
  },
};

export const MODELS = [
  {
    value: "default",
    label: "Backend default",
    providers: ["openai-compatible"],
    autoProvider: "openai-compatible",
    isThinker: false,
  },
];
