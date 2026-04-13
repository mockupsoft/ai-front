"use client";

import { createContext } from "react";
import { User } from "@/lib/deepsite/deepsite-v2-types";

export const UserContext = createContext({
  user: undefined as User | undefined,
});
