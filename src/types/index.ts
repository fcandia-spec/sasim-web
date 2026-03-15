export interface Video {
  id: string;
  title: string;
  desc: string;
  tag: string;
  emoji: string;
  yt: string;
  video_path: string;
  thumbnail_key: string;
  is_premium: boolean;
  dur: string;
  views: number;
}

export interface Post {
  id: string;
  text: string;
  tag: string;
  ts: number;
  likes: number;
}

export interface Curso {
  id: string;
  title: string;
  desc: string;
  tag: string;
  icon: string;
}

export interface Juego {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export interface Plan {
  name: string;
  price: string;
  period: string;
  savings?: string;
  features: string[];
  featured?: boolean;
  available: boolean;
}

export type Theme = 'dark' | 'light';
export type UserRole = 'visitor' | 'subscriber' | 'admin';
