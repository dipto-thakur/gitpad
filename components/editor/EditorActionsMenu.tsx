// file: components/EditorActionsMenu.tsx
'use client';

import { useState } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Row } from '@/components/ui/row';
import { Button } from '@/components/ui/button';
import { DeleteFileButton } from '@/components/options/DeleteFileButton';
import { RenameFileButton } from '@/components/options/RenameFileButton';

export function EditorActionsMenu({
  owner,
  repo,
  branch,
  path,
  sha,
}: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  sha: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fileName = path.split('/').pop() ?? path;
  const dirPath = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : null;

  return (
    <>
      <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="More actions"
          onClick={() => setMenuOpen(true)}
        >
          <MoreVertical className="h-[18px] w-[18px]" />
        </Button>
        <DrawerContent open={menuOpen}>
          <DrawerHeader className="gap-1">
            <DrawerTitle className="truncate font-mono text-[15px] font-medium tracking-tight">
              {fileName}
            </DrawerTitle>
            {dirPath && (
              <p className="truncate text-[13px] text-zinc-400 dark:text-zinc-500">
                {dirPath}
              </p>
            )}
          </DrawerHeader>

          <div className="flex flex-col gap-3 px-3 pb-3 pt-1">
            <Row
              icon={<Pencil className="h-[17px] w-[17px]" />}
              label="Rename"
              onClick={() => {
                setMenuOpen(false);
                setRenameOpen(true);
              }}
            />

            <div className="rounded-xl border border-red-200/70 bg-red-50/50 p-1 dark:border-red-900/40 dark:bg-red-950/20">
              <p className="px-2.5 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-red-400 dark:text-red-500/80">
                Danger zone
              </p>
              <Row
                icon={<Trash2 className="h-[17px] w-[17px]" />}
                label="Delete file"
                destructive
                onClick={() => {
                  setMenuOpen(false);
                  setDeleteOpen(true);
                }}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <RenameFileButton owner={owner} repo={repo} branch={branch} path={path} open={renameOpen} onOpenChange={setRenameOpen} />
      <DeleteFileButton
  owner={owner}
  repo={repo}
  branch={branch}
  path={path}
  sha={sha}
  open={deleteOpen}
  onOpenChange={setDeleteOpen}
  redirectAfterDelete
/>
    </>
  );
}