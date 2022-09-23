import React, { useState, MouseEvent, ChangeEvent } from 'react';
import * as ss from 'simple-statistics'
import Plot from 'react-plotly.js';
import './App.css';

const IS_DEV = false
const JUST_CORS_URL = "https://justcors.com/tl_64713a4/"
const PRECISION = 2

interface Stats {
  runs: number;
  mean: number;
  min: number;
  max: number;
  quantiles: Record<number, number>;
}

function App() {
  const urlSearchParams = new URLSearchParams(window?.location?.search);
  const urlParam = urlSearchParams.get('url')
  const [url, setUrl] = useState<string>(urlParam ?? "")
  const [runs, setRuns] = useState<number>(100)
  const [responseTimes, setResponseTimes] = useState<number[]>([])
  const [stats, setStats] = useState<Stats>({
    runs: 0,
    mean: 0,
    min: 0,
    max: 0,
    quantiles: []
  })
  const [progress, setProgress] = useState<number>(0)

  async function onClick(event: MouseEvent<HTMLButtonElement>) {
    const fetchUrl = IS_DEV ? `${JUST_CORS_URL}${url}` : url
    const data: number[] = []

    setResponseTimes(() => [])
    setProgress(() => 0)

    window.history.replaceState(
      {},
      "",
      `${window.location.origin}${window.location.pathname}?url=${encodeURI(url)}`,
    );

    for (let i = 0; i < runs; i++) {
      const startTimeMs = performance.now()
      await fetch(fetchUrl, { mode: 'no-cors' })
      const stopTimeMs = performance.now()
      const timeMs = stopTimeMs - startTimeMs
      data.push(timeMs)
      setResponseTimes((prevState) => [...prevState, timeMs])
      setProgress(() => ((i+1) / runs) * 100)
    }

    setStats(() => {
      return {
        runs,
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

  function urlInputOnChange(event: ChangeEvent<HTMLInputElement>) {
    setUrl(() => event.target.value)
  }

  return (
    <div className="App mt-3">
      <div className="p-3 mb-3 border">
        <div className="row mb-3">
          <label className="col-sm-4 col-form-label">URL</label>
          <div className="col-sm-8">
            <input className="form-control" type="text" value={url} onChange={urlInputOnChange} placeholder="Enter URL..."></input>
          </div>
        </div>
        <div className="row mb-3">
          <label className="col-sm-4 col-form-label">Total Runs</label>
          <div className="col-sm-8">
            <input className="form-control" type="number" value={runs} onChange={(e) => setRuns(+e.target.value)} min={1}></input>
          </div>
        </div>

        <button className="form-control btn btn-primary" onClick={onClick}>Start</button>
      </div>

      <div className="p-3 mb-3 border">
        <label className="col-sm-4 col-form-label">Progress</label>
        <progress value={progress} max="100"></progress>
      </div>
     
      <div>
        <div className="border mb-3">
          <Plot
            data={[
              {
                x: responseTimes,
                type: 'histogram',
              }
            ]}
            layout={{
              width: 600,
              height: 400,
              title: 'Response Times (ms)',
              xaxis: {title: "Response Time (ms)"},
              yaxis: {title: "Total Responses"},
            }}
          ></Plot>
        </div>
        <table className="table border">
          <thead>
            <tr>
              <th>Total Runs</th>
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
      </div>
      <table className="table table-striped border">
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
