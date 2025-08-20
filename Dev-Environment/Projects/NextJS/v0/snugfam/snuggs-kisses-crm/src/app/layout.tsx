import "@/styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
	title: "Snuggs & Kisses CRM",
	description: "Snug Fam – HIPAA-conscious healthcare staffing platform"
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-white text-gray-900">
				{children}
			</body>
		</html>
	);
}



