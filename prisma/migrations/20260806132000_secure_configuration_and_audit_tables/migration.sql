ALTER TABLE public."Department" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SystemCatalog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public."Department" FROM anon, authenticated;
REVOKE ALL ON TABLE public."SystemCatalog" FROM anon, authenticated;
REVOKE ALL ON TABLE public."AuditLog" FROM anon, authenticated;
REVOKE ALL ON TABLE public."_prisma_migrations" FROM anon, authenticated;
