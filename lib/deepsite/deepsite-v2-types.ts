/** Types for deepsite-v2 editor (fork compatibility). */

export interface User {
  fullname: string;
  avatarUrl: string;
  name: string;
  isLocalUse?: boolean;
  isPro: boolean;
  id: string;
  token?: string;
}

export interface HtmlHistory {
  html: string;
  createdAt: Date;
  prompt: string;
}

export interface Project {
  id?: string;          // DB proje ID'si — AI üretimi ve Docker preview için kritik
  title: string;
  html: string;
  prompts: string[];
  user_id: string;
  space_id: string;
  _id?: string;
  _updatedAt?: Date;
  _createdAt?: Date;
}
