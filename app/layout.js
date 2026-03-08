import "./globals.css";

export const metadata = {
  title: "CSV Reviewer",
  description: "Review and categorise CSV entries with clarity",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
