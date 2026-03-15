// MSW handlers — mock API and Earth Search endpoints
import { http, HttpResponse } from "msw";
const MOCK_ZONES = [
    {
        id: "zone_an_giang_01",
        province: "An Giang",
        district: "Châu Đốc",
        severity: "critical",
        floodIndex: 0.28,
        floodedAreaKm2: 11480,
        detectedAt: "2024-08-15T06:00:00Z",
        sentinelItemId: "S1A_IW_GRDH_1SDV_20240815",
        geometry: {
            type: "Polygon",
            coordinates: [[[104.9, 10.2], [105.4, 10.2], [105.4, 10.8], [104.9, 10.8], [104.9, 10.2]]],
        },
        confidence: 88,
    },
];
const MOCK_STATS = {
    totalZones: 7,
    criticalZones: 2,
    highZones: 2,
    mediumZones: 2,
    lowZones: 1,
    totalAffectedKm2: 42640,
    totalPayoutsTriggered: 3,
    totalPayoutsConfirmed: 2,
    lastUpdated: "2024-08-17T10:00:00Z",
};
export const handlers = [
    // Flood zones
    http.get("http://localhost:8787/api/flood/zones", () => HttpResponse.json({ data: MOCK_ZONES, error: null, timestamp: new Date().toISOString() })),
    // Flood stats
    http.get("http://localhost:8787/api/flood/stats", () => HttpResponse.json({ data: MOCK_STATS, error: null, timestamp: new Date().toISOString() })),
    // Alerts
    http.get("http://localhost:8787/api/alerts", () => HttpResponse.json({ data: [], error: null, timestamp: new Date().toISOString() })),
    // Payouts
    http.get("http://localhost:8787/api/payouts", () => HttpResponse.json({ data: [], error: null, timestamp: new Date().toISOString() })),
    // Earth Search STAC
    http.post("https://earth-search.aws.element84.com/v1/search", () => HttpResponse.json({
        type: "FeatureCollection",
        features: [],
        numberMatched: 0,
    })),
];
//# sourceMappingURL=handlers.js.map