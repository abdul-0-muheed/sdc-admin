// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../../componets/navbar";
import { AuthProvider } from "../../componets/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "College Portal",
  description: "College Management Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-white`}
      >
        <AuthProvider>
          <Navbar />
          <div className="pt-20 md:pt-16">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}