import type { STACItem } from "@floodshield/shared";
export declare function searchSentinel1(options?: {
    bbox?: [number, number, number, number];
    days?: number;
    limit?: number;
}): Promise<STACItem[]>;
export declare function getSTACItemById(id: string): Promise<STACItem>;
//# sourceMappingURL=earthSearch.d.ts.map