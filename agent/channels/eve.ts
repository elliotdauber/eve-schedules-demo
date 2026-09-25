import { localDev, none } from 'eve/channels/auth';
import { defaultEveAuth, eveChannel } from 'eve/channels/eve';
import { normalizeTimezone, TIMEZONE_HEADER } from '@/lib/schedule-timezone';
import {
  normalizeTenantName,
  tenantNamespace,
  TENANT_HEADER,
} from '@/lib/tenant';

export default eveChannel({
  auth: [localDev(), none()],
  onMessage: async ctx => {
    const rawName = ctx.eve.request.headers.get(TENANT_HEADER);
    if (!rawName?.trim()) {
      throw new Response('Missing tenant name header', { status: 400 });
    }

    const rawTimezone = ctx.eve.request.headers.get(TIMEZONE_HEADER);
    if (!rawTimezone?.trim()) {
      throw new Response('Missing timezone header', { status: 400 });
    }

    const tenantName = normalizeTenantName(rawName);
    const namespace = tenantNamespace(tenantName);
    const scheduleTimezone = normalizeTimezone(rawTimezone);
    const baseAuth = defaultEveAuth(ctx);

    const attributes = {
      ...(baseAuth?.attributes ?? {}),
      tenantName,
      tenantNamespace: namespace,
      scheduleTimezone,
    };

    return {
      auth: baseAuth
        ? { ...baseAuth, attributes }
        : {
            attributes,
            authenticator: 'tenant-demo',
            principalId: tenantName,
            principalType: 'user',
          },
      context: [
        `Tenant namespace: ${namespace}. All schedule create, list, get, and delete operations are scoped to this namespace automatically.`,
        `Schedule timezone: ${scheduleTimezone}. Cron expressions and one-time at values are interpreted in this timezone.`,
      ],
    };
  },
});
