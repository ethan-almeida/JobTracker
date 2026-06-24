use std::sync::Mutex;
use tauri::Manager;

mod commands;
mod db;

pub struct AppState {
    pub db: Mutex<db::Database>,
}

#[tauri::command]
fn check_db(state: tauri::State<AppState>) -> Result<String, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())?
        .health_check()
        .map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let database = db::Database::init().expect("failed to init db");
            app.manage(AppState {
                db: Mutex::new(database),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            check_db,
            commands::create_job,
            commands::get_jobs,
            commands::get_job,
            commands::update_job,
            commands::delete_job,
            commands::attach_document,
            commands::get_documents,
            commands::delete_document,
            commands::open_document,
            commands::parse_pdf,
        ])
        .run(tauri::generate_context!())
        .expect("error running the job tracker");
}