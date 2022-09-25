import * as ss from "simple-statistics";

export interface Stats {
  size: number;
  mean: number;
  median: number;
  stdev: number;
  min: number;
  max: number;
  percentiles: Record<number, number>;
}

export function newStats(): Stats {
  return {
    size: 0,
    mean: 0,
    median: 0,
    stdev: 0,
    min: 0,
    max: 0,
    percentiles: {
      0.75: 0,
      0.9: 0,
      0.95: 0,
      0.99: 0,
    },
  };
}

export function calculateStats(data: number[]): Stats {
  return {
    size: data.length,
    mean: ss.mean(data),
    median: ss.median(data),
    stdev: ss.standardDeviation(data),
    min: ss.min(data),
    max: ss.max(data),
    percentiles: {
      0.75: ss.quantile(data, 0.75),
      0.9: ss.quantile(data, 0.9),
      0.95: ss.quantile(data, 0.95),
      0.99: ss.quantile(data, 0.99),
    },
  };
}