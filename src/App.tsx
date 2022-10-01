import React, { useState, MouseEvent, ChangeEvent, useMemo } from "react";
import { Data, Layout } from "plotly.js";
import Plot from "react-plotly.js";
import {
  ResponseTimeStats,
  calculateResponseTimeStats,
} from "./ResponseTimeStats";

const PRECISION = 2;

function App() {
  const urlSearchParams = new URLSearchParams(window?.location?.search);
  const urlParam = urlSearchParams.get("url");
  const [url, setUrl] = useState<string>(urlParam ?? "wikipedia.org");
  const [sampleSize, setSampleSize] = useState<number>(100);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [responseTimeStats, setResponseTimeStats] = useState<ResponseTimeStats>(
    calculateResponseTimeStats()
  );
  const [progress, setProgress] = useState<number>(0);
  const [disabled, setDisabled] = useState<boolean>(false);

  const resetState = () => {
    setResponseTimes(() => []);
    setProgress(() => 0);
    setResponseTimeStats(() => calculateResponseTimeStats());
  };

  const urlOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    let newUrl = event.target.value;
    let prefix = "https://";

    if (newUrl.startsWith(prefix)) {
      newUrl = newUrl.replace(prefix, "");
    }

    setUrl(() => newUrl);
  };

  const sampleSizeOnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSampleSize(() => +event.target.value);
  };

  const setLocation = () => {
    const { origin, pathname } = window.location;
    const newUrl = `${origin}${pathname}?url=${encodeURI(url)}`;

    window.history.replaceState({}, "", newUrl);
  };

  const startButtonOnClick = async (event: MouseEvent<HTMLButtonElement>) => {
    const data: number[] = [];
    const requestUrl = `https://${url}`;
    const requestInit: RequestInit = {
      mode: "no-cors",
      cache: "no-store",
    };

    if (url === "") {
      return alert("Form validation error: URL must not be empty");
    } else if (sampleSize > 1000) {
      return alert(
        "Form validation error: Sample size must not be greater than 1,000"
      );
    }

    resetState();
    setLocation();
    setDisabled(() => true);

    for (let i = 0; i < sampleSize; i++) {
      const start = performance.now();
      try {
        await fetch(requestUrl, requestInit);
      } catch (e) {
        setDisabled(() => false);
        return alert(`Fetch error: Failed to fetch ${requestUrl}: ${e}`);
      }
      const stop = performance.now();
      const delta = stop - start;

      data.push(delta);
      setResponseTimes((prevState) => [...prevState, delta]);
      setProgress(() => (data.length / sampleSize) * 100);
      setResponseTimeStats(() => calculateResponseTimeStats(data));
    }

    setDisabled(() => false);
  };

  const plot: { data: Data[]; layout: Partial<Layout> } = useMemo(() => {
    return {
      data: [
        {
          x: responseTimes,
          type: "histogram",
        },
      ],
      layout: {
        title: `Response Time Distribution<br>(${url})`,
        xaxis: {
          title: "Response Time (ms)",
        },
        yaxis: {
          title: "# of Requests",
        },
      },
    };
  }, [responseTimes, url]);

  return (
    <div className="col-12 col-md-8">
      <h1 className="display-6 text-center mb-3">
        Website Request Stopwatch ⏱️️
      </h1>
      <div className="p-3 mb-3 border bg-white">
        <div className="row mb-3">
          <div className="col-sm-4 input-group">
            <span className="input-group-text">https://</span>
            <input
              className="form-control"
              type="text"
              value={url}
              onChange={urlOnChange}
              placeholder="Type a URL..."
            ></input>
          </div>
        </div>
        <div className="input-group mb-3">
          <label className="input-group-text">Sample Size</label>
          <select
            className="form-select"
            onChange={sampleSizeOnChange}
            value={sampleSize}
          >
            <option value="10">10 Requests</option>
            <option value="100">100 Requests</option>
            <option value="1000">1000 Requests</option>
          </select>
        </div>
        <button
          className="form-control btn btn-success"
          onClick={startButtonOnClick}
          disabled={disabled}
        >
          {disabled ? `${progress.toFixed(PRECISION)}% complete` : "Start"}
        </button>
      </div>

      <div className="border mb-3 bg-white overflow-hidden">
        <Plot
          className="w-100"
          data={plot.data}
          layout={plot.layout}
          useResizeHandler={true}
        ></Plot>
      </div>

      <table className="table table-bordered bg-white">
        <thead>
          <tr>
            <th>Requests Completed</th>
            <th>Mean</th>
            <th>Median</th>
            <th>Std Dev</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{responseTimeStats?.size}</td>
            <td>{responseTimeStats?.mean.toFixed(PRECISION)}</td>
            <td>{responseTimeStats?.median.toFixed(PRECISION)}</td>
            <td>{responseTimeStats?.stdev.toFixed(PRECISION)}</td>
          </tr>
        </tbody>
      </table>

      <table className="table table-bordered bg-white">
        <tbody>
          <tr>
            <td className="fw-bold">Min</td>
            <td>{responseTimeStats?.min.toFixed(PRECISION)}</td>
          </tr>
          {Object.entries(responseTimeStats?.percentiles).map(([k, v], i) => (
            <tr key={i}>
              <td className="fw-bold">P{+k * 100}</td>
              <td>{v.toFixed(PRECISION)}</td>
            </tr>
          ))}
          <tr>
            <td className="fw-bold">Max</td>
            <td>{responseTimeStats?.max.toFixed(PRECISION)}</td>
          </tr>
        </tbody>
      </table>

      <table className="table table-bordered bg-white">
        <thead>
          <tr>
            <th>Response Time</th>
          </tr>
        </thead>
        <tbody>
          {responseTimes.map((responseTime, i) => (
            <tr key={i}>
              <td>{responseTime.toFixed(PRECISION)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
