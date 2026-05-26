
-- Restrict SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Replace permissive contact insert policy with validated one
DROP POLICY "anyone can submit contact" ON public.contact_messages;
CREATE POLICY "anyone can submit contact" ON public.contact_messages
  FOR INSERT
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND char_length(phone) BETWEEN 5 AND 20
    AND char_length(message) BETWEEN 1 AND 2000
  );
