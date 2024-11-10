import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { Logo } from "~/app/_components/Logo";

export const metadata: Metadata = {
  title: "Tiny Desk Info",
  description: "Explore the NPR Tiny Desk Concerns",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <main className="flex min-h-screen flex-col items-center bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_80%,rgba(128,128,128,0.3),rgba(255,255,255,0))]">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
              <h1 className="flex items-center gap-2 text-5xl font-extrabold tracking-tight sm:text-[5rem]">
                <Logo />
                <div>tiny desk concerts</div>
              </h1>
              <div className="container">{children}</div>
            </div>
          </main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
