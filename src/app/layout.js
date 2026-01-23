import { Inter, Poppins } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { ClientToaster } from "@/components/toaster";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Teletrace",
  description: "Teletrace made simple and efficient.",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "icon", url: "/favicon.png", type: "image/png" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png", sizes: "180x180" },
    { rel: "shortcut icon", url: "/favicon.ico" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <ClientToaster />
            <Navbar />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
