// Worker unit tests — Payout trigger logic
import { describe, it, expect } from "vitest";
import { PAYOUT_THRESHOLDS } from "@floodshield/shared";
import type { FloodSeverity } from "@floodshield/shared";

// ── Pure functions extracted from payout business logic ────────────────────────

function shouldTriggerPayout(severity: FloodSeverity): boolean {
    return (PAYOUT_THRESHOLDS.SEVERITY_TRIGGER as readonly string[]).includes(severity);
}

function calculatePayoutAmount(landAreaHa: number, baseRatePerHa: number): number {
    return landAreaHa * baseRatePerHa;
}

function cappedPayout(amount: number, maxPayout: number): number {
    return Math.min(amount, maxPayout);
}

function payoutToLamports(amountSol: number): number {
    return Math.floor(amountSol * 1_000_000_000);
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("shouldTriggerPayout - severity-based triggering", () => {
    it("triggers payout for HIGH severity", () => {
        expect(shouldTriggerPayout("high")).toBe(true);
    });

    it("triggers payout for CRITICAL severity", () => {
        expect(shouldTriggerPayout("critical")).toBe(true);
    });

    it("does NOT trigger payout for MEDIUM severity", () => {
        expect(shouldTriggerPayout("medium")).toBe(false);
    });

    it("does NOT trigger payout for LOW severity", () => {
        expect(shouldTriggerPayout("low")).toBe(false);
    });
});

describe("calculatePayoutAmount - proportional to land area", () => {
    it("calculates payout amount proportional to land area", () => {
        const baseRate = 0.01; // 0.01 SOL per ha
        const landAreaHa = 3.5;
        const expected = 0.035;
        expect(calculatePayoutAmount(landAreaHa, baseRate)).toBeCloseTo(expected, 4);
    });

    it("returns 0 for 0 land area", () => {
        expect(calculatePayoutAmount(0, 0.01)).toBe(0);
    });

    it("handles large land areas", () => {
        const result = calculatePayoutAmount(100, 0.01);
        expect(result).toBeCloseTo(1.0, 4);
    });
});

describe("cappedPayout - max payout enforcement", () => {
    it("caps payout at maximum per farmer", () => {
        const MAX_PAYOUT = 0.5;
        expect(cappedPayout(1.5, MAX_PAYOUT)).toBe(MAX_PAYOUT);
    });

    it("does not cap payout below maximum", () => {
        expect(cappedPayout(0.2, 0.5)).toBe(0.2);
    });

    it("returns exact max when amount equals max", () => {
        expect(cappedPayout(0.5, 0.5)).toBe(0.5);
    });
});

describe("payoutToLamports - SOL to lamports conversion", () => {
    it("converts 1 SOL to 1_000_000_000 lamports", () => {
        expect(payoutToLamports(1)).toBe(1_000_000_000);
    });

    it("converts 0.1 SOL correctly", () => {
        expect(payoutToLamports(0.1)).toBe(100_000_000);
    });

    it("floors fractional lamports", () => {
        expect(payoutToLamports(0.0000000015)).toBe(1); // 1.5 lamports → 1
    });

    it("returns 0 for 0 SOL", () => {
        expect(payoutToLamports(0)).toBe(0);
    });
});

describe("PAYOUT_THRESHOLDS constants", () => {
    it("SEVERITY_TRIGGER includes high and critical", () => {
        expect(PAYOUT_THRESHOLDS.SEVERITY_TRIGGER).toContain("high");
        expect(PAYOUT_THRESHOLDS.SEVERITY_TRIGGER).toContain("critical");
    });

    it("SEVERITY_TRIGGER does NOT include low or medium", () => {
        expect(PAYOUT_THRESHOLDS.SEVERITY_TRIGGER).not.toContain("low");
        expect(PAYOUT_THRESHOLDS.SEVERITY_TRIGGER).not.toContain("medium");
    });

    it("RICE_VOUCHER_SOL is a positive number", () => {
        expect(PAYOUT_THRESHOLDS.RICE_VOUCHER_SOL).toBeGreaterThan(0);
    });

    it("FLOOD_INDEX_TRIGGER is 0.08", () => {
        expect(PAYOUT_THRESHOLDS.FLOOD_INDEX_TRIGGER).toBe(0.08);
    });
});
