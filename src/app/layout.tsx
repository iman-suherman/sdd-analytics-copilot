import type { Metadata } from "next";
import { Fraunces, Source_Sans_3, Geist_Mono } from "next/font/google";
import { CompanyProvider } from "@/components/company/CompanyProvider";
import { CopilotDock } from "@/components/copilot/CopilotDock";
import { CopilotProvider } from "@/components/copilot/CopilotProvider";
import { AppNav } from "@/components/layout/AppNav";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SDD Analitik Kopilot",
  description:
    "Demo SaaS analitik AI berbasis spesifikasi dengan agen bergaya Kopilot, kueri SQLite terkendali, metrik semantik, dan dasbor multi-tenant — pasar Indonesia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}>
        <CompanyProvider>
          <CopilotProvider>
            <AppNav />
            <main>{children}</main>
            <CopilotDock />
          </CopilotProvider>
        </CompanyProvider>
      </body>
    </html>
  );
}
