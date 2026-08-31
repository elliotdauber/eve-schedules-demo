import type { ToolContext } from 'eve/tools';
import { tenantNamespace } from '@/lib/tenant';

function readNamespaceAttribute(
  attributes: Readonly<Record<string, string | readonly string[]>> | undefined
): string | null {
  const value = attributes?.tenantNamespace;
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  return null;
}

export function getTenantNamespaceFromContext(ctx: ToolContext): string {
  const namespace =
    readNamespaceAttribute(ctx.session.auth.current?.attributes) ??
    readNamespaceAttribute(ctx.session.auth.initiator?.attributes);

  if (namespace) {
    return namespace;
  }

  const tenantName = ctx.session.auth.current?.attributes.tenantName;
  if (typeof tenantName === 'string' && tenantName.length > 0) {
    return tenantNamespace(tenantName);
  }

  throw new Error(
    'Tenant namespace missing. Reload the page and choose a display name.'
  );
}

export function getTenantNameFromContext(ctx: ToolContext): string {
  const tenantName =
    ctx.session.auth.current?.attributes.tenantName ??
    ctx.session.auth.initiator?.attributes.tenantName;

  if (typeof tenantName === 'string' && tenantName.length > 0) {
    return tenantName;
  }

  throw new Error(
    'Tenant name missing. Reload the page and choose a display name.'
  );
}
