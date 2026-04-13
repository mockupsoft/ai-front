"use client";

import type { User } from "@/lib/deepsite/deepsite-v2-types";

const localUser: User = {
  id: "local",
  name: "local",
  fullname: "Local User",
  avatarUrl: "",
  isPro: false,
  isLocalUse: true,
};

/** Simplified user hook for DeepSite v2 (no HF auth). */
export function useUser() {
  return {
    user: localUser,
    errCode: null as number | null,
    loading: false,
    logout: () => {
      if (typeof window !== "undefined") window.location.reload();
    },
  };
}
