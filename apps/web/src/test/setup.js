// Test setup — Vitest + Testing Library
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, afterAll, beforeAll, vi } from "vitest";
import { server } from "./mocks/server";
// Start MSW mock server
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
    cleanup();
    server.resetHandlers();
});
afterAll(() => server.close());
// Mock Mapbox GL JS (canvas not available in JSDOM)
vi.mock("mapbox-gl", () => ({
    default: {
        accessToken: "",
        Map: vi.fn(() => ({
            on: vi.fn(),
            off: vi.fn(),
            remove: vi.fn(),
            addControl: vi.fn(),
            isStyleLoaded: vi.fn(() => true),
            addSource: vi.fn(),
            addLayer: vi.fn(),
            getSource: vi.fn(),
            getLayer: vi.fn(),
            removeSource: vi.fn(),
            removeLayer: vi.fn(),
            getCanvas: vi.fn(() => ({ style: {} })),
            flyTo: vi.fn(),
            setStyle: vi.fn(),
        })),
        NavigationControl: vi.fn(),
        ScaleControl: vi.fn(),
        FullscreenControl: vi.fn(),
        Popup: vi.fn(() => ({
            setLngLat: vi.fn().mockReturnThis(),
            setHTML: vi.fn().mockReturnThis(),
            addTo: vi.fn().mockReturnThis(),
        })),
    },
}));
// Mock Phantom wallet
Object.defineProperty(window, "solana", {
    value: {
        isPhantom: true,
        connect: vi.fn().mockResolvedValue({ publicKey: { toString: () => "TestWallet111111" } }),
        disconnect: vi.fn(),
    },
    writable: true,
});
// Mock SpeechSynthesisUtterance (not available in jsdom)
if (typeof window.SpeechSynthesisUtterance === "undefined") {
    window.SpeechSynthesisUtterance = class {
        text = "";
        lang = "";
        rate = 1;
        pitch = 1;
        volume = 1;
        voice = null;
        onend = null;
        onerror = null;
        constructor(text) { this.text = text; }
    };
}
//# sourceMappingURL=setup.js.map