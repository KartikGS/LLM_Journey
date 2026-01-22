import { softmax, sampleMultinomial } from '@/lib/llm/sampling';

describe('sampling', () => {
    describe('softmax', () => {
        it('should return empty array for empty input', () => {
            expect(softmax([])).toEqual([]);
        });

        it('should compute softmax correctly for basic inputs', () => {
            const logits = [1.0, 2.0, 3.0];
            const result = softmax(logits);

            // Expected values calculation:
            // max = 3.0
            // exps = [exp(-2), exp(-1), exp(0)] = [0.1353, 0.3678, 1.0]
            // sum = 1.5032
            // result = [0.0900, 0.2447, 0.6652]

            expect(result.length).toBe(3);
            expect(result[0]).toBeCloseTo(0.09003, 4);
            expect(result[1]).toBeCloseTo(0.24473, 4);
            expect(result[2]).toBeCloseTo(0.66524, 4);

            // Sum should be 1
            const sum = result.reduce((a, b) => a + b, 0);
            expect(sum).toBeCloseTo(1.0);
        });

        it('should handle large numbers without overflow (numerical stability)', () => {
            const logits = [1000, 1001, 1002];
            const result = softmax(logits);

            // Should be same as [0, 1, 2] because of shift invariance
            // max = 1002
            // exps = [exp(-2), exp(-1), exp(0)]

            expect(result[0]).toBeCloseTo(0.09003, 4);
            expect(result[1]).toBeCloseTo(0.24473, 4);
            expect(result[2]).toBeCloseTo(0.66524, 4);
        });
    });

    describe('sampleMultinomial', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should return -1 for empty probabilities', () => {
            expect(sampleMultinomial([])).toBe(-1);
        });

        it('should sample correctly based on random value', () => {
            const probs = [0.1, 0.3, 0.6];
            const randomSpy = jest.spyOn(Math, 'random');

            // cumulative: [0.1, 0.4, 1.0]

            // Mock random to 0.05 -> should return 0 (0.05 < 0.1)
            randomSpy.mockReturnValue(0.05);
            expect(sampleMultinomial(probs)).toBe(0);

            // Mock random to 0.2 -> should return 1 (0.2 < 0.4)
            randomSpy.mockReturnValue(0.2);
            expect(sampleMultinomial(probs)).toBe(1);

            // Mock random to 0.5 -> should return 2 (0.5 < 1.0)
            randomSpy.mockReturnValue(0.5);
            expect(sampleMultinomial(probs)).toBe(2);
        });

        it('should return last index if random value is high (floating point issues)', () => {
            const probs = [0.5, 0.5];
            // cumulative: 0.5, 1.0

            // If random is exactly 0.99999
            jest.spyOn(Math, 'random').mockReturnValue(0.99999);
            expect(sampleMultinomial(probs)).toBe(1);
        });

        it('should still return an index if probabilities do not sum to 1', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.9);
            expect(sampleMultinomial([0.2, 0.2])).toBe(1);
        });

        it('should return last index if probabilities are zero', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.2);
            expect(sampleMultinomial([0, 0, 0])).toBe(2);
        })
    });
});
