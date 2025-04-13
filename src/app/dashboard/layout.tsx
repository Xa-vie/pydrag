import KBar from '@/components/kbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Py-Drag',
  description: 'Py-Drag is a tool that allows you to create and edit Python code using a drag and drop interface.'
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  // const cookieStore = await cookies();
  // const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';
  return (
    <KBar>
      {/* <SidebarProvider defaultOpen={defaultOpen}> */}
        {/* <AppSidebar /> */}
        {/* <SidebarInset> */}
          {/* <Header /> */}
          {/* page main content */}
          {children}
          {/* page main content ends */}
        {/* </SidebarInset> */}
      {/* </SidebarProvider> */}
    </KBar>
  );
}
