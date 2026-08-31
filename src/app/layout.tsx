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
	title: "AgentBridge — Agent-Native Food Delivery",
	description:
		"AgentBridge is an agent-native food ordering marketplace. AI agents browse, build a cart, and check out for you through WebMCP tools.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col bg-cream font-sans text-ink">
				<Providers>
					<WebMCPProvider>{children}</WebMCPProvider>
				</Providers>
			</body>
		</html>
	);
}
