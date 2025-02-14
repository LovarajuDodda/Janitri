const sqlite3 = require("sqlite3").verbose();

// Initialize database connection
const db = new sqlite3.Database("./janitri.db", (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database");
    createTables();
  }
});

// Table creation SQL with proper constraints and relationships
const createTables = () => {
  db.serialize(() => {
    db.run(`PRAGMA foreign_keys = ON;`);

    db.run(
      `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
      (err) => {
        if (err) console.error("Error creating users table:", err.message);
      }
    );

    db.run(
      `
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER CHECK(age > 0) NOT NULL,
        gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')) NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `,
      (err) => {
        if (err) console.error("Error creating patients table:", err.message);
      }
    );

    db.run(
      `
      CREATE TABLE IF NOT EXISTS heart_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        rate INTEGER CHECK(rate BETWEEN 30 AND 250) NOT NULL,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE
      );
    `,
      (err) => {
        if (err)
          console.error("Error creating heart_rates table:", err.message);
      }
    );

    db.run(
      `CREATE INDEX IF NOT EXISTS idx_patient_user ON patients(user_id);`,
      (err) => {
        if (err)
          console.error("Error creating index on patients:", err.message);
      }
    );

    db.run(
      `CREATE INDEX IF NOT EXISTS idx_heartrate_patient ON heart_rates(patient_id);`,
      (err) => {
        if (err)
          console.error("Error creating index on heart_rates:", err.message);
      }
    );

    console.log("Tables created successfully");
  });

  // Close connection after setup
  db.close((err) => {
    if (err) console.error("Error closing database:", err.message);
    else console.log("Database connection closed");
  });
};
