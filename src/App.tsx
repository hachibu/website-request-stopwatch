import React, { useState, MouseEvent, ChangeEvent } from "react";
import { Data, Layout } from "plotly.js";
import Plot from "react-plotly.js";
import { Stats, newStats, calculateStats } from "./Stats";

const PRECISION = 2;

interface MyPlot {
  data: Data[];
  layout: Partial<Layout>;
}

function App() {
  const urlSearchParams = new URLSearchParams(window?.location?.search);
  const urlParam = urlSearchParams.get("url");
  const [url, setUrl] = useState<string>(urlParam ?? "wikipedia.org");
  const [sampleSize, setSampleSize] = useState<number>(100);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [stats, setStats] = useState<Stats>(newStats());
  const [progress, setProgress] = useState<number>(0);
  const [disabled, setDisabled] = useState<boolean>(false);

  function getPlot(): MyPlot {
    return {
      data: [
        {
          x: responseTimes,
          type: "histogram",
        },
      ],
      layout: {
        title: `Response Time Distribution (${url})`,
        xaxis: {
          title: "Response Time (ms)",
        },
        yaxis: {
          title: "# of Requests",
        },
      },
    };
  }

  function resetState() {
    setResponseTimes(() => []);
    setProgress(() => 0);
    setStats(() => newStats());
  }

  function urlOnChange(event: ChangeEvent<HTMLInputElement>) {
    let newUrl = event.target.value;
    let prefix = "https://";

    if (newUrl.startsWith(prefix)) {
      newUrl = newUrl.replace(prefix, "");
    }

    setUrl(() => newUrl);
  }

  function sampleSizeOnChange(event: ChangeEvent<HTMLSelectElement>) {
    setSampleSize(() => +event.target.value);
  }

  function updateUrlSearch() {
    const { origin, pathname } = window.location;
    const newUrl = `${origin}${pathname}?url=${encodeURI(url)}`;

    window.history.replaceState({}, "", newUrl);
  }

  async function onClick(event: MouseEvent<HTMLButtonElement>) {
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

    setDisabled(() => true);
    resetState();
    updateUrlSearch();

    for (let i = 0; i < sampleSize; i++) {
      const start = performance.now();
      try {
        await fetch(requestUrl, requestInit);
      } catch (e) {
        setDisabled(() => false);
        return alert(`Fetch error: Failed to fetch "${requestUrl}"`);
      }
      const stop = performance.now();
      const delta = stop - start;

      data.push(delta);
      setResponseTimes((prevState) => [...prevState, delta]);
      setProgress(() => (data.length / sampleSize) * 100);
      setStats(() => calculateStats(data));
    }

    setDisabled(() => false);
  }

  const plot = getPlot();

  return (
    <div className="col-12 col-md-8">
      <h1 className="display-6 text-center">Website Request Timer ⏱️️</h1>
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
            <option value="10">10</option>
            <option value="100">100</option>
            <option value="1000">1000</option>
          </select>
        </div>
        <button
          className="form-control btn btn-success"
          onClick={onClick}
          disabled={disabled}
        >
          {disabled ? `${progress.toFixed(PRECISION)}% complete` : "Start"}
        </button>
      </div>

      <div className="border mb-3 bg-white">
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
            <th>Sample Size</th>
            <th>Mean</th>
            <th>Median</th>
            <th>Std Dev</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{stats?.size}</td>
            <td>{stats?.mean.toFixed(PRECISION)}</td>
            <td>{stats?.median.toFixed(PRECISION)}</td>
            <td>{stats?.stdev.toFixed(PRECISION)}</td>
          </tr>
        </tbody>
      </table>

      <table className="table table-bordered bg-white">
        <tbody>
          <tr>
            <td className="fw-bold">Min</td>
            <td>{stats?.min.toFixed(PRECISION)}</td>
          </tr>
          {Object.entries(stats?.percentiles).map(([k, v], i) => (
            <tr key={i}>
              <td className="fw-bold">P{+k * 100}</td>
              <td>{v.toFixed(PRECISION)}</td>
            </tr>
          ))}
          <tr>
            <td className="fw-bold">Max</td>
            <td>{stats?.max.toFixed(PRECISION)}</td>
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
