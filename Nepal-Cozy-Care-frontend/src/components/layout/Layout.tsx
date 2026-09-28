import { createContext, Suspense, useContext } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children?: React.ReactNode;
}

declare global {
  interface Window {
    __COZYCARE_LAYOUT_CONTEXT__?: React.Context<boolean>;
  }
}

const LayoutContext: React.Context<boolean> =
  (typeof window !== "undefined" && window.__COZYCARE_LAYOUT_CONTEXT__) ||
  createContext(false);

if (typeof window !== "undefined") {
  window.__COZYCARE_LAYOUT_CONTEXT__ = LayoutContext;
}

export default function Layout({ children }: LayoutProps) {
  // Older pages still use <Layout> locally. When they are rendered inside the
  // route-level layout, return only their content so the persistent navbar and
  // footer are not duplicated.
  const isInsideLayout = useContext(LayoutContext);
  if (isInsideLayout) {
    return <>{children}</>;
  }

  return (
    <LayoutContext.Provider value={true}>
      <div className="site-layout">
        <Navbar />
        <main className="site-main">
          {children ?? (
            <Suspense fallback={<div className="route-loading">Loading page...</div>}>
              <Outlet />
            </Suspense>
          )}
        </main>
        <Footer />
      </div>
    </LayoutContext.Provider>
  );
}
