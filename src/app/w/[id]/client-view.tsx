// src/app/w/[id]/client-view.tsx
'use client';

import React from 'react';
import { useWorkspace } from './workspace-context';

export default function ClientView() {
  const { workspaceId, role } = useWorkspace();
  return (
    <div className="p-6 space-y-2">
      <h1 className="text-xl font-semibold">Workspace {workspaceId}</h1>
      <p>
        Your role here: <span className="font-mono">{role}</span>
      </p>
    </div>
  );
}
