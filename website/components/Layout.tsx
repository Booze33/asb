import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => (
  <>
    <Header />
    <main className="pt-20">{children}</main>
    <Footer />
  </>
);

export default Layout;
