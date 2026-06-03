export const EXTINGUISHER_SIZES = ["2.5 lbs.", "5 lbs.", "9 lbs.", "12 lbs."] as const;

export type ExtinguisherSize = (typeof EXTINGUISHER_SIZES)[number];
