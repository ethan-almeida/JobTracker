import { useState, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import type { Job, Document } from "../types";
import { STATUS_COLORS, DOCUMENT_TYPES } from "../types";
import {
  getDocuments,
  attachDocument,
  deleteDocument,
  openDocument,
} from "../api";

interface Props {
  job: Job;
  onEdit: () => void;
  onDelete: () => void;
}

export default function JobDetail({ job, onEdit, onDelete }: Props) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [showAttach, setShowAttach] = useState(false);
  const [attachType, setAttachType] = useState<string>("Resume");
  const [attaching, setAttaching] = useState(false);

  const fetchDocs = () => {
    getDocuments(job.id).then(setDocs).catch(console.error);
  };

  useEffect(() => {
    fetchDocs();
  }, [job.id]);

  const handleAttach = async () => {
    const file = await open({
      multiple: false,
      filters: [
        {
          name: "Documents",
          extensions: [
            "pdf", "doc", "docx", "txt", "rtf",
            "png", "jpg", "jpeg", "md",
          ],
        },
      ],
    });

    if (!file) return;

    setAttaching(true);
    try {
      await attachDocument(job.id, file, attachType);
      fetchDocs();
      setShowAttach(false);
    } catch (e) {
      alert("Failed to attach: " + e);
    } finally {
      setAttaching(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this attachment?")) return;
    await deleteDocument(id);
    fetchDocs();
  };

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

      {/* Attachments section */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-500">
            Attachments ({docs.length})
          </h3>
          <button
            onClick={() => setShowAttach(!showAttach)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            {showAttach ? "Cancel" : "+ Attach File"}
          </button>
        </div>

        {/* Attach form */}
        {showAttach && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
            <select
              value={attachType}
              onChange={(e) => setAttachType(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-xs"
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              onClick={handleAttach}
              disabled={attaching}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {attaching ? "Uploading..." : "Browse & Attach"}
            </button>
          </div>
        )}

        {/* Document list */}
        {docs.length === 0 && !showAttach && (
          <p className="text-xs text-gray-400">
            No attachments yet.
          </p>
        )}

        <div className="space-y-2">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-medium text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200 shrink-0">
                  {doc.file_type}
                </span>
                <span className="text-sm text-gray-900 truncate">
                  {doc.original_name}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openDocument(doc.id)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 px-1"
                >
                  Open
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-xs text-red-500 hover:text-red-700 px-1"
                >
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}