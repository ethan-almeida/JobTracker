import type { Job } from "../types";
import { STATUS_COLORS } from "../types";

interface Props {
  job: Job;
  selected: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function JobCard({
  job,
  selected,
  onClick,
  onEdit,
  onDelete,
}: Props) {
  const dateStr = new Date(job.created_at + "Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
        selected
          ? "border-indigo-300 bg-indigo-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {job.company}
          </h3>
          <p className="text-sm text-gray-600 truncate">{job.title}</p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-800"
              }`}
            >
              {job.status}
            </span>
            <span className="text-xs text-gray-400">{dateStr}</span>
          </div>
        </div>
        <div
          className="flex gap-1 ml-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-indigo-600 text-sm px-1"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this job?")) onDelete();
            }}
            className="text-gray-400 hover:text-red-600 text-sm px-1"
          >
            Del
          </button>
        </div>
      </div>
    </div>
  );
}