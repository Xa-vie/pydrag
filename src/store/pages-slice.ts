import { Node, Edge } from '@xyflow/react';
import { NodeData } from './use-flow-store';

// Page interface
export interface Page {
  id: string;
  name: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
  createdAt: Date;
  updatedAt: Date;
}

// State interface for the pages slice
interface PagesSlice {
  pages: Page[];
  currentPageId: string | null;
  createPage: (name: string) => string;
  deletePage: (id: string) => void;
  renamePage: (id: string, name: string) => void;
  setCurrentPage: (id: string) => void;
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
}

// Create the pages slice
export const createPagesSlice = (set: any, get: any): PagesSlice => {
  // Create a default page
  const defaultPage: Page = {
    id: crypto.randomUUID(),
    name: 'Main Flow',
    nodes: [],
    edges: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    // State
    pages: [defaultPage],
    currentPageId: defaultPage.id,

    // Actions
    createPage: (name: string) => {
      // Create a unique ID for the new page
      const newPageId = crypto.randomUUID();
      
      // First, save the current state to the current page
      const { nodes, edges, currentPageId } = get();
      
      if (currentPageId) {
        set((state: any) => ({
          pages: state.pages.map((page: Page) =>
            page.id === currentPageId 
              ? { 
                  ...page, 
                  nodes: nodes, 
                  edges: edges,
                  updatedAt: new Date() 
                } 
              : page
          ),
        }));
      }

      // Now create a new page with empty nodes and edges
      const newPage: Page = {
        id: newPageId,
        name,
        nodes: [], // Empty nodes array for new page
        edges: [], // Empty edges array for new page
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add the new page and set it as current
      set((state: any) => ({
        pages: [...state.pages, newPage],
        currentPageId: newPageId,
        nodes: [], // Reset nodes in the state
        edges: [], // Reset edges in the state
      }));

      return newPageId;
    },

    deletePage: (id: string) => {
      const { pages, currentPageId } = get();
      
      // Don't delete the last page
      if (pages.length <= 1) {
        return;
      }

      const filteredPages = pages.filter((page: Page) => page.id !== id);
      
      // If we're deleting the current page, switch to the first available page
      const newCurrentPageId = 
        id === currentPageId 
          ? filteredPages[0].id 
          : currentPageId;

      // If we need to switch pages, load that page's data
      if (id === currentPageId) {
        const targetPage = filteredPages.find((page: Page) => page.id === newCurrentPageId);
        
        set({
          pages: filteredPages,
          currentPageId: newCurrentPageId,
          nodes: targetPage?.nodes || [],
          edges: targetPage?.edges || [],
        });
      } else {
        // Just remove the page without changing the current view
        set({
          pages: filteredPages,
          currentPageId: newCurrentPageId,
        });
      }
    },

    renamePage: (id: string, name: string) => {
      set((state: any) => ({
        pages: state.pages.map((page: Page) =>
          page.id === id 
            ? { ...page, name, updatedAt: new Date() } 
            : page
        ),
      }));
    },

    setCurrentPage: (id: string) => {
      // Save current nodes and edges to the current page before switching
      const { nodes, edges, currentPageId, pages } = get();
      
      if (currentPageId) {
        set((state: any) => ({
          pages: state.pages.map((page: Page) =>
            page.id === currentPageId 
              ? { 
                  ...page, 
                  nodes: nodes, 
                  edges: edges,
                  updatedAt: new Date() 
                } 
              : page
          ),
        }));
      }

      // Find the page we're switching to
      const targetPage = pages.find((page: Page) => page.id === id);
      if (targetPage) {
        // Update the nodes and edges with the target page's data
        set({
          currentPageId: id,
          nodes: targetPage.nodes,
          edges: targetPage.edges,
        });
      }
    },

    // Set nodes for the current page
    setNodes: (nodes: Node<NodeData>[]) => {
      const { currentPageId } = get();
      
      set((state: any) => ({
        nodes,
        pages: state.pages.map((page: Page) =>
          page.id === currentPageId 
            ? { ...page, nodes, updatedAt: new Date() } 
            : page
        ),
      }));
    },

    // Set edges for the current page
    setEdges: (edges: Edge[]) => {
      const { currentPageId } = get();
      
      set((state: any) => ({
        edges,
        pages: state.pages.map((page: Page) =>
          page.id === currentPageId 
            ? { ...page, edges, updatedAt: new Date() } 
            : page
        ),
      }));
    },
  };
}; 