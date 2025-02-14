import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from 'next';
import { Inter, Roboto } from 'next/font/google';
import React from "react";
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const roboto = Roboto({
    weight: ['400', '500', '700', '900'],
    subsets: ['latin']
});

export const metadata: Metadata = {
    title: "MAILBOX",
    description: 'Mailbox fir using on development',
};

export default function RootLayout(
    {
        children,
    }: {
        children: React.ReactNode;
    }) {
    return (
        <html lang="en">
            <body className={roboto.className}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
