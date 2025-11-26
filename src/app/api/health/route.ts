import { NextResponse } from 'next/server';

export async function GET() {
  const uptime = Math.round(process.uptime());
  const environment = process.env.NODE_ENV || 'development';
  const payload = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime,
    environment,
  };
  return NextResponse.json(payload);
}