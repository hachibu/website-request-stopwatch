import { Data, Dash, Layout, Shape } from "plotly.js";
import { ResponseTimeStats } from "./ResponseTimeStats";

interface PlotConfig {
  data: Data[];
  layout: Partial<Layout>;
}

interface PlotParams {
  responseTimes: number[];
  responseTimeStats: ResponseTimeStats;
  url: string;
}

export function createPlotConfig(params: PlotParams): PlotConfig {
  return {
    data: createData(params),
    layout: createLayout(params),
  };
}

function createData({ responseTimes }: PlotParams): Data[] {
  const data: Data = {
    x: responseTimes,
    type: "histogram",
    marker: {
      color: "#0d6efd",
      opacity: 0.8,
    },
  };
  return [data];
}

function createLayout({ responseTimeStats, url }: PlotParams): Partial<Layout> {
  const layout: Partial<Layout> = {
    title: `Response Time Distribution<br>(${url})`,
    xaxis: {
      title: "Response Time (ms)",
    },
    xaxis2: {
      title: "Std Dev",
      side: "top",
    },
    yaxis: {
      title: "# of Requests",
    },
    shapes: [],
  };

  // if (layout.shapes && responseTimeStats.size > 0) {
  //   const { mean, median } = responseTimeStats;
  //   layout.shapes.push(
  //     createShapeLine({ x: median, color: "#d63384" }),
  //     createShapeLine({ x: mean, color: "#198754" })
  //   );
  //   for (let x of getStdDevData(responseTimeStats)) {
  //     layout.shapes.push(createShapeLine({ x, color: "#6c757d", dash: "dot" }))
  //   }
  // }

  return layout;
}

function createShapeLine({
  x,
  color,
  dash = "solid",
}: {
  x: number;
  color?: string;
  dash?: Dash;
}): Partial<Shape> {
  return {
    type: "line",
    x0: x,
    x1: x,
    y0: 0,
    y1: 1,
    yref: "paper",
    opacity: 0.9,
    line: {
      color,
      width: 1,
      dash,
    },
  };
}

function getStdDevData(responseTimeStats: ResponseTimeStats): number[] {
  const data: number[] = [];
  const { mean, min, max, stdev } = responseTimeStats;
  const n = 50;
  for (let i = -n; i < n; i++) {
    if (i === 0) continue;
    const x = mean + stdev * i;
    if (x > min - stdev && x < max + stdev) {
      data.push(x);
    }
  }
  return data;
}
