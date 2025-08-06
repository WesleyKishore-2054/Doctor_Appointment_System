# 📘 Schedula API Documentation

---

## 🔐 Authentication & Token System

This API uses **JWT (JSON Web Token)** for authentication. After logging in or signing up, the client receives:

- `accessToken`: used in `Authorization: Bearer <token>` header for protected endpoints
- `refreshToken`: used to obtain a new `accessToken` when it expires

Tokens should be securely stored and managed by the client.

---

## 1. Authentication APIs

### POST `/auth/signup`

Registers a new user (doctor or patient).

#### Request
```json
{
  "email": "user@example.com",
  "password": "strongPass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "patient"
}
```

#### Success Response
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "success": true,
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### Error Codes
- `400` → Invalid input
- `409` → Email already exists
- `500` → Server error

### POST `/auth/login`

Login with email and password.

#### Request
```json
{
  "email": "user@example.com",
  "password": "strongPass123"
}
```

#### Success Response
```json
{
  "message": "Login successful",
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### Error Codes
- `401` → Invalid credentials
- `403` → User blocked
- `500` → Server error

### POST `/auth/refresh`

Get new access and refresh tokens using the old refresh token.

#### Request
```json
{
  "refreshToken": "refresh_token"
}
```

#### Success Response
```json
{
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

#### Error Codes
- `401` → Invalid refresh token
- `403` → Expired or revoked token
- `500` → Server error

### POST `/auth/logout`

Logs out the user and invalidates the refresh token.

#### Request
```json
{
  "refreshToken": "refresh_token"
}
```

#### Success Response
```json
{
  "message": "Logged out successfully"
}
```

#### Error Codes
- `401` → Invalid or expired token
- `500` → Server error

---

## 2. Doctor APIs

### POST `/doctors/profile`

Creates a doctor profile.

#### Request
```json
{
  "name": "Dr. Jane",
  "email": "doctor@gmail.com",
  "specialization": "Cardiology",
  "qualification": "MBBS",
  "experience": 10,
  "consultationFee": 500
}
```

#### Success Response
```json
{
  "success": true,
  "name": "Dr. Jane",
  "doctor_id": "doc123",
  "specialization": "Cardiology",
  "experience": 10
}
```

#### Error Codes
- `401` → Unauthorized
- `400` → Invalid data
- `500` → Server error

### GET `/doctors/profile` or `/doctors/{doctorId}`

Gets own or another doctor's profile.

#### Success Response
```json
{
  "id": "doc123",
  "name": "Dr. John Doe",
  "specialization": "Cardiology",
  "rating": 4.5
}
```

#### Error Codes
- `401` → Unauthorized (for own profile)
- `404` → Doctor not found
- `500` → Server error

### PATCH `/doctors/profile`

Updates fields in the doctor profile.

#### Request
```json
{
  "experience": 12,
  "consultationFee": 600
}
```

#### Success Response
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "specialization": "Cardiology",
    "qualification": "MBBS, MD, DM",
    "experience": 12,
    "consultationFee": 600,
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Error Codes
- `401` → Unauthorized
- `403` → Access denied
- `500` → Server error

### GET `/doctors/search`

Searches for doctors by specialization or view paginated list.

#### Success Response
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "id": "uuid",
        "Name": "Dr. John",
        "specialization": "Cardiology",
        "experience": 10,
        "consultationFee": 500,
        "rating": 4.5
      }
    ]
  }
}
```

#### Error Codes
- `500` → Server error

---

## 3. Patient Profile APIs

### POST `/patients/profile`

Creates a patient profile.

#### Request
```json
{
  "email": "patient@email.com",
  "name": "String",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "bloodGroup": "O+",
  "address": "123 Main St",
  "phone": "12345678"
}
```

#### Success Response
```json
{
  "message": "Profile successfully Created",
  "name": "String",
  "email": "patient@email.com",
  "id": "pat123",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "phone": "12345678"
}
```

#### Error Codes
- `401` → Unauthorized
- `409` → Email already in use
- `500` → Server error

### GET `/patients/profile`

Returns the patient profile of the authenticated user.

#### Success Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user": {
      "Name": "String",
      "email": "patient@example.com"
    },
    "dateOfBirth": "1990-05-15",
    "gender": "male",
    "phone": "12345678",
    "bloodGroup": "O+"
  }
}
```

#### Error Codes
- `401` → Unauthorized
- `404` → Profile not found
- `500` → Server error

### PATCH `/patients/profile`

Updates fields in the patient profile.

#### Request
```json
{
  "phone": "1234567",
  "bloodGroup": "O-"
}
```

#### Success Response
```json
{
  "message": "Profile Updated SuccessFully",
  "data": {
    "id": "uuid",
    "user": {
      "Name": "String",
      "email": "patient@example.com"
    },
    "dateOfBirth": "1990-05-15",
    "gender": "male",
    "phone": "1234567",
    "bloodGroup": "O-"
  }
}
```

#### Error Codes
- `401` → Unauthorized
- `403` → Access denied
- `500` → Server error

---

## 4. Availability APIs

### POST `/doctors/availability`

Creates a time slot for doctor availability.

#### Request
```json
{
  "date": "2024-01-20",
  "startTime": "09:00",
  "endTime": "17:00",
  "slotDuration": 30,
  "isRecurring": false,
  "recurringPattern": "",
  "recurringEndDate": ""
}
```

#### Success Response
```json
{
  "success": true,
  "message": "Availability created successfully",
  "data": {
    "id": "uuid",
    "doctorId": "uuid",
    "date": "2024-01-20",
    "startTime": "09:00",
    "endTime": "17:00",
    "slotDuration": 30,
    "totalSlots": 16,
    "availableSlots": 16,
    "isRecurring": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Error Codes
- `401` → Unauthorized
- `500` → Server error

### GET `/doctors/availability` or `/doctors/{doctorId}/availability`

Returns availability for a doctor (own or public).

#### Success Response
```json
{
  "success": true,
  "data": {
    "availability": [
      {
        "id": "uuid",
        "date": "2024-01-20",
        "dayOfWeek": "Saturday",
        "startTime": "09:00",
        "endTime": "17:00",
        "availableSlots": 12
      }
    ]
  }
}
```

#### Error Codes
- `401` → Unauthorized
- `404` → Availability not found
- `500` → Server error

### PATCH `/doctors/availability/{availabilityId}`

Update doctor availability.

#### Request
```json
{
  "startTime": "11:00",
  "endTime": "15:00"
}
```

#### Success Response
```json
{
  "message": "Availability updated"
}
```

#### Error Codes
- `401` → Unauthorized
- `403` → Not owner
- `500` → Server error

### DELETE `/doctors/availability/{availabilityId}`

Deletes a doctor's availability slot.

#### Success Response
```json
{
  "success": true,
  "message": "Availability deleted successfully"
}
```

#### Error Codes
- `401` → Unauthorized
- `403` → Not owner
- `500` → Server error

---

## 5. Appointment APIs

### POST `/appointments`

Creates an appointment.

#### Request
```json
{
  "doctorId": "string",
  "date": "2024-01-20",
  "time": "10:00",
  "symptoms": "Chest pain",
  "notes": "Regular checkup"
}
```

#### Success Response
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "id": "uuid",
    "status": "confirmed",
    "consultationFee": 500,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Error Codes
- `401` → Unauthorized
- `409` → Slot already booked
- `500` → Server error

### GET `/appointments`

Fetches appointments with optional filters.

#### Success Response
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "uuid",
        "doctor": {
          "id": "uuid",
          "Name": "Dr. Jane"
        },
        "date": "2024-01-20",
        "time": "10:00",
        "status": "confirmed"
      }
    ]
  }
}
```

#### Error Codes
- `401` → Unauthorized
- `500` → Server error

### GET `/appointments/:id`

Gets details of a specific appointment.

#### Success Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "doctor": {
      "id": "uuid",
      "Name": "Dr. Jane",
      "specialization": "Cardiology"
    },
    "patient": {
      "id": "uuid",
      "Name": "John",
      "age": 32
    },
    "date": "2024-01-20",
    "time": "10:00",
    "status": "confirmed",
    "consultationFee": 500
  }
}
```

#### Error Codes
- `401` → Unauthorized
- `404` → Appointment not found
- `500` → Server error

### PATCH `/appointments/:id/reschedule`

Reschedules an existing appointment.

#### Request
```json
{
  "newDate": "2024-01-22",
  "newTime": "14:00",
  "reason": "Emergency surgery"
}
```

#### Success Response
```json
{
  "success": true,
  "message": "Appointment rescheduled successfully",
  "data": {
    "id": "uuid",
    "oldDate": "2024-01-20",
    "newDate": "2024-01-22"
  }
}
```

#### Error Codes
- `401` → Unauthorized
- `403` → Not allowed
- `409` → Time slot unavailable
- `500` → Server error

### PATCH `/appointments/:id/cancel`

Cancels an appointment.

#### Request
```json
{
  "reason": "Personal emergency"
}
```

#### Success Response
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "id": "uuid",
    "status": "cancelled"
  }
}
```

#### Error Codes
- `401` → Unauthorized
- `403` → Cannot cancel past appointment
- `500` → Server error

---

## 6. Chat APIs

### GET `/appointments/:appointmentId/messages`

Get Chat Messages

#### Headers
- `Authorization: Bearer {accessToken}`

#### Query Parameters
- `page`: number (optional, default: 1)
- `limit`: number (optional, default: 20)

#### Request Body
None

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg123",
        "senderId": "uuid",
        "senderRole": "patient",
        "message": "Hello doctor",
        "timestamp": "2024-07-15T10:00:00Z",
        "isRead": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2
    }
  }
}
```

### POST `/appointments/:appointmentId/messages`

Send Message

#### Headers
- `Authorization: Bearer {accessToken}`

#### Request Body
```json
{
  "message": "Hi, I have a question",
  "messageType": "text",
  "attachmentUrl": "https://example.com/image.jpg"
}
```

**Note**: 
- `messageType`: optional values: 'text', 'image', 'file'
- `attachmentUrl`: optional

#### Success Response (201)
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": "msg124",
    "message": "Hi, I have a question",
    "senderRole": "patient",
    "timestamp": "2024-07-15T10:01:00Z"
  }
}
```

### PATCH `/appointments/:appointmentId/messages/read`

Mark Messages as Read

#### Headers
- `Authorization: Bearer {accessToken}`

#### Request Body
```json
{
  "messageIds": ["msg123", "msg124"]
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Messages marked as read",
  "data": {
    "readCount": 2
  }
}
```

---

## 7. Dashboard & Analytics APIs

### GET `/patients/dashboard`

Get Patient Dashboard

#### Headers
- `Authorization: Bearer {accessToken}`

#### Request Body
None

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "upcomingAppointments": [
      {
        "id": "appt123",
        "doctorName": "Dr. Jane Smith",
        "specialization": "Cardiology",
        "date": "2024-07-25",
        "time": "10:00"
      }
    ],
    "recentAppointments": [
      {
        "id": "appt122",
        "doctorName": "Dr. Ravi Kumar",
        "date": "2024-07-12",
        "status": "completed"
      }
    ]
  }
}
```

### GET `/doctors/dashboard`

Get Doctor Dashboard

#### Headers
- `Authorization: Bearer {accessToken}`

#### Request Body
None

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "appointmentsToday": 5,
    "upcomingAppointments": [
      {
        "id": "appt200",
        "patientName": "John Doe",
        "time": "11:00 AM"
      }
    ],
    "stats": {
      "totalAppointments": 120,
      "avgRating": 4.7
    }
  }
}
```