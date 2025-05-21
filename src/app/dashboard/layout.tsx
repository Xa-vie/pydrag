import FlowSidebarContent from '@/components/codeflow/flow-sidebar-content';
import KBar from '@/components/kbar';
import {
  SidebarProvider,
  Sidebar as ShadcnSidebar,
  SidebarInset,
  SidebarTrigger
} from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { CodeFlow } from '@/components/codeflow/code-flow';
import FlowTabs from '@/components/flow-tabs';
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

    <SidebarProvider defaultOpen={defaultOpen} suppressHydrationWarning>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col h-full min-h-0">
      {/* Header */}
          {/* <header className="h-14 flex-shrink-0 bg-background z-10"> */}
            <FlowTabs />
          {/* </header> */}
          {/* Main Content */}
          <main className="flex-1 min-h-0 overflow-auto">
            <KBar>
              {children}
            </KBar>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
