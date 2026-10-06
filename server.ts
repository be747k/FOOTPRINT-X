import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const USER_AGENT = 'Mozilla/5.0 (compatible; OSINT-Scanner/1.0)';

app.use(express.json());

// Helper: normalize domain/target
function cleanDomain(input: string): string {
  let target = (input || '').trim();
  target = target.replace(/^https?:\/\//i, '');
  target = target.split('/')[0];
  target = target.split(':')[0];
  return target.toLowerCase();
}

// 1. DNS & Host Info
async function fetchDns(domain: string) {
  const result = {
    ip_addresses: [] as string[],
    reverse_dns: null as string | null,
    mx_records: [] as { exchange: string; priority: number }[],
    error: null as string | null,
  };

  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(domain);

  try {
    if (isIp) {
      result.ip_addresses = [domain];
      try {
        const ptr = await dns.reverse(domain);
        result.reverse_dns = ptr[0] || null;
      } catch {
        result.reverse_dns = null;
      }
    } else {
      // IPv4
      try {
        const aRecords = await dns.resolve4(domain);
        result.ip_addresses = Array.from(new Set(aRecords));
      } catch {
        try {
          const lookup = await dns.lookup(domain);
          result.ip_addresses = [lookup.address];
        } catch {
          result.ip_addresses = [];
        }
      }

      // Reverse DNS for primary IP
      if (result.ip_addresses.length > 0) {
        try {
          const ptr = await dns.reverse(result.ip_addresses[0]);
          result.reverse_dns = ptr[0] || null;
        } catch {
          result.reverse_dns = null;
        }
      }

      // MX
      try {
        const mx = await dns.resolveMx(domain);
        result.mx_records = mx.sort((a, b) => a.priority - b.priority);
      } catch {
        result.mx_records = [];
      }
    }
  } catch (err: any) {
    result.error = err.message || 'DNS resolution failed';
  }

  return result;
}

// 2. Geolocation & Network (ip-api.com)
async function fetchGeo(ip: string) {
  if (!ip) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const resp = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,city,lat,lon,isp,as,query`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': USER_AGENT },
      }
    );
    clearTimeout(timeout);

    if (resp.ok) {
      const data: any = await resp.json();
      if (data.status === 'success') {
        return {
          ip: data.query || ip,
          country: data.country || 'Unknown',
          city: data.city || 'Unknown',
          latitude: data.lat ?? null,
          longitude: data.lon ?? null,
          isp: data.isp || 'Unknown',
          asn: data.as || 'Unknown',
        };
      }
    }
  } catch {
    // Return basic fallback
  }

  return {
    ip,
    country: 'Unavailable',
    city: 'Unavailable',
    latitude: null,
    longitude: null,
    isp: 'Unavailable',
    asn: 'Unavailable',
  };
}

// 3. HTTP Security Headers
async function fetchHeaders(domain: string) {
  const result = {
    server: 'Not disclosed',
    x_powered_by: 'Not disclosed',
    hsts: {
      present: false,
      value: null as string | null,
    },
    csp: {
      present: false,
      value: null as string | null,
    },
    http_status: null as number | null,
    url_probed: null as string | null,
    error: null as string | null,
  };

  const protocols = ['https', 'http'];
  let headersObj: Record<string, string> = {};

  for (const proto of protocols) {
    try {
      const targetUrl = `${proto}://${domain}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);

      const resp = await fetch(targetUrl, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: '*/*',
        },
      });
      clearTimeout(timeout);

      result.http_status = resp.status;
      result.url_probed = resp.url || targetUrl;

      resp.headers.forEach((val, key) => {
        headersObj[key.toLowerCase()] = val;
      });
      break;
    } catch {
      continue;
    }
  }

  if (Object.keys(headersObj).length === 0) {
    result.error = 'Could not establish HTTP/HTTPS connection';
    return result;
  }

  if (headersObj['server']) {
    result.server = headersObj['server'];
  }
  if (headersObj['x-powered-by']) {
    result.x_powered_by = headersObj['x-powered-by'];
  }

  if (headersObj['strict-transport-security']) {
    result.hsts.present = true;
    result.hsts.value = headersObj['strict-transport-security'];
  }

  if (headersObj['content-security-policy']) {
    result.csp.present = true;
    result.csp.value = headersObj['content-security-policy'];
  }

  return result;
}

// 4. Subdomains via CRT.sh (with fallback to public hostsearch)
async function fetchSubdomains(domain: string) {
  const result = {
    domain,
    subdomains: [] as string[],
    total_found: 0,
    error: null as string | null,
  };

  const rawSet = new Set<string>();

  // Primary: CRT.sh Public CT API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const crtUrl = `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`;
    const resp = await fetch(crtUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
    });
    clearTimeout(timeout);

    if (resp.ok) {
      const records: any = await resp.json();
      if (Array.isArray(records)) {
        for (const item of records) {
          const val = item.name_value || '';
          const lines = val.split('\n');
          for (let line of lines) {
            line = line.trim().toLowerCase();
            line = line.replace(/^\*\./, '');
            if (line && line.includes(domain) && !line.startsWith('@')) {
              rawSet.add(line);
            }
          }
        }
      }
    }
  } catch {
    // CRT.sh timed out or busy, continue to fallback
  }

  // If CRT.sh returned 0 or timed out, query public HostSearch
  if (rawSet.size === 0) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const hsUrl = `https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(domain)}`;
      const resp = await fetch(hsUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': USER_AGENT },
      });
      clearTimeout(timeout);

      if (resp.ok) {
        const text = await resp.text();
        const lines = text.split('\n');
        for (const line of lines) {
          const parts = line.split(',');
          const host = (parts[0] || '').trim().toLowerCase();
          if (host && host.includes(domain)) {
            rawSet.add(host);
          }
        }
      }
    } catch {
      // ignore
    }
  }

  const list = Array.from(rawSet).sort();
  result.total_found = list.length;
  result.subdomains = list;

  if (list.length === 0) {
    result.error = 'No subdomains logged or target has no public CT records';
  }

  return result;
}

// REST API Route
app.post('/api/scan', async (req: Request, res: Response) => {
  const rawTarget = req.body.target;
  if (!rawTarget) {
    return res.status(400).json({ error: 'Target domain or IP address is required.' });
  }

  const target = cleanDomain(rawTarget);

  try {
    // Run DNS resolution first so we obtain IP for Geo
    const dnsData = await fetchDns(target);
    const primaryIp = dnsData.ip_addresses[0] || (target.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/) ? target : '');

    // In parallel, fetch Geo, HTTP Headers, and Subdomains
    const [geoData, headerData, subdomainData] = await Promise.all([
      fetchGeo(primaryIp),
      fetchHeaders(target),
      fetchSubdomains(target),
    ]);

    res.json({
      target,
      timestamp: new Date().toISOString(),
      overview_location: {
        ip: primaryIp || 'Not resolved',
        country: geoData?.country || 'N/A',
        city: geoData?.city || 'N/A',
        latitude: geoData?.latitude,
        longitude: geoData?.longitude,
        isp: geoData?.isp || 'N/A',
        asn: geoData?.asn || 'N/A',
      },
      dns_records: {
        ipv4: dnsData.ip_addresses,
        reverse_dns: dnsData.reverse_dns || 'None',
        mx_records: dnsData.mx_records,
        error: dnsData.error,
      },
      web_server_headers: {
        server: headerData.server,
        x_powered_by: headerData.x_powered_by,
        hsts: headerData.hsts,
        csp: headerData.csp,
        status: headerData.http_status,
        url_probed: headerData.url_probed,
        error: headerData.error,
      },
      subdomains: {
        total: subdomainData.total_found,
        list: subdomainData.subdomains,
        error: subdomainData.error,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Scan failed' });
  }
});

// VITE SPA MIDDLEWARE / STATIC ASSETS
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OSINT Web Tool running on port ${PORT}`);
  });
}

startServer();
