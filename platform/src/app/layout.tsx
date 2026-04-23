export const metadata = {
  title: 'Chess Video Generator',
  description: 'Generate TikTok videos from Chess.com games',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
