import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Loader2, X } from "lucide-react";

import { Button } from "./ui/button";

const createTitleSchema = z.object({
  name: z.string().min(3, { message: "Minimum 3 characters." }),
});

type TitleSchemaProps = z.infer<typeof createTitleSchema>;

export function CreateTitleForm() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, reset, formState } =
    useForm<TitleSchemaProps>({
      resolver: zodResolver(createTitleSchema),
    });

  function getSlugFromString(input: string) {
    return input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "-");
  }

  const slug = watch("name") ? getSlugFromString(watch("name")) : "";

  const { mutateAsync } = useMutation({
    mutationFn: async ({ name }: TitleSchemaProps) => {
      // Adiciona um delay 2s
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await fetch("http://localhost:3333/titles", {
        method: "POST",
        body: JSON.stringify({
          name,
          slug,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-titles"],
      });
    },
  });

  async function createTitle({ name }: TitleSchemaProps) {
    await mutateAsync({ name });

    reset();
  }

  return (
    <form onSubmit={handleSubmit(createTitle)} className="w-full space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium block" htmlFor="name">
          Titilo
        </label>

        <input
          {...register("name")}
          className="border border-zinc-800 rounded-lg px-3 py-2.5 bg-zinc-800/50 w-full text-sm"
          id="name"
          type="text"
        />
        {formState.errors?.name && (
          <p className="">{formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium block" htmlFor="slug">
          Slug
        </label>

        <input
          className="border border-zinc-800 rounded-lg px-3 py-2.5 bg-zinc-800/50 w-full text-sm"
          id="slug"
          type="text"
          value={slug}
          readOnly
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Dialog.Close asChild>
          <Button>
            <X className="size-3" />
            Cancel
          </Button>
        </Dialog.Close>
        <Button
          disabled={formState.isSubmitting}
          className="bg-teal-400 text-teal-950"
          type="submit"
        >
          {formState.isSubmitting ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Check className="size-3" />
          )}
          Salve
        </Button>
      </div>
    </form>
  );
}
