import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Search, Filter, Plus } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

import { Pagination } from "./components/pagination";

import { Button } from "./components/ui/button";
import { Control, Input } from "./components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { CreateTitleForm } from "./components/create-title-form";

interface Title {
  id: string;
  name: string;
  slug: string;
}

interface TitleResponse {
  first: number;
  prev: number | null;
  next: number;
  last: number;
  pages: number;
  items: number;
  data: Title[];
}

export function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  const urlFilter = searchParams.get("filter") ?? "";
  const [filter, setFilter] = useState(urlFilter);

  const { data: titlesResponse, isLoading } = useQuery<TitleResponse>({
    queryKey: ["get-titles", urlFilter, page],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3333/titles?_page=${page}&_per_page=10&name=${urlFilter}`
      );

      const data = await response.json();

      // Adiciona um delay 2s
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return data;
    },
    placeholderData: keepPreviousData,
  });

  function handleFilter() {
    setSearchParams((params) => {
      params.set("page", "1");
      params.set("filter", filter);

      return params;
    });
  }

  if (isLoading) {
    return null;
  }

  return (
    <div className="py-10 space-y-8">
      <main className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Title To Slug</h1>

          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button variant="primary">
                <Plus className="size-3" />
                Create new
              </Button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/70" />
              <Dialog.Content className="fixed p-10 space-y-10 right-0 top-0 h-screen min-w-[328px] z-10 bg-zinc-950 border-l border-zinc-900">
                <div className="space-y-3">
                  <Dialog.Title className="text-xl font-bold">
                    Create title
                  </Dialog.Title>

                  <Dialog.Description className="text-sm text-zinc-500">
                    Titles can be used to group videos about similar concepts.
                  </Dialog.Description>
                </div>

                <CreateTitleForm />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-1 items-center">
            <Input variant="filter">
              <Search className="size-3" />

              <Control
                placeholder="Search titles..."
                onChange={(e) => setFilter(e.target.value)}
                value={filter}
              />
            </Input>

            <Button onClick={handleFilter}>
              <Filter className="size-3" />
              Filter
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>

              <TableHead>Slug</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {titlesResponse?.data.map(({ id, name, slug }: Title) => {
              return (
                <TableRow key={id}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{name}</span>

                      <span className="text-xs text-zinc-500">{id}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-zinc-300">{slug}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {titlesResponse && (
          <Pagination
            pages={titlesResponse.pages}
            items={titlesResponse.items}
            page={page}
          />
        )}
      </main>
    </div>
  );
}
