export interface VideoWithRating {
  id: string;
  title: string;
  driveFileId: string;
  sourceUrl: string;
  storageType: string;
  uploaderName: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  avgRating: number | null;
  totalVotes: number;
  userRating: number | null;
}

export interface LeaderboardEntry {
  id: string;
  title: string;
  driveFileId: string;
  uploaderName: string | null;
  avgRating: number;
  totalVotes: number;
  rank: number;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: Date;
}
