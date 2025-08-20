import type { Metadata } from "next";
import {
  Merriweather as FontMerriweather,
  Lato as FontLato,
  Nunito_Sans as FontNunitoSans,
  Dancing_Script as FontDancingScript,
} from "next/font/google";
import "./globals.css";

const fontHeading = FontMerriweather({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const fontBody = FontLato({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const fontUI = FontNunitoSans({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const fontScript = FontDancingScript({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "SnugSquad",
  description: "Personalized home care made human.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Zoho Catalyst Embedded Auth SDK v4 */}
        <script
          src="https://catalyst-cdn.com/embedded-auth/v4/sdk.js"
          defer
        />
      </head>
      <body
        className={`${fontHeading.variable} ${fontBody.variable} ${fontUI.variable} ${fontScript.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
