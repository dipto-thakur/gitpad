// file: components/EditorActionsMenu.tsx
'use client';

import { useState } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Row } from '@/components/ui/row';
import { Button } from '@/components/ui/button';
import { DeleteFileButton } from '@/components/DeleteFileButton';
import { RenameFileButton } from '@/components/RenameFileButton';

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
          <DrawerHeader>
            <DrawerTitle>{path}</DrawerTitle>
          </DrawerHeader>
          <ul className="pb-2">
            <li>
              <Row
                icon={<Pencil />}
                label="Rename"
                onClick={() => {
                  setMenuOpen(false);
                  setRenameOpen(true);
                }}
              />
            </li>
            <li>
              <Row
                icon={<Trash2 />}
                label="Delete file"
                destructive
                onClick={() => {
                  setMenuOpen(false);
                  setDeleteOpen(true);
                }}
              />
            </li>
          </ul>
        </DrawerContent>
      </Drawer>

      <RenameFileButton owner={owner} repo={repo} branch={branch} path={path} open={renameOpen} onOpenChange={setRenameOpen} />
      <DeleteFileButton owner={owner} repo={repo} branch={branch} path={path} sha={sha} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}