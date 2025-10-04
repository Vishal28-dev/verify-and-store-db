# TOTP Verification API

This project implements a serverless API endpoint for verifying Time-based One-Time Passwords (TOTP) as a form of two-factor authentication (2FA).

It is built as a Next.js API route and uses:
- **Supabase** for database interactions (fetching user's TOTP secret).
- **Speakeasy** for generating and verifying TOTP tokens.

## API Endpoint: `/api/verify-totp`

### `POST /api/verify-totp`

Verifies a TOTP token for a user.

#### Request Body

-   `email` (string, required): The user's email address.
-   `token` (string, required): The 6-digit TOTP token from the user's authenticator app.

#### Responses

-   **200 OK**: If the token is valid.
    ```json
    {
      "message": "Login successful!"
    }
    ```
-   **400 Bad Request**: If `email` or `token` are missing from the request body.
    ```json
    {
      "error": "Email and token are required."
    }
    ```
-   **401 Unauthorized**: If the user is not found, has no TOTP secret, or the token is invalid.
    ```json
    {
      "error": "Invalid email or token."
    }
    ```
-   **405 Method Not Allowed**: If the request method is not `POST`.
-   **500 Internal Server Error**: For any other unexpected server-side errors.

## Setup

1.  **Database**:
    -   Set up a Supabase project.
    -   Create a `users` table with at least `email` and `totp_secret` columns.
2.  **Environment Variables**:
    -   Configure your Supabase URL and anon key in your environment. This project uses `lib/supabaseClient.js` to initialize the client.
3.  **Dependencies**:
    -   Install the required packages: `supabase`, `speakeasy`.
