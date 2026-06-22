use crate::db::{self, Job, Document};
use crate::AppState;
use std::path::PathBuf;

#[tauri::command]
pub fn create_job(
    state: tauri::State<AppState>,
    company: String,
    title: String,
    location: String,
    status: String,
    job_id: String,
    notes: String,
) -> Result<i64, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())?
        .create_job(&company, &title, &location, &status, &job_id, &notes)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_jobs(state: tauri::State<AppState>) -> Result<Vec<Job>, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())?
        .get_jobs()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_job(state: tauri::State<AppState>, id: i64) -> Result<Option<Job>, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())?
        .get_job(id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_job(
    state: tauri::State<AppState>,
    id: i64,
    company: String,
    title: String,
    location: String,
    status: String,
    job_id: String,
    notes: String,
) -> Result<(), String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())?
        .update_job(id, &company, &title, &location, &status, &job_id, &notes)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_job(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())?
        .delete_job(id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn attach_document(
    state: tauri::State<AppState>,
    job_id: i64,
    source_path: String,
    file_type: String,
) -> Result<Document, String> {
    let source = PathBuf::from(&source_path);
    let original_name = source
        .file_name()
        .ok_or("invalid file path")?
        .to_str()
        .ok_or("invalid filename")?
        .to_string();

    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_secs();

    let ext = source
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("");

    let storage_name = if ext.is_empty() {
        format!("{}_{}", timestamp, &original_name)
    } else {
        format!("{}_{}", timestamp, &original_name)
    };

    let root = db::app_root();
    let doc_dir = root.join("documents").join(job_id.to_string());
    std::fs::create_dir_all(&doc_dir).map_err(|e| e.to_string())?;

    let dest = doc_dir.join(&storage_name);
    std::fs::copy(&source, &dest).map_err(|e| e.to_string())?;

    let db = state.db.lock().map_err(|e| e.to_string())?;
    let doc_id = db
        .create_document(job_id, &storage_name, &original_name, &file_type)
        .map_err(|e| e.to_string())?;

    drop(db);

    let doc = state
        .db
        .lock()
        .map_err(|e| e.to_string())?
        .get_document(doc_id)
        .map_err(|e| e.to_string())?
        .ok_or("document not found after insert")?;

    Ok(doc)
}

#[tauri::command]
pub fn get_documents(
    state: tauri::State<AppState>,
    job_id: i64,
) -> Result<Vec<Document>, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())?
        .get_documents(job_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_document(
    state: tauri::State<AppState>,
    id: i64,
) -> Result<(), String> {
    let doc = state
        .db
        .lock()
        .map_err(|e| e.to_string())?
        .get_document(id)
        .map_err(|e| e.to_string())?
        .ok_or("document not found")?;

    let root = db::app_root();
    let file_path = root
        .join("documents")
        .join(doc.job_id.to_string())
        .join(&doc.filename);

    let _ = std::fs::remove_file(&file_path);

    state
        .db
        .lock()
        .map_err(|e| e.to_string())?
        .delete_document(id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn open_document(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    let doc = state
        .db
        .lock()
        .map_err(|e| e.to_string())?
        .get_document(id)
        .map_err(|e| e.to_string())?
        .ok_or("document not found")?;

    let root = db::app_root();
    let file_path = root
        .join("documents")
        .join(doc.job_id.to_string())
        .join(&doc.filename);

    open::that(&file_path).map_err(|e| e.to_string())
}