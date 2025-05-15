import FlowSidebarContent from '@/components/codeflow/flow-sidebar-content';
import KBar from '@/components/kbar';
import {
  SidebarProvider,
  Sidebar as ShadcnSidebar,
  SidebarInset,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { CodeFlow } from '@/components/codeflow/code-flow';

export const metadata: Metadata = {
  title: 'Py-Drag',
  description: 'Py-Drag is a tool that allows you to create and edit Python code using a drag and drop interface.'
};

// AppSidebar component
const AppSidebar = () => {
  return (
    <ShadcnSidebar
      side="left"
      variant="sidebar"
      collapsible="icon"
      className="bg-background/95 backdrop-blur-md border-r-2 border-r-border/80"
    >
      <FlowSidebarContent />
    </ShadcnSidebar>
  );
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';

  return (

    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        {/* <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">

        </header> */}
        <main className="flex-1">
          <KBar>
            {children}
          </KBar>

        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
