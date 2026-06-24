import { invoke } from "@tauri-apps/api/core";
import type { Job, FormData } from "./types";
import type { Document } from "./types";
import type { ParsedJob } from "./types";

export function checkDb() {
  return invoke<string>("check_db");
}

export function createJob(data: FormData) {
  return invoke<number>("create_job", {
    company: data.company,
    title: data.title,
    location: data.location,
    status: data.status,
    jobId: data.job_id,
    notes: data.notes,
  });
}

export function getJobs() {
  return invoke<Job[]>("get_jobs");
}

export function getJob(id: number) {
  return invoke<Job | null>("get_job", { id });
}

export function updateJob(id: number, data: FormData) {
  return invoke<void>("update_job", {
    id,
    company: data.company,
    title: data.title,
    location: data.location,
    status: data.status,
    jobId: data.job_id,
    notes: data.notes,
  });
}

export function deleteJob(id: number) {
  return invoke<void>("delete_job", { id });
}

export function attachDocument(jobId: number, sourcePath: string, fileType: string) {
  return invoke<Document>("attach_document", {
    jobId,
    sourcePath,
    fileType,
  });
}

export function getDocuments(jobId: number){
  return invoke<Document[]>("get_documents", { jobId });
}

export function deleteDocument(id: number){
  return invoke<void>("delete_document", { id });
}

export function openDocument(id: number) {
  return invoke<void>("open_document", { id });
}

export function parsePdf(path: string) {
  return invoke<ParsedJob>("parse_pdf", { path });
}

