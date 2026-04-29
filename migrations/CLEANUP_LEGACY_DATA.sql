-- ==============================================================================
-- CLEANUP SCRIPT: DELETE LEGACY/ORPHAN DATA
-- ==============================================================================
-- 🚨 WARNING: THIS WILL DELETE DATA.
-- Use this if you want to REMOVE old users that are incompatible with the new system.
-- ==============================================================================

-- 1. Count before deletion (just for log)
DO $$
DECLARE
    count_orphans INT;
BEGIN
    SELECT count(*) INTO count_orphans FROM public.profiles WHERE organization_id IS NULL;
    RAISE NOTICE 'Found % orphan profiles to delete.', count_orphans;
END $$;

-- 2. Delete Orphan Profiles (Users without Organization)
DELETE FROM public.profiles
WHERE organization_id IS NULL;

-- 3. (Optional) Delete Orphan Organizations (if any exist without name/owner - unusual but safe check)
-- DELETE FROM public.organizations WHERE id NOT IN (SELECT DISTINCT organization_id FROM public.profiles);

-- 4. Verify
DO $$
DECLARE
    remaining INT;
BEGIN
    SELECT count(*) INTO remaining FROM public.profiles WHERE organization_id IS NULL;
    IF remaining = 0 THEN
        RAISE NOTICE '✅ Cleanup successful. All profiles have an Organization.';
    ELSE
        RAISE NOTICE '⚠️ Something went wrong. % orphans remaining.', remaining;
    END IF;
END $$;
