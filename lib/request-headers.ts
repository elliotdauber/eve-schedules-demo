import { TIMEZONE_HEADER } from '@/lib/schedule-timezone';
import { TENANT_HEADER } from '@/lib/tenant';

export function buildTenantRequestHeaders(
  tenantName: string,
  timezone: string
): Record<string, string> {
  return {
    [TENANT_HEADER]: tenantName,
    [TIMEZONE_HEADER]: timezone,
  };
}
