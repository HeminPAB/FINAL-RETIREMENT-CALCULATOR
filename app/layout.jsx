import './globals.css';

export const metadata = {
  title: 'RetireSmart - Retirement Calculator',
  description: 'A comprehensive retirement planning calculator with detailed projections and scenario analysis.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 