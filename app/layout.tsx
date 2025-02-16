import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import React from "react";
import './globals.css';

const roboto = Poppins({
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
