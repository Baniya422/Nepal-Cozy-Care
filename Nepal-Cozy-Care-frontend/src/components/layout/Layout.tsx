import { createContext, Suspense, useContext } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children?: React.ReactNode;
}

const LayoutContext = createContext(false);

export default function Layout({ children }: LayoutProps) {
  // Older pages still use <Layout> locally. When they are rendered inside the
  // route-level layout, return only their content so the persistent navbar and
  // footer are not duplicated.
  if (useContext(LayoutContext)) {
    return <>{children}</>;
  }

  return (
    <LayoutContext.Provider value>
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
