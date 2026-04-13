import type { Metadata } from "next";
import { Toaster } from "sonner";
import { DeepSiteAuthProvider } from "@/lib/deepsite/auth-context";

export const metadata: Metadata = {
  title: "DeepSite — AI Website Builder",
  description: "Build pages with AI (MGX / MetaGPT backend)",
};

export default function DeepSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DeepSiteAuthProvider>
      {children}
      <Toaster richColors position="top-center" />
    </DeepSiteAuthProvider>
  );
}
