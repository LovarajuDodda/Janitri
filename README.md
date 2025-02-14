# Testing the Janitri Backend API

This guide provides step-by-step instructions on how to test the Janitri Backend API to ensure all functionalities work correctly.

---

## 🛠️ **Setup Before Testing**

### 1️⃣ **Run Database Setup**
Before testing, ensure that the database tables are created by running:
```sh
node database.js
```
This will create `users`, `patients`, and `heart_rates` tables inside `janitri.db`.

### 2️⃣ **Start the Server**
```sh
node app.js
```
Server will start at: `http://localhost:3000/`

---

## 📝 **Testing APIs using Postman or cURL**

### **1️⃣ User Registration**
- **Endpoint:** `POST /register/`
- **Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
- **Expected Response:** `201 Created`
```json
"User created successfully"
```

### **2️⃣ User Login**
- **Endpoint:** `POST /login/`
- **Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
- **Expected Response:** `200 OK`
```json
{
  "jwtToken": "your-token-here"
}
```

### **3️⃣ Adding a Patient**
- **Endpoint:** `POST /patients/`
- **Headers:**
```sh
email: test@example.com
password: password123
```
- **Body:**
```json
{
  "name": "John Doe",
  "age": 30,
  "gender": "Male"
}
```
- **Expected Response:** `201 Created`
```json
"Patient added successfully"
```

### **4️⃣ Fetching Patients**
- **Endpoint:** `GET /patients/`
- **Headers:**
```sh
email: test@example.com
password: password123
```
- **Expected Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "age": 30,
    "gender": "Male"
  }
]
```

### **5️⃣ Recording Heart Rate**
- **Endpoint:** `POST /patients/:patientId/heart-rate/`
- **Headers:**
```sh
email: test@example.com
password: password123
```
- **Body:**
```json
{
  "rate": 72
}
```
- **Expected Response:** `201 Created`
```json
"Heart rate recorded successfully."
```

### **6️⃣ Retrieving Heart Rate Data**
- **Endpoint:** `GET /patients/:patientId/heart-rate/`
- **Headers:**
```sh
email: test@example.com
password: password123
```
- **Expected Response:** `200 OK`
```json
[
  {
    "rate": 72,
    "recorded_at": "2025-02-14 12:00:00"
  }
]
```

---

## 🔄 **Reset Database (For Fresh Testing)**
To reset all data, delete the `janitri.db` file and rerun:
```sh
rm janitri.db
node database.js
```

---

## 🔎 **Testing Checklist**
✅ Database initializes properly.  
✅ User registration works.  
✅ Login verifies correct credentials.  
✅ Patients can be added and retrieved.  
✅ Heart rate data can be recorded and fetched correctly.  
✅ Proper error messages are displayed for invalid requests.  

Project by: Lovaraju Dodda

