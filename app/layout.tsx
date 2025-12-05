import { Recursive } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/components/react-query-provider";
import { constructMetadata } from "@/lib/utils";

const recursive = Recursive({ subsets: ["latin"] });

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={recursive.className}>
        <Navbar />

        <main className="flex flex-col min-h-[calc(100vh-3.5rem-1px)]">
          <div className="flex-1 flex flex-col h-full">
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </div>
          <Footer />
        </main>

        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
