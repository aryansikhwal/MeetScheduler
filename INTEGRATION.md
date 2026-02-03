You are a senior full-stack engineer.

Goal:
Replace all existing backend API endpoints in this project with the company Authentication + Users + Teams + Plans APIs (Swagger provided).

IMPORTANT RULES:
- Do NOT change UI behavior or flows.
- Do NOT redesign components.
- Only replace API wiring.
- Preserve existing frontend logic.
- Centralize all API calls into one axios service.
- Use Bearer token authentication.
- Store accessToken in localStorage.
- Automatically attach token on every request.
- Add error handling + console logs for debugging.

------------------------------------

STEP 1 — Create API Client

Create file:

/src/services/companyApi.js

Implement axios client:

- baseURL = https://f4f34e4faf1e.ngrok-free.app/docs
- request interceptor:
    read token from localStorage
    attach Authorization: Bearer <token>
- response interceptor:
    log errors
    redirect to login on 401

Export companyApi.

------------------------------------

STEP 2 — Authentication Integration

Replace existing login/signup/logout endpoints with:

POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/verify

On login success:
- store accessToken in localStorage as "token"

Update login flow:

OLD:
axios.post(...)

NEW:
companyApi.post("/api/auth/login")

------------------------------------

STEP 3 — Current User

Replace any "get current user" logic with:

GET /api/users/me

Update profile update:

PUT /api/users/me

Password change:

POST /api/users/me/change-password

------------------------------------

STEP 4 — Teams (MeetScheduler)

Replace all team-related endpoints with:

POST /api/teams
GET /api/teams/me
GET /api/teams/{team_id}
DELETE /api/teams/{team_id}
POST /api/teams/{team_id}/members

Ensure:

- Team creation works
- Fetch my team on dashboard load
- Member invite preserved

------------------------------------

STEP 5 — Plans / Credits (Unibox)

Replace usage logic with:

GET /api/plans/me
POST /api/plans/me/use-credits

Before sending email or message:

Call /use-credits
Block action if credits insufficient.

------------------------------------

STEP 6 — Frontend Wiring

Ensure frontend:

- NEVER calls company API directly
- ONLY calls internal backend routes OR companyApi

Replace all axios/fetch calls accordingly.

------------------------------------

STEP 7 — Environment Variables

Move API base URL to:

.env

COMPANY_API_BASE_URL=

Ensure loaded via process.env.

------------------------------------

STEP 8 — Debugging

Add console.logs:

- login response
- users/me response
- teams/me response
- plans/me response

Log errors with:

error.response?.data

------------------------------------

STEP 9 — Cleanup

Remove:

- old API services
- unused routes
- deprecated controllers

------------------------------------

Deliverables:

- companyApi.js created
- auth fully migrated
- user profile migrated
- teams migrated
- plans migrated
- no UI changes
- no broken imports
- project builds successfully

Proceed carefully file by file.

Do not skip steps.
