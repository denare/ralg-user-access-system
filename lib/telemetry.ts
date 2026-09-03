/**
 * e-Vibali Chalinze Production Telemetry & Audit Exception Logger
 * Logs system errors, database timeouts, and PDFKit rendering failures.
 */

type Severity = "P0_CRITICAL" | "P1_WARNING" | "INFO";

export function logTelemetry(event: string, details?: Record<string, unknown>, severity: Severity = "INFO") {
  const timestamp = new Date().toISOString();
  const logEntry = {
    system: "e-Vibali-Chalinze",
    environment: process.env.NODE_ENV ?? "development",
    timestamp,
    severity,
    event,
    details: details ?? {}
  };

  if (severity === "P0_CRITICAL") {
    console.error(`[P0 TELEMETRY CRITICAL ALERT] ${timestamp} - ${event}:`, JSON.stringify(logEntry));
  } else if (severity === "P1_WARNING") {
    console.warn(`[P1 TELEMETRY WARNING] ${timestamp} - ${event}:`, JSON.stringify(logEntry));
  } else {
    console.log(`[TELEMETRY INFO] ${timestamp} - ${event}:`, JSON.stringify(logEntry));
  }
}
