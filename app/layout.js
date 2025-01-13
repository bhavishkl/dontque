import { Providers } from "./providers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from 'sonner';
import Header from './components/UserLayout/header';
import BottomBar from './components/UserLayout/bottombar';
import { ThemeProvider } from 'next-themes';
import Script from 'next/script';
import { SpeedInsights } from "@vercel/speed-insights/next";
import OfflineAlert from './components/OfflineAlert';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "dontq",
  description: "Revolutionizing queue management",
};


export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers session={session}>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 pb-16 sm:pb-0">
                {children}
              </main>
              <BottomBar />
            </div>
          </Providers>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'sm:w-auto w-[calc(100%-32px)] sm:min-w-[320px] sm:max-w-[420px] !py-2',
              style: {
                fontSize: '14px',
              },
            }}
            className="!top-[72px] sm:!top-20 !px-4"
            richColors
          />
          <OfflineAlert />
        </ThemeProvider>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        <SpeedInsights />
      </body>
    </html>
  );
}