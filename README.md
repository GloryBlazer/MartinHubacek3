# Martin Hubáček — portfolio and questionnaire API

HTML/CSS/JavaScript frontend with an ASP.NET Core 10 backend. The unrelated C# console exercises remain in `C#/`.

## Run

Install the .NET 10 SDK, then from the repository root:

```powershell
dotnet run --project backend/Portfolio.Api.csproj --urls http://127.0.0.1:5080
```

Open http://127.0.0.1:5080 or http://127.0.0.1:5080/js_projekt/Questionaire.html. The backend serves the public frontend and API on the same origin. A Python static server or opening the HTML directly cannot run the questionnaire API.

The shared portfolio navigation links to Dotazník and Hravý život. Short addresses `/dotaznik` and `/hravy-zivot` redirect to the existing project pages. The actual folder names stay unchanged. HTML, CSS, and JavaScript responses require cache revalidation to avoid displaying old versions.

After editing frontend files, rebuild/restart the backend to copy the latest files into its public output directory. For a deployment, publish again and deploy the complete output, including `wwwroot`, rather than uploading only the root HTML pages.

## Structure

- `backend/Controllers/QuestionnaireController.cs`: question definition, submission, result retrieval.
- `backend/Controllers/HealthController.cs`: health endpoint.
- `backend/Controllers/ContactController.cs`: validated contact submission.
- `backend/Services/ContactService.cs`: private contact message persistence.
- `backend/Services/QuestionnaireService.cs`: question definitions, validation, scoring.
- `backend/Services/SubmissionRepository.cs`: asynchronous JSON file persistence.
- `backend/Models/`: request/response contracts.
- `js_projekt/questionnaire.js`: API loading, submission, result rendering, and error states.

## API

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/api/health` | Health status |
| POST | `/api/contact` | Validate and store a contact message; return 201 with a receipt |
| GET | `/api/questionnaire` | Five questions and allowed value range |
| POST | `/api/questionnaire/submissions` | Validate, score, persist; return 201 with result and Location header |
| GET | `/api/questionnaire/submissions/{id}` | Retrieve result; unknown IDs return 404 |

Submission body:

```json
{"answers":{"q1":1,"q2":2,"q3":3,"q4":4,"q5":5}}
```

All five known question IDs are required, with integer values 1–5. Invalid bodies return HTTP 400 Problem Details. Scores range from 5–25, with suggestions for bands 5–11, 12–18, and 19–25. This is a demonstration, not a validated assessment. Submissions are limited to 30 per minute per remote IP and a 4 KB body.

## Storage and deployment

Each submission is saved atomically as a JSON file in `App_Data/submissions` beside the running application. Results survive restarts. Configure a stable writable directory with the `SubmissionStorage__Path` environment variable, especially for deployment. Back up that directory separately from application binaries.

Results are anonymous and accessible to anyone with the random result ID/link; there are no accounts or public listing endpoints. This proof of concept has no retention cleanup or administrative UI. Add authentication and a database before using it for private or larger-scale surveys.

`dotnet publish backend/Portfolio.Api.csproj -c Release` packages explicitly selected public files into `wwwroot`. Repository files, FTP notes, C# exercises, tests, and design documents are not served. Use HTTPS at your hosting reverse proxy. No permissive CORS policy is needed because the frontend and API share an origin.

## Verification

With the backend running:

```powershell
node js_projekt/questionnaire.test.cjs
```

Set `API_BASE_URL` to test another local backend port. The checks cover scoring boundaries, invalid payloads, saved results, public assets, and private-file isolation.

## Contact form

Open `/kontakt.html`. The form calls `POST /api/contact` with a JSON object containing `name`, `email`, `subject`, and `message`. All fields are required. Limits are 100 characters for name, 254 for email, 150 for subject, and 4000 for message. Invalid input returns 400 Problem Details, oversized request bodies return 413, and the contact endpoint allows 10 requests per minute per IP (429 when exceeded).

Messages are saved atomically to `App_Data/contacts` beside the running application. Configure `ContactStorage__Path` for a stable writable directory outside `wwwroot`. There is no public message retrieval/listing API. Review the JSON files locally; email delivery is not configured. The form explicitly describes this behavior and retains entered text on failure.

## Security and hosting

Both storage paths are checked at startup: placing them inside `wwwroot` stops the application. Keep their physical directories outside public hosting folders too; do not link public folders to private storage through symlinks or junctions. Restrict directory access to the application account and administrators.

Submission and receipt IDs use `Guid.NewGuid()` as identifiers, not encryption keys or authentication tokens. Questionnaire links disclose the saved answers to anyone who has the link. Do not collect sensitive answers without adding authentication and access checks. If encryption or password-reset tokens are added later, use purpose-built cryptographic APIs rather than GUIDs or `Random`.

Responses disable MIME sniffing and framing, suppress referrers, and omit the Kestrel server banner. Saved-answer reads and successful submissions use `Cache-Control: no-store`. These protections do not replace HTTPS or access control.

Bind the application to loopback behind an HTTPS reverse proxy. Configure allowed host names and connection/request limits at the proxy, and keep the .NET runtime patched. Rate limits currently use the direct connection IP; behind a proxy clients may share one limit. Forwarded headers are not trusted by this application. If per-client proxy limits are needed, enforce them at the proxy or configure only explicitly trusted proxies in ASP.NET Core. Add storage quotas and retention cleanup before exposing these anonymous write endpoints to significant traffic; per-IP limits alone do not prevent distributed disk exhaustion.

After building, run `node backend/security.test.cjs` to run the API/contact suites against an isolated local server and verify storage rejection, security headers, cache protection, and submission rate limits. This check uses port 5097 and temporary synthetic data.

Run `node backend/contact.test.cjs` with the default Debug backend running. If storage is configured elsewhere, set `CONTACT_STORAGE_PATH` for the test. These checks create a synthetic message and cover validation, storage, request limits, and file isolation.
