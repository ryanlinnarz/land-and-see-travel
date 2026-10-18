// Only Cloudflare calls FormSubmit; visitors submit to this site's own API.
const DELIVERY_URL = 'https://formsubmit.co/ajax/8b125580406e38162581355a5fed14cb';
const MAX_BODY_BYTES = 24000;

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders
    }
  });
}

async function readLimitedJson(request) {
  if (Number(request.headers.get('Content-Length')) > MAX_BODY_BYTES) {
    throw new RangeError('Too large');
  }
  if (!request.body) throw new SyntaxError('Missing body');
  const reader = request.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RangeError('Too large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function onRequest({ request }) {
  const url = new URL(request.url);
  if (request.method === 'GET') {
    return json({ ready: true, version: 'delivery-3', message: 'Inquiry receiver is available.' });
  }
  if (request.method !== 'POST') {
    return json({ success: false, message: 'Method not allowed.' }, 405, { Allow: 'GET, POST' });
  }
  // No cross-origin browser access. This also rejects normal cross-site form posts.
  if (request.headers.get('Origin') !== url.origin) {
    return json({ success: false, message: 'Please submit the form from our website.' }, 403);
  }
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return json({ success: false, message: 'Unsupported form format.' }, 415);
  }
  let data;
  try {
    data = await readLimitedJson(request);
  } catch (error) {
    return json({ success: false, message: error instanceof RangeError ? 'Your inquiry is too long.' : 'Please check the form and try again.' }, error instanceof RangeError ? 413 : 400);
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return json({ success: false, message: 'Please check the form and try again.' }, 400);
  }
  // Honeypot submissions are discarded, with no email or provider request.
  if (typeof data._honey === 'string' && data._honey.trim()) return json({ success: true });

  const limits = { first_name: 75, last_name: 75, email: 254, phone: 50, destination: 300, date_mode: 20, start_date: 10, end_date: 10, start_month: 7, end_month: 7, dates: 200, trip_type: 40, budget: 150, message: 5000 };
  const fields = {};
  for (const [key, limit] of Object.entries(limits)) {
    const value = data[key] ?? '';
    if (typeof value !== 'string' || value.length > limit || value.includes('\0')) {
      return json({ success: false, message: 'Please check your form entries and try again.' }, 400);
    }
    fields[key] = value.trim();
  }
  const adults = String(data.adults ?? '');
  const children = String(data.children ?? '0');
  if (!fields.first_name || !fields.last_name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) || /[\r\n]/.test(fields.email) || !/^\d{1,3}$/.test(adults) || !/^\d{1,3}$/.test(children) || Number(adults) < 1 || Number(adults) + Number(children) > 500) {
    return json({ success: false, message: 'Please provide your first and last name, valid email, and traveler counts (at least one adult).' }, 400);
  }
  if (!['exact', 'months', 'flexible'].includes(fields.date_mode) || !['', 'Cruise', 'All-inclusive', 'Tour', 'Custom', 'Other', 'Help me decide'].includes(fields.trip_type)) {
    return json({ success: false, message: 'Please choose one of the available date and trip-type options.' }, 400);
  }
  let travelDates = fields.dates || 'Flexible / not decided';
  if (fields.date_mode === 'exact') {
    const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
    if (!validDate(fields.start_date) || !validDate(fields.end_date) || fields.end_date < fields.start_date) {
      return json({ success: false, message: 'Please provide valid start and end dates, with the end on or after the start.' }, 400);
    }
    travelDates = fields.start_date + ' to ' + fields.end_date;
  } else if (fields.date_mode === 'months') {
    const validMonth = value => /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
    if (!validMonth(fields.start_month) || !validMonth(fields.end_month) || fields.end_month < fields.start_month) {
      return json({ success: false, message: 'Please provide a valid first and last month, in that order.' }, 400);
    }
    travelDates = fields.start_month + ' through ' + fields.end_month;
  }
  // Allowlist traveler fields; the client cannot set recipients, redirects, or webhooks.
  const payload = {
    ...fields,
    name: fields.first_name + ' ' + fields.last_name,
    adults,
    children,
    travelers: String(Number(adults) + Number(children)),
    dates: travelDates,
    _subject: 'New trip inquiry — Land & See Travel',
    _template: 'table',
    _honey: ''
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const upstream = await fetch(DELIVERY_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': url.origin,
        'Referer': url.origin + '/plan-my-trip/inquiry'
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      // workerd rejects redirect:'error' during Request construction.
      // Inspect redirects explicitly so traveler data is never forwarded elsewhere.
      redirect: 'manual'
    });
    if (upstream.status >= 300 && upstream.status < 400) {
      return json({ success: false, message: 'The delivery service redirected the request (HTTP ' + upstream.status + '). The website did not forward your details to another address. Please email ryan@landseetravel.com.' }, 424);
    }
    let result;
    try {
      result = await upstream.json();
    } catch {
      return json({ success: false, message: 'The delivery service returned an unexpected response (HTTP ' + upstream.status + '). Email delivery was not confirmed. Please email ryan@landseetravel.com.' }, 424);
    }
    if (!upstream.ok || !(result.success === true || result.success === 'true')) {
      const detail = String(result.message || result.error || '').toLowerCase();
      let message = 'The delivery service did not accept the inquiry (HTTP ' + upstream.status + '). Please email ryan@landseetravel.com.';
      if (/activat|confirm.*email|verify.*email/.test(detail)) message = 'The delivery service requires email activation for this form connection. Ryan needs to check the receiving inbox and confirm the activation before inquiries can be delivered.';
      else if (/captcha/.test(detail)) message = 'The delivery service requires a verification step that this forwarding connection cannot complete. Please email ryan@landseetravel.com.';
      else if (upstream.status === 429 || /too many|rate.limit/.test(detail)) message = 'The delivery service is temporarily limiting requests. Please wait before retrying, or email ryan@landseetravel.com.';
      else if (upstream.status === 403) message = 'The delivery service refused the website connection (HTTP 403). Please email ryan@landseetravel.com.';
      return json({ success: false, message }, 424);
    }
    // Acceptance is confirmed; inbox arrival is checked separately during deployment.
    return json({ success: true });
  } catch (error) {
    return json({ success: false, message: error.name === 'AbortError'
      ? 'Delivery timed out, so receipt is uncertain. Please email ryan@landseetravel.com rather than resubmitting immediately.'
      : 'The website could not connect to the delivery service. Please email ryan@landseetravel.com.' }, 424);
  } finally {
    clearTimeout(timeout);
  }
}
