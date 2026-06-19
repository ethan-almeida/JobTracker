use std::path::PathBuf;
use rusqlite::Connection;

fn app_root() -> PathBuf {
    #[cfg(debug_assertions)]
    {
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("failed to get project root")
        .to_path_buf()
    }

    #[cfg(not(debug_assertions))]
    {
        std::env::current_exe()
        .expect("failed to get exec path")
        .parent()
        .expect("exec has no parent")
        .to_path_buf()
    }
}

pub struct Database {
    pub conn: Connection,
}

impl Database {
    pub fn init() -> Result<Self, Box<dyn std::error::Error>> {
        let root = app_root();
        let data_dir = root.join("data");
        std::fs::create_dir_all(&data_dir)?;
        let db_path = data_dir.join("tracker.db");
        let conn = Connection::open(&db_path)?;

        conn.execute_batch("PRAGMA journal_mode=WAL;")?;
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS jobs (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                company     TEXT NOT NULL,
                title       TEXT NOT NULL,
                location    TEXT NOT NULL DEFAULT '',
                status      TEXT NOT NULL DEFAULT 'Applied',
                job_id      TEXT NOT NULL DEFAULT '',
                notes       TEXT NOT NULL DEFAULT '',
                created_at  TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS documents (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id          INTEGER NOT NULL,
                filename        TEXT NOT NULL,
                original_name   TEXT NOT NULL,
                file_type       TEXT NOT NULL DEFAULT '',
                created_at      TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
            );"
        )?;
        
        
        Ok(Self { conn })
    }

    pub fn health_check(&self) -> Result<String, rusqlite::Error> {
        let mut stmt = self.conn.prepare("PRAGMA integrity_check")?;
        let result: String = stmt.query_row([], |row| row.get(0))?;
        Ok(result)
    }
}