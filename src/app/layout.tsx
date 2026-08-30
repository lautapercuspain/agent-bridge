import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { WebMCPProvider } from "@/components/webmcp/WebMCPProvider";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "AgentBridge — Agent-Native Commerce",
	description:
		"Talk to an AI agent to order food. AgentBridge exposes commerce capabilities to agents through the WebMCP protocol.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				<Providers>
					<WebMCPProvider>{children}</WebMCPProvider>
				</Providers>
			</body>
		</html>
	);
}
