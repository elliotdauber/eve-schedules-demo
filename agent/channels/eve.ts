import { localDev, none } from 'eve/channels/auth';
import { defaultEveAuth, eveChannel } from 'eve/channels/eve';
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

    const tenantName = normalizeTenantName(rawName);
    const namespace = tenantNamespace(tenantName);
    const baseAuth = defaultEveAuth(ctx);

    const attributes = {
      ...(baseAuth?.attributes ?? {}),
      tenantName,
      tenantNamespace: namespace,
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
      ],
    };
  },
});
