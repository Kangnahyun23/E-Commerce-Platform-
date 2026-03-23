const jwt = require('jsonwebtoken');

const DEFAULT_TIMEOUT_MS = 9_000;

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDate(value) {
  if (!value) return null;
  const text = String(value);
  if (/^\d{8}$/.test(text)) {
    return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
  }
  return text;
}

function emptyTraffic(status, provider, message) {
  return {
    status,
    provider,
    visits: 0,
    uniqueVisitors: 0,
    pageViews: 0,
    series: [],
    message: message || null,
  };
}

async function fetchJson(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const rawText = await response.text();
    let payload = {};
    try {
      payload = rawText ? JSON.parse(rawText) : {};
    } catch {
      payload = { raw: rawText };
    }
    if (!response.ok) {
      const err = new Error(`Analytics request failed (${response.status})`);
      err.statusCode = response.status;
      err.details = payload;
      throw err;
    }
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

function getProvider() {
  const provider = String(process.env.ANALYTICS_PROVIDER || 'none').trim().toLowerCase();
  if (!provider) return 'none';
  if (['none', 'plausible', 'ga4'].includes(provider)) return provider;
  return 'none';
}

function parsePlausibleSeries(results) {
  if (!Array.isArray(results)) return [];
  return results
    .map((row) => {
      const date = normalizeDate(row?.date || row?.name || row?.label || row?.dimensions?.[0] || row?.[0]);
      const visitors = toNumber(
        row?.visitors
        ?? row?.visitor
        ?? row?.unique_visitors
        ?? row?.uniqueVisitors
        ?? row?.metrics?.visitors
        ?? row?.metrics?.[0],
      );
      const visits = toNumber(
        row?.visits
        ?? row?.metrics?.visits
        ?? row?.metrics?.[1]
        ?? row?.[1],
      );
      const pageViews = toNumber(
        row?.pageviews
        ?? row?.pageViews
        ?? row?.metrics?.pageviews
        ?? row?.metrics?.[2]
        ?? row?.[2],
      );
      return {
        date,
        visits,
        uniqueVisitors: visitors,
        pageViews,
      };
    })
    .filter((item) => Boolean(item.date));
}

async function getPlausibleTraffic({ from, to }) {
  const siteId = String(process.env.PLAUSIBLE_SITE_ID || '').trim();
  const apiKey = String(process.env.PLAUSIBLE_API_KEY || '').trim();
  const apiBase = String(process.env.PLAUSIBLE_API_URL || 'https://plausible.io').trim().replace(/\/$/, '');

  if (!siteId || !apiKey) {
    return emptyTraffic('unconfigured', 'plausible', 'Missing PLAUSIBLE_SITE_ID or PLAUSIBLE_API_KEY');
  }

  const commonParams = new URLSearchParams({
    site_id: siteId,
    period: 'custom',
    date: `${from},${to}`,
  });

  const headers = { Authorization: `Bearer ${apiKey}` };

  try {
    const [aggregatePayload, timeseriesPayload] = await Promise.all([
      fetchJson(`${apiBase}/api/v1/stats/aggregate?${commonParams.toString()}&metrics=visitors,visits,pageviews`, { headers }),
      fetchJson(`${apiBase}/api/v1/stats/timeseries?${commonParams.toString()}&metrics=visitors,visits,pageviews`, { headers }),
    ]);

    const agg = aggregatePayload?.results || {};
    const series = parsePlausibleSeries(timeseriesPayload?.results);

    const visits = toNumber(agg.visits ?? series.reduce((sum, item) => sum + item.visits, 0));
    const uniqueVisitors = toNumber(agg.visitors ?? series.reduce((sum, item) => sum + item.uniqueVisitors, 0));
    const pageViews = toNumber(agg.pageviews ?? series.reduce((sum, item) => sum + item.pageViews, 0));

    return {
      status: 'ok',
      provider: 'plausible',
      visits,
      uniqueVisitors,
      pageViews,
      series,
      message: null,
    };
  } catch (err) {
    return emptyTraffic('unavailable', 'plausible', err.message || 'Plausible request failed');
  }
}

function buildGooglePrivateKey() {
  const raw = String(process.env.GA4_PRIVATE_KEY || '').trim();
  if (!raw) return '';
  return raw.replace(/\\n/g, '\n');
}

async function getGoogleAccessToken() {
  const clientEmail = String(process.env.GA4_CLIENT_EMAIL || '').trim();
  const privateKey = buildGooglePrivateKey();
  const tokenUrl = String(process.env.GA4_TOKEN_URL || 'https://oauth2.googleapis.com/token').trim();

  if (!clientEmail || !privateKey) {
    throw Object.assign(new Error('Missing GA4_CLIENT_EMAIL or GA4_PRIVATE_KEY'), { statusCode: 400 });
  }

  const now = Math.floor(Date.now() / 1000);
  const assertion = jwt.sign(
    {
      iss: clientEmail,
      sub: clientEmail,
      aud: tokenUrl,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      iat: now,
      exp: now + 3600,
    },
    privateKey,
    { algorithm: 'RS256' },
  );

  const form = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });

  const tokenPayload = await fetchJson(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  const accessToken = String(tokenPayload?.access_token || '').trim();
  if (!accessToken) {
    throw Object.assign(new Error('Unable to get GA4 access token'), { statusCode: 500 });
  }
  return accessToken;
}

function parseGa4Series(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => {
      const date = normalizeDate(row?.dimensionValues?.[0]?.value);
      const visits = toNumber(row?.metricValues?.[0]?.value);
      const uniqueVisitors = toNumber(row?.metricValues?.[1]?.value);
      const pageViews = toNumber(row?.metricValues?.[2]?.value);
      return { date, visits, uniqueVisitors, pageViews };
    })
    .filter((item) => Boolean(item.date));
}

async function getGa4Traffic({ from, to }) {
  const propertyId = String(process.env.GA4_PROPERTY_ID || '').trim();
  if (!propertyId) {
    return emptyTraffic('unconfigured', 'ga4', 'Missing GA4_PROPERTY_ID');
  }

  try {
    const accessToken = await getGoogleAccessToken();
    const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
    const reportPayload = await fetchJson(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: from, endDate: to }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
        ],
        keepEmptyRows: true,
      }),
    });

    const series = parseGa4Series(reportPayload?.rows);
    const totals = reportPayload?.totals?.[0]?.metricValues || [];
    const visits = totals.length > 0 ? toNumber(totals[0]?.value) : series.reduce((sum, item) => sum + item.visits, 0);
    const uniqueVisitors = totals.length > 1 ? toNumber(totals[1]?.value) : series.reduce((sum, item) => sum + item.uniqueVisitors, 0);
    const pageViews = totals.length > 2 ? toNumber(totals[2]?.value) : series.reduce((sum, item) => sum + item.pageViews, 0);

    return {
      status: 'ok',
      provider: 'ga4',
      visits,
      uniqueVisitors,
      pageViews,
      series,
      message: null,
    };
  } catch (err) {
    return emptyTraffic('unavailable', 'ga4', err.message || 'GA4 request failed');
  }
}

async function getTrafficStats({ from, to }) {
  const provider = getProvider();
  if (provider === 'none') {
    return emptyTraffic('unconfigured', 'none', 'ANALYTICS_PROVIDER is not configured');
  }
  if (provider === 'plausible') {
    return getPlausibleTraffic({ from, to });
  }
  if (provider === 'ga4') {
    return getGa4Traffic({ from, to });
  }
  return emptyTraffic('unconfigured', provider, 'Unsupported analytics provider');
}

module.exports = { getTrafficStats };
