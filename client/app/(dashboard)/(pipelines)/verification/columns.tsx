"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteExtraction } from "@/lib/client-requests";
import { cn } from "@/lib/utils";
import { Status } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, RefreshCw, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type Extraction = {
  id: string;
  filename: string;
  createdAt: Date;
  updatedAt: Date;
};

export const columns: ColumnDef<Extraction>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <div
        className="w-36 2xl:w-full truncate overflow-hidden text-slate-900"
        title={row.getValue("id")}
      >
        {row.getValue("id")}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "filename",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="File name" />
    ),
    cell: ({ row }) => (
      <div
        title={row.getValue("filename")}
        className="w-36 2xl:w-full 2xl:max-w-3xl truncate overflow-hidden text-slate-900"
      >
        {row.getValue("filename")}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creation Date" />
    ),
    cell: ({ row }) => (
      <div className="w-36 text-slate-900">
        {row.getValue<Date>("createdAt").toLocaleDateString("en-US")}
      </div>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
    cell: ({ row }) => (
      <div className="w-36 text-slate-900">
        {row.getValue<Date>("updatedAt").toLocaleDateString("en-US")}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ table, row }) => {
      const router = useRouter();

      return (
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={"ghost"}
                className="flex h-8 w-8 p-0 data-[state=open]:bg-slate-100"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem>
                <Link
                  href={`/verification/${row.original.id}`}
                  className="flex items-center w-full"
                >
                  <RefreshCw className="mr-2 h-3.5 w-3.5 text-slate-900/70" />
                  Process
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <AlertDialogTrigger asChild>
                  <div className="flex items-center w-full">
                    <Trash className="mr-2 h-3.5 w-3.5 text-slate-900/70" />
                    Delete
                  </div>
                </AlertDialogTrigger>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Extraction in Pipeline</AlertDialogTitle>
              <AlertDialogDescription className="pt-4">
                Are you sure? This will permanently delete the current
                extraction and remove the associated file. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await deleteExtraction(row.original.id);
                  router.refresh();
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
];