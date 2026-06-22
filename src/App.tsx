import { useState, useEffect, useCallback } from "react";
import type { Job } from "./types";
import { STATUS_OPTIONS } from "./types";
import { getJobs, createJob, updateJob, deleteJob } from "./api";
import JobForm from "./components/JobForm";
import JobCard from "./components/JobCard";
import JobDetail from "./components/JobDetail";

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);

  const fetchJobs = useCallback(() => {
    getJobs().then(setJobs).catch(console.error);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs =
    filter === "All" ? jobs : jobs.filter((j) => j.status === filter);

  const handleCreate = async (data: {
    company: string;
    title: string;
    location: string;
    status: string;
    job_id: string;
    notes: string;
  }) => {
    await createJob(data);
    setShowForm(false);
    fetchJobs();
  };

  const handleUpdate = async (data: {
    company: string;
    title: string;
    location: string;
    status: string;
    job_id: string;
    notes: string;
  }) => {
    if (!editing) return;
    await updateJob(editing.id, data);
    setEditing(null);
    setShowForm(false);
    setSelectedJob(null);
    fetchJobs();
  };

  const handleDelete = async (id: number) => {
    await deleteJob(id);
    setSelectedJob(null);
    fetchJobs();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Job Tracker</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          + Add Job
        </button>
      </header>

      {/* Filter bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex gap-2 overflow-x-auto">
        {["All", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === s
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Job list */}
        <div className="w-1/2 overflow-y-auto border-r border-gray-200 p-4 space-y-3">
          {filteredJobs.length === 0 && (
            <p className="text-gray-400 text-center mt-12">
              {filter === "All"
                ? "No jobs yet. Click '+ Add Job' to get started."
                : `No jobs with status "${filter}".`}
            </p>
          )}
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              selected={selectedJob?.id === job.id}
              onClick={() => setSelectedJob(job)}
              onEdit={() => {
                setEditing(job);
                setShowForm(true);
              }}
              onDelete={() => handleDelete(job.id)}
            />
          ))}
        </div>

        {/* Detail panel */}
        <div className="w-1/2 overflow-y-auto p-4">
          {selectedJob ? (
            <JobDetail
              job={selectedJob}
              onEdit={() => {
                setEditing(selectedJob);
                setShowForm(true);
              }}
              onDelete={() => handleDelete(selectedJob.id)}
            />
          ) : (
            <p className="text-gray-400 text-center mt-12">
              Select a job to view details
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <JobForm
          job={editing}
          onSave={editing ? handleUpdate : handleCreate}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

export default App;