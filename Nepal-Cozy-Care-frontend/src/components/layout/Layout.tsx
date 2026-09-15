import Navbar from "./Navbar";
import Footer from "./Footer";
interface LayoutProps {
  children: React.ReactNode;
}
export default function Layout({ children }: LayoutProps) {
  return (
    <div className="site-layout">
      <Navbar />
      <main className="site-main">{children}</main>
      <Footer />
    </div>
  );
}
