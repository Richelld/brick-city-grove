import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import ForestGuide from "./components/ForestGuide";
import InlineScript from "./components/InlineScript";
import SiteHeader from "./components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brick City Grove",
  description: "Discover and support local Newark businesses, events, and jobs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning // the script below may change data-theme before React loads
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        {/* Apply the saved theme before the page paints, so it doesn't flash light then dark. */}
        <InlineScript
          html={`(function(){try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
        <ForestGuide />
      </body>
    </html>
  );
}
