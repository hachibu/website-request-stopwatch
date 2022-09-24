import React, { useState, MouseEvent, ChangeEvent } from 'react';
import * as ss from 'simple-statistics'
import Plot from 'react-plotly.js';

const PRECISION = 2

interface Stats {
  runs: number;
  mean: number;
  min: number;
  max: number;
  quantiles: Record<number, number>;
}

function newStats(): Stats {
  return {
    runs: 0,
    mean: 0,
    min: 0,
    max: 0,
    quantiles: []
  }
}

function App() {
  const urlSearchParams = new URLSearchParams(window?.location?.search);
  const urlParam = urlSearchParams.get('url')
  const [url, setUrl] = useState<string>(urlParam ?? "")
  const [runs, setRuns] = useState<number>(100)
  const [responseTimes, setResponseTimes] = useState<number[]>([])
  const [stats, setStats] = useState<Stats>(newStats())
  const [progress, setProgress] = useState<number>(0)

  async function onClick(event: MouseEvent<HTMLButtonElement>) {
    if (!url.startsWith("https://")) {
      alert("URL must start with https://")
      return
    }

    const data: number[] = []

    setResponseTimes(() => [])
    setProgress(() => 0)
    setStats(() => newStats())

    window.history.replaceState(
      {},
      "",
      `${window.location.origin}${window.location.pathname}?url=${encodeURI(url)}`,
    );

    const requestInit: RequestInit = {
      mode: "no-cors",
      cache: "no-store",
    }

    for (let i = 0; i < runs; i++) {
      const startTimeMs = performance.now()
      await fetch(url, requestInit)
      const stopTimeMs = performance.now()
      const timeMs = stopTimeMs - startTimeMs
      data.push(timeMs)
      setResponseTimes((prevState) => [...prevState, timeMs])
      setProgress(() => ((i+1) / runs) * 100)
      setStats(() => {
        return {
          runs: i+1,
          mean: ss.mean(data),
          min: ss.min(data),
          max: ss.max(data),
          quantiles: {
            0.50: ss.quantile(data, 0.5),
            0.75: ss.quantile(data, 0.75),
            0.90: ss.quantile(data, 0.9),
            0.95: ss.quantile(data, 0.95),
            0.99: ss.quantile(data, 0.99),
          }
        }
      })
    }
  }

  function urlInputOnChange(event: ChangeEvent<HTMLInputElement>) {
    setUrl(() => event.target.value)
  }

  return (
    <div className="mt-3">
      <div className="p-3 mb-3 border bg-white">
        <div className="row mb-3">
          <label className="col-sm-4 col-form-label">URL</label>
          <div className="col-sm-8">
            <input className="form-control" type="text" value={url} onChange={urlInputOnChange} placeholder="Enter URL..."></input>
          </div>
        </div>

        <div className="row mb-3">
          <label className="col-sm-4 col-form-label">Sample Size</label>
          <div className="col-sm-8">
            <input className="form-control" type="number" value={runs} onChange={(e) => setRuns(+e.target.value)} min={1}></input>
          </div>
        </div>

        <button className="form-control btn btn-primary mb-3" onClick={onClick}>Start</button>

        <progress className="progress w-100" value={progress} max="100"></progress>
      </div>

      <div className="border overflow-hidden mb-3 bg-white">
        <Plot
          className='w-100'
          data={[
            {
              x: responseTimes,
              type: 'histogram',
            }
          ]}
          useResizeHandler={true}
          layout={{
            title: 'Response Time Distribution',
            xaxis: { title: "Response Time (ms)" },
            yaxis: { title: "Total Responses" },
          }}
        ></Plot>
      </div>

      <table className="table table-bordered bg-white">
        <thead>
          <tr>
            <th>Sample Size</th>
            <th>Mean (ms)</th>
            <th>Min (ms)</th>
            <th>Max (ms)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{stats?.runs}</td>
            <td>{stats?.mean.toFixed(PRECISION)}</td>
            <td>{stats?.min.toFixed(PRECISION)}</td>
            <td>{stats?.max.toFixed(PRECISION)}</td>
          </tr>
        </tbody>
      </table>

      <table className="table table-bordered bg-white">
        <thead>
          <tr>
            <th>Percentile</th>
            <th>Response Time (ms)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(stats?.quantiles).map(([k, v], i) => (
            <tr key={i}>
              <td>
                {k}
              </td>
              <td>
                {v.toFixed(PRECISION)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="table table-bordered bg-white">
        <thead>
          <tr>
            <th>Response Times (ms)</th>
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
