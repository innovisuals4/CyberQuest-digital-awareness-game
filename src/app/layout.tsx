import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/lib/GameContext";
import CyberMentor from "@/components/CyberMentor";
import SignalBackdrop from "@/components/SignalBackdrop";
import MotionProvider from "@/components/MotionProvider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "CyberQuest: The Digital Awareness Challenge",
  description:
    "Fifteen interactive cybersecurity missions. Read the signal, break the scam, and level up your digital intelligence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SignalBackdrop />
        <MotionProvider>
          <GameProvider>
            {children}
            <CyberMentor />
          </GameProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
