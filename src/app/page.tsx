import { supabase } from "@/lib/supabase";
import JobTable from "@/components/job-table";

export default async function Dashboard() {
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-4 text-red-500">Error loading jobs: {error.message}</div>;
  }

  return (
    <main className="container mx-auto p-8 max-w-5xl">
      <JobTable initialJobs={jobs || []} />
    </main>
  );
}