export interface DeepSitePage {
  path: string;
  html: string;
}

export interface DeepSiteFile {
  path: string;
  content: string;
  type?: string | null;
}

export interface DeepSiteCommit {
  id: string;
  title: string;
  message?: string | null;
  timestamp: string;
  author?: string | null;
}

export interface ChatHistoryPayload {
  items: unknown[];
  artifacts: unknown;
}

export interface DeepSiteProject {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  pages: DeepSitePage[];
  files: DeepSiteFile[];
  commits: DeepSiteCommit[];
  is_active: boolean;
  chat_history?: ChatHistoryPayload | null;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserMe {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
}
