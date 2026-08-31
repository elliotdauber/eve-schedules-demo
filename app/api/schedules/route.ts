import { Schedules } from '@vercel/schedules';

export async function GET() {
  try {
    const result = await Schedules.list();
    return Response.json({
      schedules: result.data,
      count: result.data.length,
      cursor: result.cursor,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to list schedules';
    return Response.json({ error: message }, { status: 500 });
  }
}
