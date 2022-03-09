import cronParser from "cron-parser";
import { Redis } from "ioredis";

export function cron(lastDate: Date, cronExpression: string): Date {
  const expr = cronParser.parseExpression(cronExpression, {
    utc: true,
    currentDate: lastDate,
  });

  const nextExecution = expr.next().toDate();

  return nextExecution;
}

export function every(lastDate: Date, scheduleMeta: string): Date {
  return new Date(+lastDate + +scheduleMeta);
}

export async function createOwl(
  redisFactory: () => Redis,
  incidentReceiver?: { endpoint: string; passphrase: string }
) {}
