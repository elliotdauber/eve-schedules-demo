export const TENANT_STORAGE_KEY = 'eve-schedules-demo-tenant';
export const TENANT_HEADER = 'x-tenant-name';

const TENANT_PATTERN = /^[a-z0-9][a-z0-9_-]{0,30}[a-z0-9]$|^[a-z0-9]$/;

export function normalizeTenantName(raw: string): string {
  const normalized = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '');

  if (!normalized || !TENANT_PATTERN.test(normalized)) {
    throw new Error(
      'Name must be 1–32 characters using letters, numbers, hyphens, or underscores.'
    );
  }

  return normalized;
}

const NAMESPACE_PREFIX = 'user.';

export function tenantNamespace(tenantName: string): string {
  return `${NAMESPACE_PREFIX}${normalizeTenantName(tenantName)}`;
}

export function tenantSlugFromNamespace(namespace: string): string | null {
  if (!namespace.startsWith(NAMESPACE_PREFIX)) {
    return null;
  }
  const slug = namespace.slice(NAMESPACE_PREFIX.length);
  return slug.length > 0 ? slug : null;
}

export function tenantBlobPrefix(tenantName: string): string {
  return `tenants/${normalizeTenantName(tenantName)}/activity/`;
}

export function getTenantNameFromRequest(request: Request): string {
  const raw = request.headers.get(TENANT_HEADER);
  if (!raw?.trim()) {
    throw new Error('Missing tenant name');
  }
  return normalizeTenantName(raw);
}

export function getTenantNamespaceFromRequest(request: Request): string {
  return tenantNamespace(getTenantNameFromRequest(request));
}
