"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type VideoRow } from "~/lib/videos";
import Link from "next/link";
import { DataTableColumnHeader } from "~/app/_components/DataTableColumnHeader";
import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/app/_components/ui/dropdown-menu";

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const columns: ColumnDef<VideoRow>[] = [
  {
    accessorKey: "id",
  },
  {
    accessorKey: "description",
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const videoId: string = row.getValue("id");
      return (
        <Link
          href={`https://youtube.com/watch?v=${videoId}`}
          target="_blank"
          className="font-bold"
        >
          {row.getValue("title")}
        </Link>
      );
    },
  },
  {
    header: "Description",
    cell: ({ row }) => {
      return row.getCanExpand() ? (
        <button
          onClick={row.getToggleExpandedHandler()}
          className="flex cursor-pointer items-center"
        >
          {row.getIsExpanded() ? (
            <>
              <ChevronDown size={16} />
              <span>Hide</span>
            </>
          ) : (
            <>
              <ChevronRight size={16} />
              <span>Show</span>
            </>
          )}
        </button>
      ) : (
        ""
      );
    },
  },
  {
    accessorKey: "viewCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Views" />
    ),
  },
  {
    accessorKey: "duration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration (s)" />
    ),
  },
  {
    accessorKey: "publishedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Published" />
    ),
    cell: ({ row }) => formatDate(row.getValue("publishedAt")),
  },
  {
    id: "actions",
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Coming Soon...</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
