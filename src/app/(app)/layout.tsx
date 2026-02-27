import RootLayoutClient from "@/app/root-layout-client"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <RootLayoutClient>{children}</RootLayoutClient>
}
