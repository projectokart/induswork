import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, useRouter, useRouterState } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { FloatingQuoteCTA } from "@/components/site/FloatingQuoteCTA";
import { BottomTabBar } from "@/components/site/BottomTabBar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-extrabold text-navy">404</h1>
        <p className="mt-4 text-muted-foreground">This page doesn't exist.</p>
        <a href="/" className="mt-6 inline-block bg-gold text-white px-5 py-2 rounded-lg font-bold">Go home</a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  console.error(error);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-5 bg-gold text-white px-5 py-2 rounded-lg font-bold">Try again</button>
      </div>
    </div>
  );
}

function Layout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const noChrome = path === "/login" || path === "/joinus";
  return (
    <div className="min-h-screen flex flex-col">
      {!noChrome && <Navbar />}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      {!noChrome && <Footer />}
      {!noChrome && <FloatingQuoteCTA />}
      {!noChrome && <BottomTabBar />}
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Layout />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
