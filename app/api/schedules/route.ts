import { Schedules } from '@vercel/schedules';
import {
  getTenantNameFromRequest,
  getTenantNamespaceFromRequest,
} from '@/lib/tenant';

export async function GET(request: Request) {
  try {
    const namespace = getTenantNamespaceFromRequest(request);
    const tenantName = getTenantNameFromRequest(request);
    const result = await Schedules.list({ namespace });
    return Response.json({
      tenantName,
      namespace,
      schedules: result.data,
      count: result.data.length,
      cursor: result.cursor,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to list schedules';
    const status = message.includes('Missing tenant') ? 400 : 500;
    return Response.json({ error: message }, { status });
  }
}
