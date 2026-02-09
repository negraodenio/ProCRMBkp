import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * CRITICAL: Organization-Scoped Service Role Client
 *
 * This wrapper ensures that ALL database operations using the service role
 * are automatically scoped to a specific organization, preventing data leakage.
 *
 * WHY: Service role bypasses RLS, so we must enforce org filtering at the code level.
 *
 * Usage:
 * ```
 * const client = createOrgScopedServiceClient(orgId);
 * const contacts = await client.from('contacts').select('*'); // Auto-filtered!
 * ```
 */

// Tables that have organization_id column
const ORG_SCOPED_TABLES = new Set([
    'contacts',
    'deals',
    'pipelines',
    'conversations',
    'messages',
    'documents',
    'proposals',
    'automation_rules',
    'marketing_strategies',
    'ai_operations',
    'proposal_templates',
    'webhook_logs'
]);

export function createOrgScopedServiceClient(organizationId: string): SupabaseClient {
    if (!organizationId) {
        throw new Error('organizationId is required for scoped service client');
    }

    const baseClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() { return [] },
                setAll() {}
            }
        }
    );

    // Wrap the 'from' method to auto-inject organization_id filter
    const originalFrom = baseClient.from.bind(baseClient);

    (baseClient as any).from = function(table: string) {
        const query = originalFrom(table);

        // If table has organization_id, auto-filter
        if (ORG_SCOPED_TABLES.has(table)) {
            console.log(`[OrgScopedClient] Auto-filtering ${table} by org: ${organizationId}`);
            // Return the query with eq already applied
            return (query as any).eq('organization_id', organizationId);
        }

        // For non-org tables (e.g., profiles where we look up by id), pass through
        return query;
    };

    return baseClient;
}

/**
 * Standard Service Role Client (NOT scoped)
 *
 * ⚠️ USE WITH EXTREME CAUTION!
 * This bypasses ALL RLS policies.
 *
 * Only use when:
 * - Creating new organizations
 * - Admin operations that span multiple orgs
 * - Stripe webhooks (updates credits)
 *
 * For everything else, use createOrgScopedServiceClient()
 */
export function createServiceRoleClient(): SupabaseClient {
    console.warn('[ServiceRoleClient] Using UNSCOPED service role - ensure proper validation!');

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() { return [] },
                setAll() {}
            }
        }
    );
}
