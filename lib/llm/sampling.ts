// implementation of softmax with subtraction to avoid overflow
function softmax(logits: Float32Array | number[]): number[] {
  if (logits.length === 0) return [];

  // Finding max without spread operator to avoid stack overflow
  let max = logits[0];
  for (let i = 1; i < logits.length; i++) {
    if (logits[i] > max) max = logits[i];
  }

  const exps = Array.from(logits).map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);

  return exps.map(v => v / sum);
}

function sampleMultinomial(probs: number[]) {
  if (probs.length === 0) return -1;
  const r = Math.random();
  let cum = 0;
  for (let i = 0; i < probs.length; i++) {
    cum += probs[i];
    if (r < cum) return i;
  }
  return probs.length - 1;
}

export { softmax, sampleMultinomial };