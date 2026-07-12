import type { NextFunction, Request, Response } from 'express';
import { supabase } from './supabaseClient';

interface LogEntry {
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
  is_error: boolean;
}

const recentLogs: LogEntry[] = [];
const MAX_IN_MEMORY_LOGS = 500;

export function apiMonitoringMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    const entry: LogEntry = {
      method: req.method,
      path: req.route?.path ? `${req.baseUrl}${req.route.path}` : req.path,
      status_code: res.statusCode,
      duration_ms: Date.now() - start,
      is_error: res.statusCode >= 400,
    };
    recentLogs.push(entry);
    if (recentLogs.length > MAX_IN_MEMORY_LOGS) recentLogs.shift();

    // Best-effort async persistence; failures here must never break the request.
    if (supabase) {
      supabase
        .from('api_logs')
        .insert({
          method: entry.method,
          path: entry.path,
          status_code: entry.status_code,
          duration_ms: entry.duration_ms,
          is_error: entry.is_error,
        })
        .then(
          () => undefined,
          () => undefined
        );
    }
  });
  next();
}

export function getRecentLogs(limit = 100): LogEntry[] {
  return recentLogs.slice(-limit).reverse();
}

export function getApiMonitoringStats() {
  const total = recentLogs.length;
  const errors = recentLogs.filter((l) => l.is_error).length;
  const avgDuration = total > 0 ? recentLogs.reduce((sum, l) => sum + l.duration_ms, 0) / total : 0;
  return {
    totalRequests: total,
    errorCount: errors,
    errorRate: total > 0 ? Number(((errors / total) * 100).toFixed(2)) : 0,
    averageDurationMs: Number(avgDuration.toFixed(1)),
  };
}
