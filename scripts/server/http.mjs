export class HttpError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

export function sendJson(response, status, value) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(value, null, 2));
}

export function sendText(response, status, text) {
  response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(text);
}

export function readBody(request, maxRequestBytes) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > maxRequestBytes) {
        reject(new HttpError("Request body too large.", 413));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

export async function readJsonBody(request, maxRequestBytes) {
  const raw = await readBody(request, maxRequestBytes);
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new HttpError(`Invalid JSON request body: ${error.message}`, 400);
  }
}
