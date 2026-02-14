import { describe, it, expect } from 'vitest';
import { processCSV } from './csvParser';

describe('processCSV', () => {
    it('should parse valid CSV correctly', () => {
        const csv = `Nome,Email\nAna,ana@test.com\nBruno,bruno@test.com`;
        const result = processCSV(csv, 'test.csv');

        expect(result).not.toBeNull();
        expect(result.name).toBe('test');
        expect(result.columns).toEqual(['Nome', 'Email']);
        expect(result.data).toHaveLength(2);
        expect(result.data[0].Nome).toBe('Ana');
    });

    it('should handle empty CSV', () => {
        const result = processCSV('', 'empty.csv');
        expect(result).toBeNull();
    });

    it('should clean quotes from headers and values', () => {
        const csv = `"Nome","Email"\n"Ana","ana@test.com"`;
        const result = processCSV(csv, 'quoted.csv');

        expect(result.columns).toEqual(['Nome', 'Email']);
        expect(result.data[0].Nome).toBe('Ana');
    });
});
