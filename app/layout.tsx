import "./globals.css";
import AuthListener from "@/app/api/auth/verification/authUtils";
import SessionListener from "@/app/api/auth/verification/SessionListener";
import UserIdProvider from "./provider/UserIdProvider";
import LayoutShell from "@/app/components/LayoutShell";

// --- Metadata ---
export const metadata = {
  title: "BorNEO AI",
  description:
    "BorNEO AI is a lightweight, AI-driven disaster resilience platform that built with a 'low-bandwidth' philosophy. Our mission is to provide a critical lifeline for communities in Borneo, ensuring every user has access to life-saving information when it matters most.",
};

// --- Root Layout (Home) ---
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Import Google Manrope font for headings and UI elements and Google Material Symbols font for icons. */}
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&amp;display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>

      <body className="antialiased">
        <UserIdProvider>
          <AuthListener />
          <SessionListener />
          <LayoutShell>{children}</LayoutShell>
        </UserIdProvider>
      </body>
    </html>
  );
}
