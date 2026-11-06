import type { ReactNode } from "react";

export const metadata = {
  title: "De la reforma a la nómina",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
