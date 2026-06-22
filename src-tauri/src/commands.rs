use crate::db::Job;
use crate::AppState;

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