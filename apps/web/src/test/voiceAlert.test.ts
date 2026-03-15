// Voice Alert service tests — floodshield-main only
import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildAlertText, speakVietnamese } from "../services/voiceAlert";

// Mock Web Speech API
const mockSpeak = vi.fn();
const mockCancel = vi.fn();
const mockGetVoices = vi.fn(() => [
  { name: "Google Tiếng Việt", lang: "vi-VN", localService: true, default: false, voiceURI: "vi" },
]);

Object.defineProperty(window, "speechSynthesis", {
  value: {
    speak: mockSpeak,
    cancel: mockCancel,
    getVoices: mockGetVoices,
    speaking: false,
    pending: false,
    paused: false,
  },
  writable: true,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("buildAlertText", () => {
  it("builds critical alert with evacuation instructions", () => {
    const text = buildAlertText("An Giang", "Châu Đốc", "critical");
    expect(text).toContain("Khẩn cấp");
    expect(text).toContain("An Giang");
    expect(text).toContain("Châu Đốc");
    expect(text).toContain("Di tản ngay");
    expect(text).toMatch(/1[\s-]1[\s-]3/);
  });

  it("builds high alert with evacuation warning", () => {
    const text = buildAlertText("Kiên Giang", "Rạch Giá", "high");
    expect(text).toContain("Cảnh báo khẩn");
    expect(text).toContain("Kiên Giang");
    expect(text).toContain("di tản");
  });

  it("builds medium alert with property-moving guidance", () => {
    const text = buildAlertText("Đồng Tháp", "Cao Lãnh", "medium");
    expect(text).toContain("Cảnh báo lũ");
    expect(text).toContain("Đồng Tháp");
    expect(text).toContain("tài sản");
  });

  it("builds low alert as informational", () => {
    const text = buildAlertText("Cần Thơ", "Ninh Kiều", "low");
    expect(text).toContain("Thông báo");
    expect(text).toContain("Cần Thơ");
    expect(text).not.toContain("Di tản");
  });

  it("includes only province when district is empty", () => {
    const text = buildAlertText("Cà Mau", "", "medium");
    expect(text).toContain("Cà Mau");
    expect(text).not.toContain(", Cà Mau");
  });
});

describe("speakVietnamese", () => {
  it("calls speechSynthesis.speak with Vietnamese text", () => {
    speakVietnamese("Xin chào, đây là thử nghiệm");
    expect(mockSpeak).toHaveBeenCalledOnce();
    const utterance = mockSpeak.mock.calls[0]?.[0] as SpeechSynthesisUtterance;
    expect(utterance.lang).toBe("vi-VN");
    expect(utterance.text).toBe("Xin chào, đây là thử nghiệm");
  });

  it("cancels previous speech before speaking", () => {
    speakVietnamese("Test 1");
    speakVietnamese("Test 2");
    expect(mockCancel).toHaveBeenCalledTimes(2);
    expect(mockSpeak).toHaveBeenCalledTimes(2);
  });

  it("does not throw when speechSynthesis unavailable", () => {
    const original = window.speechSynthesis;
    Object.defineProperty(window, "speechSynthesis", { value: undefined, writable: true });

    expect(() => speakVietnamese("Test")).not.toThrow();

    Object.defineProperty(window, "speechSynthesis", { value: original, writable: true });
  });
});
