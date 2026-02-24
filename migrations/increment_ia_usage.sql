-- Function to safely increment IA tools usage
CREATE OR REPLACE FUNCTION increment_ia_usage(org_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE organizations
  SET ia_tools_used_month = COALESCE(ia_tools_used_month, 0) + 1,
      updated_at = now()
  WHERE id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
