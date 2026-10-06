import React, { useState, useEffect } from 'react';
import { GeoMap } from './components/GeoMap';

interface ScanData {
  target: string;
  timestamp: string;
  overview_location: {
    ip: string;
    country: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
    isp: string;
    asn: string;
  };
  dns_records: {
    ipv4: string[];
    reverse_dns: string;
    mx_records: { exchange: string; priority: number }[];
    error: string | null;
  };
  web_server_headers: {
    server: string;
    x_powered_by: string;
    hsts: {
      present: boolean;
      value: string | null;
    };
    csp: {
      present: boolean;
      value: string | null;
    };
    status: number | null;
    url_probed: string | null;
    error: string | null;
  };
  subdomains: {
    total: number;
    list: string[];
    error: string | null;
  };
}

export default function App() {
  const [target, setTarget] = useState<string>('scanme.nmap.org');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ScanData | null>(null);
  const [subdomainSearch, setSubdomainSearch] = useState<string>('');

  const runScan = async (inputTarget?: string) => {
    const query = (inputTarget || target).trim();
    if (!query) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: query }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || `HTTP error ${response.status}`);
      }

      const result: ScanData = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to complete scan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runScan('scanme.nmap.org');
  }, []);

  const handleExportJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.target}_osint_scan.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredSubdomains = data?.subdomains?.list
    ? data.subdomains.list.filter((sub) =>
        sub.toLowerCase().includes(subdomainSearch.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-white text-black p-6 md:p-10 max-w-6xl mx-auto font-sans">
      {/* Header Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">FOOTPRINT-X</h1>
          <p className="text-sm text-neutral-600 mt-0.5">Automated Surface Exposure & Digital Footprint Analyzer</p>
        </div>

        {data && (
          <button
            onClick={handleExportJson}
            className="px-4 py-2 text-xs font-mono font-medium bg-black text-white hover:bg-neutral-800 transition-colors self-start sm:self-auto cursor-pointer"
          >
            Export Scan Data (JSON)
          </button>
        )}
      </header>

      {/* Top Search Bar */}
      <section className="mt-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runScan();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Enter target domain or IP (e.g. scanme.nmap.org)"
            className="flex-1 px-4 py-3 border border-black text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black placeholder:text-neutral-400 bg-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            {loading ? 'Scanning...' : 'Run Scan'}
          </button>
        </form>

        <div className="flex items-center gap-2 mt-3 text-xs text-neutral-500 font-mono">
          <span>Quick presets:</span>
          <button
            type="button"
            onClick={() => {
              setTarget('scanme.nmap.org');
              runScan('scanme.nmap.org');
            }}
            className="underline hover:text-black cursor-pointer"
          >
            scanme.nmap.org
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => {
              setTarget('owasp.org');
              runScan('owasp.org');
            }}
            className="underline hover:text-black cursor-pointer"
          >
            owasp.org
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => {
              setTarget('wikipedia.org');
              runScan('wikipedia.org');
            }}
            className="underline hover:text-black cursor-pointer"
          >
            wikipedia.org
          </button>
        </div>
      </section>

      {/* Status & Error Messages */}
      {loading && (
        <div className="mt-6 p-4 border border-black text-xs font-mono bg-neutral-50">
          Querying DNS records, GeoIP endpoints, HTTP response headers, and Certificate Transparency logs...
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 border border-black text-xs font-mono bg-neutral-100">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Scan Results Layout */}
      {data && !loading && (
        <main className="mt-8 space-y-6">
          {/* Target Metadata Bar */}
          <div className="text-xs font-mono text-neutral-500 pb-2 border-b border-neutral-300 flex justify-between items-center">
            <span>TARGET: {data.target}</span>
            <span>SCAN TIMESTAMP: {new Date(data.timestamp).toUTCString()}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section 1: Overview & Location */}
            <div className="border border-black p-5 bg-white">
              <h2 className="text-xs font-bold uppercase tracking-wider font-mono border-b border-black pb-2 mb-4">
                Section 1: Overview & Location
              </h2>

              <dl className="space-y-3 text-xs font-mono">
                <div>
                  <dt className="text-neutral-500">IP Address</dt>
                  <dd className="font-semibold mt-0.5 text-sm">{data.overview_location.ip}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Location</dt>
                  <dd className="font-semibold mt-0.5">
                    {data.overview_location.city}, {data.overview_location.country}
                    {data.overview_location.latitude !== null && (
                      <span className="text-neutral-500 font-normal ml-2">
                        ({data.overview_location.latitude}, {data.overview_location.longitude})
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Internet Service Provider (ISP)</dt>
                  <dd className="font-semibold mt-0.5">{data.overview_location.isp}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Autonomous System (ASN)</dt>
                  <dd className="font-semibold mt-0.5">{data.overview_location.asn}</dd>
                </div>
              </dl>
            </div>

            {/* Section 2: DNS Records */}
            <div className="border border-black p-5 bg-white">
              <h2 className="text-xs font-bold uppercase tracking-wider font-mono border-b border-black pb-2 mb-4">
                Section 2: DNS Records
              </h2>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <div className="text-neutral-500 mb-1">IPv4 (A Records)</div>
                  {data.dns_records.ipv4.length > 0 ? (
                    <ul className="space-y-1">
                      {data.dns_records.ipv4.map((ip, idx) => (
                        <li key={idx} className="font-semibold">
                          {ip}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-neutral-400">None detected</div>
                  )}
                </div>

                <div>
                  <div className="text-neutral-500 mb-1">Reverse DNS (PTR)</div>
                  <div className="font-semibold">{data.dns_records.reverse_dns}</div>
                </div>

                <div>
                  <div className="text-neutral-500 mb-1">Mail Exchanger (MX Records)</div>
                  {data.dns_records.mx_records.length > 0 ? (
                    <table className="w-full text-left mt-1 border-t border-neutral-200">
                      <thead>
                        <tr className="border-b border-neutral-200 text-neutral-500">
                          <th className="py-1">Exchange</th>
                          <th className="py-1 text-right">Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.dns_records.mx_records.map((mx, idx) => (
                          <tr key={idx} className="border-b border-neutral-100">
                            <td className="py-1">{mx.exchange}</td>
                            <td className="py-1 text-right">{mx.priority}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-neutral-400">No MX records configured</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Target Geolocation Map (D3.js) */}
          <GeoMap
            latitude={data.overview_location.latitude}
            longitude={data.overview_location.longitude}
            city={data.overview_location.city}
            country={data.overview_location.country}
            ip={data.overview_location.ip}
          />

          {/* Section 4: Web Server & Headers */}
          <div className="border border-black p-5 bg-white">
            <h2 className="text-xs font-bold uppercase tracking-wider font-mono border-b border-black pb-2 mb-4">
              Section 4: Web Server & Headers
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              <div className="space-y-3">
                <div>
                  <div className="text-neutral-500">Server Banner</div>
                  <div className="font-semibold text-sm mt-0.5">{data.web_server_headers.server}</div>
                </div>

                <div>
                  <div className="text-neutral-500">X-Powered-By</div>
                  <div className="font-semibold mt-0.5">{data.web_server_headers.x_powered_by}</div>
                </div>

                {data.web_server_headers.url_probed && (
                  <div>
                    <div className="text-neutral-500">Probed URL / Status</div>
                    <div className="font-semibold mt-0.5">
                      {data.web_server_headers.url_probed} (HTTP {data.web_server_headers.status})
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="text-neutral-500 mb-2">Security Headers Checklist</div>
                <div className="space-y-2">
                  <div className="p-2.5 border border-black flex items-start justify-between">
                    <div>
                      <div className="font-bold">Strict-Transport-Security (HSTS)</div>
                      <div className="text-[11px] text-neutral-500 truncate max-w-sm">
                        {data.web_server_headers.hsts.value || 'Header absent'}
                      </div>
                    </div>
                    <span className="font-bold">
                      {data.web_server_headers.hsts.present ? '[ PRESENT ]' : '[ MISSING ]'}
                    </span>
                  </div>

                  <div className="p-2.5 border border-black flex items-start justify-between">
                    <div>
                      <div className="font-bold">Content-Security-Policy (CSP)</div>
                      <div className="text-[11px] text-neutral-500 truncate max-w-sm">
                        {data.web_server_headers.csp.value || 'Header absent'}
                      </div>
                    </div>
                    <span className="font-bold">
                      {data.web_server_headers.csp.present ? '[ PRESENT ]' : '[ MISSING ]'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Discovered Subdomains */}
          <div className="border border-black p-5 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black pb-2 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider font-mono">
                Section 5: Discovered Subdomains ({data.subdomains.total})
              </h2>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Filter subdomains..."
                  value={subdomainSearch}
                  onChange={(e) => setSubdomainSearch(e.target.value)}
                  className="px-2.5 py-1 border border-black text-xs font-mono focus:outline-none placeholder:text-neutral-400"
                />
              </div>
            </div>

            {data.subdomains.list.length > 0 ? (
              <div className="max-h-80 overflow-y-auto border border-neutral-300 font-mono text-xs">
                <table className="w-full text-left">
                  <thead className="bg-neutral-100 border-b border-neutral-300 sticky top-0">
                    <tr>
                      <th className="p-2 w-16">#</th>
                      <th className="p-2">Fully Qualified Domain Name (FQDN)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubdomains.map((sub, idx) => (
                      <tr key={idx} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="p-2 text-neutral-400">{idx + 1}</td>
                        <td className="p-2 font-medium">{sub}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs font-mono text-neutral-400">
                {data.subdomains.error || 'No subdomains found in Certificate Transparency logs.'}
              </div>
            )}
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-black text-xs font-mono text-neutral-500 flex justify-between">
        <span>FOOTPRINT-X · OSINT SCANNER</span>
        <span>NO CACHED OR MOCK DATA</span>
      </footer>
    </div>
  );
}
