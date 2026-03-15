// Shared utilities tests
import { describe, it, expect } from "vitest";
import { getSeverityFromFraction, severityToColor, severityToLabel, generateAlertMessage, formatKm2, truncateAddress, cn, FLOOD_THRESHOLDS, } from "@floodshield/shared";
describe("getSeverityFromFraction", () => {
    it("returns low for fraction < 0.02", () => {
        expect(getSeverityFromFraction(0.01)).toBe("low");
        expect(getSeverityFromFraction(0.0)).toBe("low");
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
});
describe("severityToColor", () => {
    it("returns correct hex colors", () => {
        expect(severityToColor("low")).toBe("#FFF176");
        expect(severityToColor("medium")).toBe("#FFB300");
        expect(severityToColor("high")).toBe("#F44336");
        expect(severityToColor("critical")).toBe("#B71C1C");
    });
});
describe("severityToLabel", () => {
    it("returns Vietnamese labels", () => {
        expect(severityToLabel("low")).toBe("Thấp");
        expect(severityToLabel("medium")).toBe("Trung bình");
        expect(severityToLabel("high")).toBe("Cao");
        expect(severityToLabel("critical")).toBe("Nghiêm trọng");
    });
});
describe("generateAlertMessage", () => {
    it("generates critical message with evacuation instructions", () => {
        const msg = generateAlertMessage("Châu Đốc", "An Giang", "critical");
        expect(msg).toContain("Châu Đốc");
        expect(msg).toContain("An Giang");
        expect(msg).toContain("DI TẢN");
        expect(msg).toContain("113");
    });
    it("generates medium warning message", () => {
        const msg = generateAlertMessage("Cao Lãnh", "Đồng Tháp", "medium");
        expect(msg).toContain("Cảnh báo");
        expect(msg).toContain("Cao Lãnh");
    });
});
describe("formatKm2", () => {
    it("formats small areas with units", () => {
        expect(formatKm2(100)).toBe("100.0 km²");
        expect(formatKm2(999)).toBe("999.0 km²");
    });
    it("abbreviates large areas with k", () => {
        expect(formatKm2(1000)).toBe("1.0k km²");
        expect(formatKm2(41000)).toBe("41.0k km²");
    });
});
describe("truncateAddress", () => {
    it("truncates long addresses", () => {
        const addr = "7V9iD2bS3X4kfW8mN1qP6rT0uA5cE7gHjKLmNoPqR";
        const result = truncateAddress(addr, 4);
        expect(result).toMatch(/^7V9i\.\.\.oPqR$/);
    });
    it("does not truncate short addresses", () => {
        expect(truncateAddress("short", 10)).toBe("short");
    });
});
describe("cn (classname utility)", () => {
    it("joins non-falsy classes", () => {
        expect(cn("a", "b", "c")).toBe("a b c");
        expect(cn("a", false, "c")).toBe("a c");
        expect(cn("a", undefined, null, "d")).toBe("a d");
    });
});
describe("FLOOD_THRESHOLDS", () => {
    it("VV_DB_THRESHOLD is -15.0 dB", () => {
        expect(FLOOD_THRESHOLDS.VV_DB_THRESHOLD).toBe(-15.0);
    });
    it("thresholds are ordered correctly", () => {
        expect(FLOOD_THRESHOLDS.FRACTION_LOW).toBeLessThan(FLOOD_THRESHOLDS.FRACTION_MEDIUM);
        expect(FLOOD_THRESHOLDS.FRACTION_MEDIUM).toBeLessThan(FLOOD_THRESHOLDS.FRACTION_HIGH);
    });
});
//# sourceMappingURL=utils.test.js.map