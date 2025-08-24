// src/app/w/[id]/workspace-context.tsx
'use client';

import React, { createContext, useContext } from 'react';
import type { Role } from '@prisma/client';

type Ctx = { workspaceId: string; role: Role };
const WorkspaceCtx = createContext<Ctx | null>(null);

export function WorkspaceProvider({ value, children }: { value: Ctx; children: React.ReactNode }) {
  return <WorkspaceCtx.Provider value={value}>{children}</WorkspaceCtx.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceCtx);
  if (!ctx) throw new Error('useWorkspace must be used within <WorkspaceProvider>');
  return ctx;
}
