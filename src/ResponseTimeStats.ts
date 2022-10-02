import * as ss from "simple-statistics";

export interface ResponseTimeStats {
  size: number;
  mean: number;
  median: number;
  stdev: number;
  min: number;
  max: number;
  percentiles: Record<number, number>;
}

export function calculateResponseTimeStats(
  data: number[] = []
): ResponseTimeStats {
  const stats: ResponseTimeStats = {
    size: data.length,
    mean: callOrDefaultZero(ss.mean, data),
    median: callOrDefaultZero(ss.median, data),
    stdev: callOrDefaultZero(ss.sampleStandardDeviation, data),
    min: callOrDefaultZero(ss.min, data),
    max: callOrDefaultZero(ss.max, data),
    percentiles: {},
  };
  const percentiles = [0.75, 0.9, 0.95, 0.99];

  for (let p of percentiles) {
    stats.percentiles[p] = callOrDefaultZero(ss.quantile, data, p);
  }

  return stats;
}

function callOrDefaultZero(f: Function, data: number[], ...args: any[]) {
  return data.length > 1 ? f(data, ...args) : 0;
}
