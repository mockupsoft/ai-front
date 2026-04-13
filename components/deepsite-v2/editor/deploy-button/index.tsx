/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MdSave } from "react-icons/md";
import { Rocket } from "lucide-react";

import Loading from "@/components/deepsite-v2/loading";
import { Button } from "@/components/deepsite-v2/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/deepsite-v2/ui/popover";
import { Input } from "@/components/deepsite-v2/ui/input";
import { api } from "@/lib/deepsite/axios-api";

export function DeployButton({
  html,
  prompts,
}: {
  html: string;
  prompts: string[];
}) {
  const router = useRouter();
    const [loading, setLoading] = useState(false);

  const [config, setConfig] = useState({
    title: "",
  });

  const createSpace = async () => {
    if (!config.title) {
      toast.error("Please enter a title for your space.");
      return;
    }
    setLoading(true);

    try {
      const res = await api.post("/me/projects", {
        title: config.title,
        html,
        prompts,
      });
      if (res.data.ok) {
        router.push(`/projects/${res.data.path}?deploy=true`);
      } else {
        toast.error(res?.data?.error || "Failed to create space");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // TODO add a way to do not allow people to deploy if the html is broken.

  return (
    <div className="flex items-center justify-end gap-5">
      <div className="relative flex items-center justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <div>
              <Button variant="default" className="max-lg:hidden !px-4">
                <MdSave className="size-4" />
                Save your Project
              </Button>
              <Button variant="default" size="sm" className="lg:hidden">
                Deploy
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="!rounded-2xl !p-0 !bg-white !border-neutral-200 min-w-xs text-center overflow-hidden"
            align="end"
          >
            <header className="bg-neutral-50 p-6 border-b border-neutral-200/60">
              <div className="flex items-center justify-center -space-x-4 mb-3">
                <div className="size-9 rounded-full bg-amber-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
                  🚀
                </div>
                <div className="size-11 rounded-full bg-red-200 shadow-2xl flex items-center justify-center z-2">
                  <Image
                    src="/deepsite/space.svg"
                    alt="Space Icon"
                    width={28}
                    height={28}
                    className="size-7"
                  />
                </div>
                <div className="size-9 rounded-full bg-sky-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
                  👻
                </div>
              </div>
              <p className="text-xl font-semibold text-neutral-950">
                Deploy as Space!
              </p>
              <p className="text-sm text-neutral-500 mt-1.5">
                Save and Deploy your project to a Space on the Hub. Spaces are
                a way to share your project with the world.
              </p>
            </header>
            <main className="space-y-4 p-6">
              <div>
                <p className="text-sm text-neutral-700 mb-2">
                  Choose a title for your space:
                </p>
                <Input
                  type="text"
                  placeholder="My Awesome Website"
                  value={config.title}
                  onChange={(e) =>
                    setConfig({ ...config, title: e.target.value })
                  }
                  className="!bg-white !border-neutral-300 !text-neutral-800 !placeholder:text-neutral-400 selection:!bg-blue-100"
                />
              </div>
              <div>
                <p className="text-sm text-neutral-700 mb-2">
                  Then, let&apos;s deploy it!
                </p>
                <Button
                  variant="black"
                  onClick={createSpace}
                  className="relative w-full"
                  disabled={loading}
                >
                  Deploy Space <Rocket className="size-4" />
                  {loading && (
                    <Loading className="ml-2 size-4 animate-spin" />
                  )}
                </Button>
              </div>
            </main>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
