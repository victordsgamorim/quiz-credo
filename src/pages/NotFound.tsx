import { useEffect } from "react";

import { useLocation } from "react-router-dom";

import { useLocale } from "@/contexts/LocaleContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLocale();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-safe">
      <div className="glass-card w-full max-w-sm p-8 text-center">
        <h1 className="mb-3 text-5xl font-bold gold-text">404</h1>
        <p className="mb-6 text-muted-foreground">{t.common.pageNotFound}</p>
        <a
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {t.common.backHome}
        </a>
      </div>
    </main>
  );
};

export default NotFound;
