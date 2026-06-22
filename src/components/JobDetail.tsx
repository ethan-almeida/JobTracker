import type { Job } from "../types";
import { STATUS_COLORS, STATUS_OPTIONS } from "../types";

interface Props {
  job: Job;
  onEdit: () => void;
  onDelete: () => void;
}

export default function JobDetail({ job, onEdit, onDelete }: Props) {
  const created = new Date(job.created_at + "Z").toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const updated = new Date(job.updated_at + "Z").toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{job.company}</h2>
          <p className="text-gray-600">{job.title}</p>
        </div>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-800"
          }`}
        >
          {job.status}
        </span>
      </div>

      <div className="space-y-3 text-sm">
        {job.location && (
          <div>
            <span className="font-medium text-gray-500">Location:</span>{" "}
            <span className="text-gray-900">{job.location}</span>
          </div>
        )}
        {job.job_id && (
          <div>
            <span className="font-medium text-gray-500">Job ID:</span>{" "}
            <span className="text-gray-900">{job.job_id}</span>
          </div>
        )}
        {job.notes && (
          <div>
            <span className="font-medium text-gray-500">Notes:</span>
            <p className="text-gray-900 mt-1 whitespace-pre-wrap">
              {job.notes}
            </p>
          </div>
        )}

        <div className="border-t border-gray-100 pt-3 mt-4 space-y-1 text-xs text-gray-400">
          <div>Created: {created}</div>
          <div>Updated: {updated}</div>
        </div>
      </div>

      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onEdit}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Edit
        </button>
        <button
          onClick={() => {
            if (confirm("Delete this job?")) onDelete();
          }}
          className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
        >
          Delete
        </button>
      </div>

      {/* Placeholder for Phase 3 */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          Attachments
        </h3>
        <p className="text-xs text-gray-400">
          Document management coming in the next update.
        </p>
      </div>
    </div>
  );
}