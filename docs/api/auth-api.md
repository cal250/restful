# Authentication API

Base path: `/api/v1/auth`

## Register

- Method: `POST`
- URL: `/register`
- Role: Public
- Purpose: Create a new account with the `USER` role.
- Validation: Valid unique email; password 8-72 characters with uppercase,
  lowercase, and number; first and last names 1-50 characters.

```json
{
  "email": "user@example.com",
  "password": "SecurePass1",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

Success: `201 Account created`. Errors: `400 VALIDATION_ERROR`,
`409 USER_EMAIL_EXISTS`.

## Login

- Method: `POST`
- URL: `/login`
- Role: Public
- Purpose: Authenticate an active account and return a JWT.
- Validation: Valid email and non-empty password.

Success: `200 Login successful`. Error: `401 INVALID_CREDENTIALS`.

## Logout

- Method: `POST`
- URL: `/logout`
- Role: Authenticated
- Purpose: Confirm that the client should remove its JWT.

Success: `200 Logout successful`. Error: `401 AUTHENTICATION_REQUIRED`.

## Forgot Password

- Method: `POST`
- URL: `/forgot-password`
- Role: Public
- Purpose: Create a 30-minute password reset token without account disclosure.
- Validation: Valid email.

Success: `200` for both known and unknown email addresses.

## Reset Password

- Method: `POST`
- URL: `/reset-password`
- Role: Public
- Purpose: Consume a reset token and replace the account password.
- Validation: Token length at least 32; password follows registration rules.

Success: `200 Password reset successful`. Error: `400 INVALID_RESET_TOKEN`.
