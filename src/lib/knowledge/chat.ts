import type { Source } from "./search";

export type Scope = "first" | "periodic";
export type Mode = "formal" | "conversation";
export type Evidence = { label: string; text: string };
export type Citation = {
  id: string;
  title: string;
  locator: string;
  kind: Source["kind"];
  text: string;
  url: string;
};

export type Reply =
  | {
      status: "answered";
      answer: string;
      method: "rule" | "model";
      sources: Citation[];
    }
  | {
      status:
        | "decision"
        | "insufficient"
        | "model-unavailable"
        | "knowledge-unavailable"
        | "unverified"
        | "invalid";
      sources?: Citation[];
    };

export type Progress = "searching" | "writing" | "checking";
export type ChatEvent =
  | { type: "progress"; phase: Progress }
  | { type: "sources"; sources: Citation[]; method: "rule" | "model" }
  | { type: "text"; text: string; replace?: boolean }
  | {
      type: "done";
      reply: Exclude<Reply, { status: "answered" }> | { status: "answered" };
    };

export const chatStreamType = "application/x-ndjson";
