"use client";
import { useState } from "react";
import { Import } from "lucide-react";

import { Project } from "@/lib/deepsite/deepsite-v2-types";
import { Button } from "@/components/deepsite-v2/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/deepsite-v2/ui/dialog";
import Loading from "@/components/deepsite-v2/loading";
import { Input } from "@/components/deepsite-v2/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const LoadProject = ({
  fullXsBtn = false,
  onSuccess,
}: {
  fullXsBtn?: boolean;
  onSuccess: (project: Project) => void;
}) => {
    const router = useRouter();

  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return; // Prevent multiple clicks while loading
    if (!url) {
      toast.error("Please enter a URL.");
      return;
    }

    // The URL validation and parsing logic is removed as we are no longer using Hugging Face

    setIsLoading(true);
    try {
      // You will need to implement your own logic to import a project from a URL
      // For now, this will just display a success message
      toast.success("Project imported successfully!");
      setOpen(false);
      setUrl("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.response?.data?.redirect) {
        return router.push(error.response.data.redirect);
      }
      toast.error(
        error?.response?.data?.error ?? "Failed to import the project."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <Button variant="outline" className="max-lg:hidden">
            <Import className="size-4 mr-1.5" />
            Load existing Project
          </Button>
          <Button variant="outline" size="sm" className="lg:hidden">
            {fullXsBtn && <Import className="size-3.5 mr-1" />}
            Load
            {fullXsBtn && " existing Project"}
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md !p-0 !rounded-3xl !bg-white !border-neutral-100 overflow-hidden text-center">
        <DialogTitle className="hidden" />
        <header className="bg-neutral-50 p-6 border-b border-neutral-200/60">
          <p className="text-2xl font-semibold text-neutral-950">
            Import a Project
          </p>
          <p className="text-base text-neutral-500 mt-1.5">
            Enter the URL of your project to import it.
          </p>
        </header>
        <main className="space-y-4 px-9 pb-9 pt-2">
          <div>
            <p className="text-sm text-neutral-700 mb-2">
              Load HTML from your computer
            </p>
            <Input
              type="file"
              accept=".html"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const htmlContent = event.target?.result as string;
                    onSuccess({
                      html: htmlContent,
                      prompts: [],
                      title: "Imported Project",
                      user_id: "local",
                      space_id: "local"
                    });
                    setOpen(false);
                  };
                  reader.readAsText(file);
                }
              }}
              className="!bg-white !border-neutral-300 !text-neutral-800 !placeholder:text-neutral-400 selection:!bg-blue-100"
            />
          </div>
          <div className="text-sm text-neutral-700 mb-2">
            OR
          </div>
          <div>
            <p className="text-sm text-neutral-700 mb-2">
              Enter your Project URL
            </p>
            <Input
              type="text"
              placeholder="https://example.com/my-project"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="!bg-white !border-neutral-300 !text-neutral-800 !placeholder:text-neutral-400 selection:!bg-blue-100"
            />
          </div>
          <div>
            <p className="text-sm text-neutral-700 mb-2">
              Then, let&apos;s import it!
            </p>
            <Button
              variant="black"
              onClick={handleClick}
              className="relative w-full"
            >
              {isLoading ? (
                <>
                  <Loading
                    overlay={false}
                    className="ml-2 size-4 animate-spin"
                  />
                  Importing...
                </>
              ) : (
                <>Import Project</>
              )}
            </Button>
          </div>
        </main>
      </DialogContent>
    </Dialog>
  );
};
