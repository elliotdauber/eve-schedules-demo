import { isBlobStoreConfigured, listActivity } from '@/lib/activity-log';
import { getTenantNameFromRequest } from '@/lib/tenant';

export async function GET(request: Request) {
  try {
    const tenantName = getTenantNameFromRequest(request);
    const events = await listActivity(tenantName);
    return Response.json({
      tenantName,
      events,
      count: events.length,
      blobConfigured: isBlobStoreConfigured(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to list activity';
    const status = message.includes('Missing tenant') ? 400 : 500;
    return Response.json({ error: message }, { status });
  }
}
