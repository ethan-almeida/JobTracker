export interface Job {
  id: number;
  company: string;
  title: string;
  location: string;
  status: string;
  job_id: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const STATUS_OPTIONS = [
  "Saved",
  "Applied",
  "Phone Screen",
  "Interviewing",
  "Offer",
  "Accepted",
  "Rejected",
  "Declined",
] as const;

export const STATUS_COLORS: Record<string, string> = {
  Saved: "bg-gray-100 text-gray-800",
  Applied: "bg-blue-100 text-blue-800",
  "Phone Screen": "bg-indigo-100 text-indigo-800",
  Interviewing: "bg-yellow-100 text-yellow-800",
  Offer: "bg-green-100 text-green-800",
  Accepted: "bg-teal-100 text-teal-800",
  Rejected: "bg-red-100 text-red-800",
  Declined: "bg-orange-100 text-orange-800",
};

export type FormData = {
  company: string;
  title: string;
  location: string;
  status: string;
  job_id: string;
  notes: string;
};