const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const dbPath = path.join(__dirname, "janitri.db");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Middleware for form data

let db = null;

// Initialize Database and Start Server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Authentication Middleware
const authenticateUser = async (request, response, next) => {
  const { email, password } = request.headers;

  if (!email || !password) {
    return response.status(401).send("Missing email or password");
  }

  const selectUserQuery = `SELECT * FROM users WHERE email = ?`;
  const user = await db.get(selectUserQuery, [email]);

  if (!user) {
    return response.status(400).send("Invalid user");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return response.status(400).send("Invalid password");
  }

  // Attach user info to the request
  request.userId = user.id;
  next();
};

app.post("/register/", async (request, response) => {
  try {
    const { email, password } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the user already exists
    const userExistsQuery = `
      SELECT * 
      FROM users 
      WHERE email = "${email}"`;
    const existingUser = await db.get(userExistsQuery);

    if (existingUser) {
      return response.status(400).send("User already exists");
    }

    // Insert new user
    const createUserQuery = `
      INSERT INTO 
      users (email, password) 
      VALUES (
      '${email}', 
      '${hashedPassword}');`;
    await db.run(createUserQuery);

    response.status(201).send("User created successfully");
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
});

// ✅ User Login API
app.post("/login/", async (request, response) => {
  try {
    const { email, password } = request.body;
    const selectUserQuery = `
      SELECT * 
      FROM users 
      WHERE email = '${email}';`;
    const user = await db.get(selectUserQuery);

    if (user === undefined) {
      return response.status(400).send("Invalid user");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
      const payload = { userId: user.id };
      const jwtToken = jwt.sign(payload, "SECRET");
      response.send("User login successfully");
      console.log(request.body);
    } else {
      response.status(400).send("Invalid password");
    }
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
});

//Post the patient detailes

app.post("/patients/", authenticateUser, async (request, response) => {
  try {
    let user_id = request.userId;
    const { name, age, gender } = request.body;
    const insertPatientQuery = `
      INSERT INTO 
      patients (name, age, gender, user_id)
      VALUES (
        ${name}, 
        ${age}, 
        ${gender}, 
        ${user_id});
    `;
    await db.run(insertPatientQuery, [name, age, gender, request.userId]);

    response.status(201).send("Patient added successfully");
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
});

//Get All Patients for Logged-in User
app.get("/patients/", authenticateUser, async (request, response) => {
  let { user_id } = request;
  const getPatientsQuery = `
    SELECT * 
    FROM patients 
    WHERE user_id = ${user_id};`;
  const patients = await db.all(getPatientsQuery);

  response.send(patients);
});

//Posting patient heart rate by patientId
app.post(
  "/patients/:patientId/heart-rate/",
  authenticateUser,
  async (request, response) => {
    try {
      const { patientId } = request.params;
      const { rate } = request.body;

      // Validate heart rate range
      if (rate < 30 || rate > 250) {
        return response
          .status(400)
          .send("Heart rate must be between 30 and 250.");
      }

      // Insert heart rate data
      const insertHeartRateQuery = `
      INSERT INTO heart_rates (patient_id, rate) 
      VALUES (?, ?);
    `;
      await db.run(insertHeartRateQuery, [patientId, rate]);

      response.status(201).send("Heart rate recorded successfully.");
    } catch (error) {
      response.status(500).send("Internal Server Error");
    }
  }
);

app.get(
  "/patients/:patientId/heart-rate/",
  authenticateUser,
  async (request, response) => {
    try {
      const { patientId } = request.params;

      // Fetch heart rate data for the patient
      const getHeartRateQuery = `
      SELECT rate, recorded_at 
      FROM heart_rates 
      WHERE patient_id = ? 
      ORDER BY recorded_at DESC;
    `;
      const heartRates = await db.all(getHeartRateQuery, [patientId]);

      response.send(heartRates);
    } catch (error) {
      response.status(500).send("Internal Server Error");
    }
  }
);
