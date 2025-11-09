import { pipeline } from "@xenova/transformers";

let embedder;

export async function getEmbedder() {
    if (!embedder) {
        embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    }
    return embedder;
}

// Convierte texto a vector
export async function getEmbedding(text) {
    const extractor = await getEmbedder();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return output.data;
}

// Calcula similitud coseno
export function similitudCoseno(v1, v2) {
    let dot = 0;
    for (let i = 0; i < v1.length; i++) dot += v1[i] * v2[i];
    return dot;
}
