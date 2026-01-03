// types/llm.ts
export interface ModelMeta {
    stoi: Record<string, number>;
    itos: Record<string, string>;
    block_size: number;
}