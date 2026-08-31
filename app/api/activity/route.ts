import { isBlobStoreConfigured, listActivity } from '@/lib/activity-log';

export async function GET() {
  try {
    const events = await listActivity();
    return Response.json({
      events,
      count: events.length,
      blobConfigured: isBlobStoreConfigured(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to list activity';
    return Response.json({ error: message }, { status: 500 });
  }
}
