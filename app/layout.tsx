import './globals.css'

export const metadata = {
  title: 'Kasir Warung',
  description: 'Aplikasi Kasir & Stok Warung',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}