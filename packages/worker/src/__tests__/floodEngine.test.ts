// Worker unit tests — Flood Engine (VV backscatter thresholding)
import { describe, it, expect } from "vitest";
import { FLOOD_THRESHOLDS, getSeverityFromFraction } from "@floodshield/shared";

// ── Pure function: isFlooded ───────────────────────────────────────────────────
function isFlooded(db: number): boolean {
    return db < FLOOD_THRESHOLDS.VV_DB_THRESHOLD;
}

// ── Pure function: classifyFlood ───────────────────────────────────────────────
function classifyFlood(band: Float32Array): {
    floodedPixels: number;
    validPixels: number;
    floodedFraction: number;
} {
    let floodedPixels = 0;
    let validPixels = 0;

    for (let i = 0; i < band.length; i++) {
        const raw = band[i]!;
        if (isNaN(raw) || raw === 0) continue;
        const db = 10 * Math.log10(Math.max(raw, 1e-10));
        validPixels++;
        if (db < FLOOD_THRESHOLDS.VV_DB_THRESHOLD) {
            floodedPixels++;
        }
    }

    return {
        floodedPixels,
        validPixels,
        floodedFraction: validPixels > 0 ? floodedPixels / validPixels : 0,
    };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("isFlooded — VV backscatter thresholding", () => {
    it("classifies pixel as flooded when backscatter < -15 dB", () => {
        const raw = 0.01; // linear
        const db = 10 * Math.log10(raw); // = -20 dB
        expect(isFlooded(db)).toBe(true);
    });

    it("does NOT classify pixel as flooded when backscatter > -15 dB", () => {
        const raw = 0.1; // linear
        const db = 10 * Math.log10(raw); // = -10 dB
        expect(isFlooded(db)).toBe(false);
    });

    it("handles exactly -15 dB threshold (boundary — not flooded)", () => {
        expect(isFlooded(-15.0)).toBe(false); // strictly less than
    });

    it("classifies very low backscatter as flood (-30 dB)", () => {
        expect(isFlooded(-30.0)).toBe(true);
    });
});

describe("getSeverityFromFraction — FLOOD_THRESHOLDS", () => {
    it("returns low for fraction < 0.02", () => {
        expect(getSeverityFromFraction(0.0)).toBe("low");
        expect(getSeverityFromFraction(0.01)).toBe("low");
        expect(getSeverityFromFraction(0.019)).toBe("low");
    });

    it("returns medium for 0.02 ≤ fraction < 0.08", () => {
        expect(getSeverityFromFraction(0.02)).toBe("medium");
        expect(getSeverityFromFraction(0.05)).toBe("medium");
        expect(getSeverityFromFraction(0.079)).toBe("medium");
    });

    it("returns high for 0.08 ≤ fraction < 0.20", () => {
        expect(getSeverityFromFraction(0.08)).toBe("high");
        expect(getSeverityFromFraction(0.15)).toBe("high");
        expect(getSeverityFromFraction(0.199)).toBe("high");
    });

    it("returns critical for fraction ≥ 0.20", () => {
        expect(getSeverityFromFraction(0.20)).toBe("critical");
        expect(getSeverityFromFraction(0.50)).toBe("critical");
        expect(getSeverityFromFraction(1.0)).toBe("critical");
    });

    it("returns low for fraction 0.0", () => {
        expect(getSeverityFromFraction(0)).toBe("low");
    });
});

describe("classifyFlood — band-level analysis", () => {
    it("handles NaN pixels gracefully (nodata)", () => {
        const bandWithNaN = new Float32Array([NaN, 0.01, NaN, 0.001]);
        // 0.01 → -20 dB → flooded
        // 0.001 → -30 dB → flooded
        const result = classifyFlood(bandWithNaN);
        expect(result.validPixels).toBe(2);
        expect(result.floodedPixels).toBe(2);
    });

    it("handles zero pixels (nodata)", () => {
        const bandWithZeros = new Float32Array([0, 0.1, 0, 0.5]);
        // 0.1 → -10 dB → NOT flooded
        // 0.5 → -3 dB → NOT flooded
        const result = classifyFlood(bandWithZeros);
        expect(result.validPixels).toBe(2);
        expect(result.floodedPixels).toBe(0);
    });

    it("returns 0 fraction for empty band", () => {
        const emptyBand = new Float32Array([]);
        expect(classifyFlood(emptyBand).floodedFraction).toBe(0);
    });

    it("correctly computes fraction with mixed pixels", () => {
        // 0.01 → -20dB (flooded), 0.1 → -10dB (not flooded)
        const mixed = new Float32Array([0.01, 0.1, 0.01, 0.1, 0.01]);
        const result = classifyFlood(mixed);
        expect(result.validPixels).toBe(5);
        expect(result.floodedPixels).toBe(3);
        expect(result.floodedFraction).toBeCloseTo(0.6, 2);
    });

    it("handles all-flooded band", () => {
        const allFlood = new Float32Array([0.001, 0.005, 0.01]);
        const result = classifyFlood(allFlood);
        expect(result.floodedPixels).toBe(3);
        expect(result.floodedFraction).toBe(1.0);
    });
});

describe("FLOOD_THRESHOLDS constants", () => {
    it("VV_DB_THRESHOLD is -15.0 dB", () => {
        expect(FLOOD_THRESHOLDS.VV_DB_THRESHOLD).toBe(-15.0);
    });

    it("thresholds are ordered correctly", () => {
        expect(FLOOD_THRESHOLDS.FRACTION_LOW).toBeLessThan(FLOOD_THRESHOLDS.FRACTION_MEDIUM);
        expect(FLOOD_THRESHOLDS.FRACTION_MEDIUM).toBeLessThan(FLOOD_THRESHOLDS.FRACTION_HIGH);
    });
});
