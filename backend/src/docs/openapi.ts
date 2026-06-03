export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "TZW Fire Extinguisher Management API",
    version: "0.1.0",
    description: "REST API for TZW LTD fire extinguisher management."
  },
  servers: [{ url: "http://localhost:3000/api/v1" }],
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
    schemas: {
      Error: {
        type: "object",
        example: { success: false, message: "Validation failed", code: "VALIDATION_ERROR" }
      },
      RegisterRequest: {
        type: "object",
        required: ["email", "password", "firstName", "lastName"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", minLength: 8, example: "SecurePass1" },
          firstName: { type: "string", minLength: 1, maxLength: 50, example: "Jane" },
          lastName: { type: "string", minLength: 1, maxLength: 50, example: "Doe" }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@tzwltd.com" },
          password: { type: "string", minLength: 1, example: "ChangeMe123!" }
        }
      },
      ForgotPasswordRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", example: "admin@tzwltd.com" }
        }
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["token", "password"],
        properties: {
          token: { type: "string", minLength: 32, example: "paste_the_64_character_reset_token_here" },
          password: { type: "string", minLength: 8, example: "NewSecure1" }
        }
      },
      VerifyRegistrationOtpRequest: {
        type: "object",
        required: ["email", "otp"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          otp: { type: "string", minLength: 6, maxLength: 6, example: "123456" }
        }
      },
      ResendRegistrationOtpRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" }
        }
      }
    }
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Start user registration",
        description: "Stores pending signup details and creates a short-lived 6-digit verification code in RegistrationOtp. The code is not returned by the API.",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } } },
        responses: {
          "201": { description: "Verification code sent" },
          "400": { description: "Validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "Email already exists", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/auth/verify-registration-otp": {
      post: {
        tags: ["Authentication"],
        summary: "Verify registration OTP",
        description: "Completes registration after the 6-digit verification code is confirmed.",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/VerifyRegistrationOtpRequest" } } } },
        responses: {
          "201": { description: "Account verified" },
          "400": { description: "Invalid or expired verification code" },
          "409": { description: "Email already exists" }
        }
      }
    },
    "/auth/resend-registration-otp": {
      post: {
        tags: ["Authentication"],
        summary: "Resend registration OTP",
        description: "Issues a fresh 6-digit verification code for a pending signup.",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ResendRegistrationOtpRequest" } } } },
        responses: {
          "200": { description: "Verification code resent" },
          "400": { description: "Invalid or expired verification code" }
        }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Log in",
        description: "Returns a JWT for a valid active account.",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } } },
        responses: { "200": { description: "Login successful" }, "401": { description: "Invalid credentials" } }
      }
    },
    "/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Log out",
        description: "Confirms client-side JWT removal.",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Logout successful" }, "401": { description: "Authentication required" } }
      }
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Authentication"],
        summary: "Request password reset",
        description: "Creates a time-limited reset token for the supplied email without revealing whether an account exists. In non-production environments the plain reset token is returned in the response for local testing.",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ForgotPasswordRequest" } } } },
        responses: {
          "200": { description: "Reset instructions created when applicable" },
          "400": { description: "Validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/auth/reset-password": {
      post: {
        tags: ["Authentication"],
        summary: "Reset password",
        description: "Consumes the plain reset token returned by forgot-password and sets a new password.",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ResetPasswordRequest" } } } },
        responses: {
          "200": { description: "Password reset successful" },
          "400": { description: "Invalid or expired token", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/users/profile": {
      get: {
        tags: ["Users"], summary: "View own profile", security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Profile returned" }, "401": { description: "Authentication required" } }
      },
      patch: {
        tags: ["Users"], summary: "Update own profile", security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { example: { firstName: "Jane", lastName: "Doe" } } } },
        responses: { "200": { description: "Profile updated" }, "400": { description: "Validation failed" } }
      }
    },
    "/users": {
      get: {
        tags: ["Users"], summary: "List users", description: "Required role: ADMIN.",
        security: [{ bearerAuth: [] }], responses: { "200": { description: "Users returned" }, "403": { description: "Forbidden" } }
      }
    },
    "/users/{id}": {
      get: {
        tags: ["Users"], summary: "View user", description: "Required role: ADMIN.",
        security: [{ bearerAuth: [] }], responses: { "200": { description: "User returned" }, "404": { description: "User not found" } }
      },
      patch: {
        tags: ["Users"], summary: "Update user role, status, or profile", description: "Required role: ADMIN.",
        security: [{ bearerAuth: [] }], responses: { "200": { description: "User updated" }, "400": { description: "Validation failed" } }
      },
      delete: {
        tags: ["Users"], summary: "Delete user", description: "Required role: ADMIN. Admins cannot delete themselves.",
        security: [{ bearerAuth: [] }], responses: { "200": { description: "User deleted" }, "400": { description: "Self deletion forbidden" } }
      }
    },
    "/users/profile/change-password": {
      post: {
        tags: ["Users"], summary: "Change own password", description: "Validates the current password and applies password complexity rules.",
        security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { example: { currentPassword: "OldPass1", newPassword: "NewPass2" } } } },
        responses: { "200": { description: "Password changed" }, "400": { description: "Current password invalid or validation failed" } }
      }
    },
    "/extinguishers": {
      get: {
        tags: ["Extinguishers"], summary: "Search and filter extinguishers", description: "Authenticated roles. Optional search, status, and type query filters.",
        security: [{ bearerAuth: [] }], responses: { "200": { description: "Inventory returned" }, "400": { description: "Invalid filter" } }
      },
      post: {
        tags: ["Extinguishers"], summary: "Register an extinguisher", description: "Required role: ADMIN. Serial number must be unique and expiry must follow installation.",
        security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { example: { serialNumber: "TZW-001", location: "Reception", type: "CO2", size: "5 lbs.", installationDate: "2026-01-01", expiryDate: "2031-01-01", status: "ACTIVE" } } } },
        responses: { "201": { description: "Extinguisher created" }, "409": { description: "Serial number exists" } }
      }
    },
    "/extinguishers/{id}": {
      get: { tags: ["Extinguishers"], summary: "View extinguisher", security: [{ bearerAuth: [] }], responses: { "200": { description: "Extinguisher returned" }, "404": { description: "Not found" } } },
      patch: { tags: ["Extinguishers"], summary: "Update extinguisher", description: "Required role: ADMIN.", security: [{ bearerAuth: [] }], responses: { "200": { description: "Extinguisher updated" }, "400": { description: "Invalid dates or input" } } },
      delete: { tags: ["Extinguishers"], summary: "Delete extinguisher", description: "Required role: ADMIN.", security: [{ bearerAuth: [] }], responses: { "200": { description: "Extinguisher deleted" }, "404": { description: "Not found" } } }
    },
    "/inspections": {
      get: { tags: ["Inspections"], summary: "List inspection history", security: [{ bearerAuth: [] }], responses: { "200": { description: "Inspections returned" } } },
      post: {
        tags: ["Inspections"], summary: "Schedule inspection", description: "Authenticated roles. Time must use HH:mm.",
        security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { example: { extinguisherId: "uuid", inspectionDate: "2026-07-01", inspectionTime: "14:30" } } } },
        responses: { "201": { description: "Inspection scheduled" }, "400": { description: "Validation failed" } }
      }
    },
    "/inspections/{id}": {
      get: { tags: ["Inspections"], summary: "View inspection", security: [{ bearerAuth: [] }], responses: { "200": { description: "Inspection returned" }, "404": { description: "Not found" } } },
      patch: { tags: ["Inspections"], summary: "Update inspection result", description: "Required role: ADMIN or INSPECTOR. Completed inspections require a result.", security: [{ bearerAuth: [] }], responses: { "200": { description: "Inspection updated" }, "400": { description: "Result required" } } }
    },
    "/maintenance": {
      get: { tags: ["Maintenance"], summary: "List maintenance history", description: "Required role: ADMIN or INSPECTOR.", security: [{ bearerAuth: [] }], responses: { "200": { description: "Maintenance returned" }, "403": { description: "Forbidden" } } },
      post: { tags: ["Maintenance"], summary: "Log maintenance", description: "Required role: ADMIN or INSPECTOR. Action and date are required.", security: [{ bearerAuth: [] }], responses: { "201": { description: "Maintenance logged" }, "400": { description: "Validation failed" } } }
    },
    "/maintenance/{id}": {
      get: { tags: ["Maintenance"], summary: "View maintenance record", description: "Required role: ADMIN or INSPECTOR.", security: [{ bearerAuth: [] }], responses: { "200": { description: "Record returned" }, "403": { description: "Forbidden" }, "404": { description: "Not found" } } }
    },
    "/reports": {
      get: { tags: ["Reports"], summary: "View live reports", description: "Authenticated users.", security: [{ bearerAuth: [] }], responses: { "200": { description: "Report returned" }, "401": { description: "Authentication required" } } }
    },
    "/reports/export.csv": {
      get: { tags: ["Reports"], summary: "Export CSV report", description: "Authenticated users.", security: [{ bearerAuth: [] }], responses: { "200": { description: "CSV file" } } }
    },
    "/reports/export.pdf": {
      get: { tags: ["Reports"], summary: "Export PDF report", description: "Authenticated users.", security: [{ bearerAuth: [] }], responses: { "200": { description: "PDF file" } } }
    },
    "/notifications": {
      get: { tags: ["Notifications"], summary: "List own notifications", security: [{ bearerAuth: [] }], responses: { "200": { description: "Notifications returned" } } },
      post: { tags: ["Notifications"], summary: "Create notification", description: "Required role: ADMIN. User UUID, title, and message are required.", security: [{ bearerAuth: [] }], responses: { "201": { description: "Notification created" }, "400": { description: "Validation failed" } } }
    },
    "/notifications/{id}/read": {
      patch: { tags: ["Notifications"], summary: "Mark own notification read", security: [{ bearerAuth: [] }], responses: { "200": { description: "Notification updated" }, "404": { description: "Not found" } } }
    }
  }
};
