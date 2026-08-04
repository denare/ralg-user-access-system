ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AccessRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RequestSystem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Approval" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public."User" FROM anon, authenticated;
REVOKE ALL ON TABLE public."AccessRequest" FROM anon, authenticated;
REVOKE ALL ON TABLE public."RequestSystem" FROM anon, authenticated;
REVOKE ALL ON TABLE public."Approval" FROM anon, authenticated;
