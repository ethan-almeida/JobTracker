use std::path::PathBuf;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

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

#[derive(Debug, Serialize, Deserialize)]
pub struct Job {
    pub id: i64,
    pub company: String,
    pub title: String,
    pub location: String, 
    pub status: String, 
    pub job_id: String,
    pub notes: String,
    pub created_at: String,
    pub updated_at: String,
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

    pub fn create_job(
        &self, 
        company: &str,
        title: &str,
        location: &str,
        status: &str,
        job_id: &str,
        notes: &str,
    ) -> Result<i64, rusqlite::Error> {
        self.conn.execute("INSERT INTO jobs(company, title, location, status, job_id, notes) VALUES (?1, ?2, ?3, ?4, ?5, ?6)", params![company, title, location, status, job_id, notes], )?;
        Ok(self.conn.last_insert_rowid())
    }

    pub fn get_jobs(&self) -> Result<Vec<Job>, rusqlite::Error> {
        let mut stmt = self.conn.prepare(
            "SELECT id, company, title, location, status, job_id, notes, created_at, updated_at
             FROM jobs ORDER BY updated_at DESC"
        )?;
        let rows = stmt.query_map([], |row| {
            Ok(Job {
                id: row.get(0)?,
                company: row.get(1)?,
                title: row.get(2)?,
                location: row.get(3)?,
                status: row.get(4)?,
                job_id: row.get(5)?,
                notes: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })?;
        let mut jobs = Vec::new();
        for row in rows {
            jobs.push(row?);
        }
        Ok(jobs)
    }

    pub fn get_job(&self, id: i64) -> Result<Option<Job>, rusqlite::Error> {
        let mut stmt = self.conn.prepare(
            "SELECT id, company, title, location, status, job_id, notes, created_at, updated_at
             FROM jobs WHERE id = ?1"
        )?;
        let mut rows = stmt.query_map(params![id], |row| {
            Ok(Job {
                id: row.get(0)?,
                company: row.get(1)?,
                title: row.get(2)?,
                location: row.get(3)?,
                status: row.get(4)?,
                job_id: row.get(5)?,
                notes: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })?;
        match rows.next() {
            Some(Ok(job)) => Ok(Some(job)),
            Some(Err(e)) => Err(e),
            None => Ok(None),
        }
    }

    pub fn update_job(
        &self,
        id: i64,
        company: &str,
        title: &str,
        location: &str,
        status: &str,
        job_id: &str,
        notes: &str,
    ) -> Result<(), rusqlite::Error> {
        self.conn.execute(
            "UPDATE jobs SET company = ?1, title = ?2, location = ?3,
             status = ?4, job_id = ?5, notes = ?6, updated_at = datetime('now')
             WHERE id = ?7",
            params![company, title, location, status, job_id, notes, id],
        )?;
        Ok(())
    }

    pub fn delete_job(&self, id: i64) -> Result<(), rusqlite::Error> {
        self.conn.execute("DELETE FROM jobs WHERE id = ?1", params![id])?;
        Ok(())
    }
}