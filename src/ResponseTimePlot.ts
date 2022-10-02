import { Data, Layout, Shape } from "plotly.js";
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
  return [
    {
      x: responseTimes,
      type: "histogram",
      marker: {
        color: "#0d6efd",
        opacity: 0.5,
      },
    },
  ];
}

function createLayout({ responseTimeStats, url }: PlotParams): Partial<Layout> {
  const layout: Partial<Layout> = {
    title: `Response Time Distribution<br>(${url})`,
    xaxis: {
      title: "Response Time (ms)",
    },
    yaxis: {
      title: "# of Requests",
    },
    shapes: [],
  };

  if (layout.shapes && responseTimeStats.size > 0) {
    layout.shapes.push(
      createShapeLine({ x: responseTimeStats.mean, color: "#198754" }),
      createShapeLine({ x: responseTimeStats.median, color: "#d63384" })
    );
  }

  return layout;
}

function createShapeLine({
  x,
  color,
}: {
  x: number;
  color: string;
}): Partial<Shape> {
  return {
    type: "line",
    x0: x,
    x1: x,
    y0: 0,
    y1: 1,
    yref: "paper",
    line: {
      color,
      width: 1,
    },
  };
}
