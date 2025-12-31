# Khalifa Management Suite - AI Agent Instructions

## Project Architecture

This is a **monorepo** with three distinct applications:

1. **khalifa-mgmt/** - Next.js 16 trustee management dashboard (React 19, TypeScript, MongoDB)
2. **intake-form-app/** - Standalone client intake system (React 18 CRA frontend + Express backend)
3. **valuecell/** - Separate trading/agent system (Python-based, distinct project)

## Critical Startup Pattern

**ALWAYS use the unified startup scripts** - never start services individually:

```bash
cd khalifa-mgmt
./start-dev.sh    # Starts ALL services (khalifa-mgmt + intake-form-app + MongoDB)
./stop-dev.sh     # Stops everything cleanly
```

The `start-dev.sh` script:
- Checks MongoDB health (docker container `khalifa-mgmt-mongo`)
- Auto-fixes common errors (kills orphaned Next.js processes)
- Starts khalifa-mgmt (port 3001)
- Starts intake-form-app frontend (port 3006) and backend (port 4000)
- Validates all services are responsive

**Never run** `npm run dev` directly in khalifa-mgmt or intake-form-app directories - this bypasses critical infrastructure checks.

## Database Architecture

### Two Separate MongoDB Databases

1. **khalifa-mgmt database** (port 27018):
   - Used by Next.js app
   - Collections: `users`, `clients`, `invoices`, `documents`, `tasks`, `notifications`
   - Connection: `mongodb://localhost:27018/khalifa-mgmt` (dev) or `mongodb://khalifa-mongo:27017/khalifa-mgmt` (docker)

2. **khalifa_intake database** (same MongoDB, different DB):
   - Used by intake-form-app backend
   - Collection: `intake_forms`
   - Connection: `mongodb://localhost:27018/khalifa_intake` or `mongodb://intake-mongo:27017/khalifa_intake`

### MongoDB Connection Pattern

All connections use the **cached singleton pattern** in [../khalifa-mgmt/src/lib/dbConnect.ts](../khalifa-mgmt/src/lib/dbConnect.ts):
- Caches connection globally to prevent hot-reload connection leaks
- MUST call `dbConnect()` in ALL API routes before using mongoose models
- Models are defined with `mongoose.models.X || mongoose.model()` pattern to prevent redefinition errors

## Next.js 16 App Router Conventions

### API Routes (Route Handlers)

Located in `khalifa-mgmt/src/app/api/*/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export async function GET(req: NextRequest) {
  await dbConnect(); // ALWAYS call first
  // ... use mongoose models
  return NextResponse.json(data);
}
```

**Dynamic segments**: Use `[param]/route.ts` with `params` prop:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Next.js 16 requires awaiting params
}
```

### Pages

Located in `khalifa-mgmt/src/app/**/page.tsx`:
- All pages use **"use client"** directive (this is a client-heavy dashboard app)
- Authentication via NextAuth: `const { data: session } = useSession()`
- Session structure: `session.user.email` (NOT `session.user.id` - NextAuth default only provides email/name/image)

### Components

Located in `khalifa-mgmt/src/components/`:
- Use MUI v7 (Material-UI) for UI components
- **MUI v7 Grid breaking change**: Some Grid props changed; use `sx={{}}` prop if errors occur
- Custom layout: [Layout.tsx](../khalifa-mgmt/src/components/layout/Layout.tsx) wraps pages with Navbar
- Auth-gated: Navbar checks `useSession()` and shows login/user menu accordingly

## Document Management System

**Full-featured PDF document generation and signing** - see [../khalifa-mgmt/documentation/DOCUMENT_SYSTEM_COMPLETE.md](../khalifa-mgmt/documentation/DOCUMENT_SYSTEM_COMPLETE.md).

### Key Services

1. **pdfGenerationService** ([../khalifa-mgmt/src/lib/pdfGenerationService.ts](../khalifa-mgmt/src/lib/pdfGenerationService.ts)):
   - Generates PDFs from intake form data
   - Uses `pdf-lib` to create/modify PDFs
   - Creates Trust documents, Beneficiary forms, Asset schedules

2. **storageService** ([../khalifa-mgmt/src/lib/storageService.ts](../khalifa-mgmt/src/lib/storageService.ts)):
   - Stores PDFs in `khalifa-mgmt/storage/documents/`
   - Stores signatures in `khalifa-mgmt/storage/signatures/`
   - Local filesystem storage (no S3/cloud currently)

3. **emailService** ([../khalifa-mgmt/src/lib/emailService.ts](../khalifa-mgmt/src/lib/emailService.ts)):
   - Sends document notifications via nodemailer
   - Configure SMTP in `.env.local`

### Document Workflow

```
Intake Form Submission → intakeProcessor.ts → pdfGenerationService
→ Document saved to storage/ → Email notification → Document record in MongoDB
```

Access via `/documents` page with DocumentViewer component (react-pdf) and SignaturePad (signature_pad).

## Intake System Integration

**Two intake implementations** (being consolidated):

1. **Standalone intake-form-app**: Separate React + Express app, own MongoDB, submits to `POST /api/intake`
2. **Embedded intake**: [../khalifa-mgmt/src/app/intake/page.tsx](../khalifa-mgmt/src/app/intake/page.tsx) - integrated intake form within Next.js app

Both submit to the **intake-form-app backend** at `http://localhost:4000/api/intake`. The Next.js app uses authenticated user's email as `userId`.

**Data flow**: See [../khalifa-mgmt/documentation/INTAKE_DATA_FLOW.md](../khalifa-mgmt/documentation/INTAKE_DATA_FLOW.md) for complete submission → storage → retrieval flow.

## Invoice System

**Complete invoicing** with client linking - see [../khalifa-mgmt/documentation/INVOICE_QUICK_REFERENCE.md](../khalifa-mgmt/documentation/INVOICE_QUICK_REFERENCE.md).

- API: `/api/invoices` and `/api/invoices/[invoiceId]`
- Model: [../khalifa-mgmt/src/models/Invoice.ts](../khalifa-mgmt/src/models/Invoice.ts)
- Features: Dynamic line items, status tracking (Pending/Paid/Overdue/Cancelled), client relationships

## Error Handling & Auto-Fix

**Automated error fixing script**: [../khalifa-mgmt/scripts/auto-fix-errors.sh](../khalifa-mgmt/scripts/auto-fix-errors.sh)

Detects and fixes **23 error categories** automatically (was 20, added 3 new):
- NextAuth session type errors (`session.user.id` → `session.user.email`)
- MUI v7 Grid component migration (`item xs={12}` → `size={{ xs: 12 }}`)
- TypeScript type assertions for optional fields
- Missing imports and type definitions
- MongoDB connection string validation
- Infrastructure health checks (container status, MongoDB connectivity)
- Select component onChange handlers
- Invalid tsconfig references
- **Next.js 16 params await pattern** (NEW)
- **Buffer to BodyInit type conversion** (NEW)
- **IDocument interface property mapping** (NEW)

**Usage**:
```bash
cd khalifa-mgmt
./scripts/auto-fix-errors.sh
```

Script features:
- Auto-detects errors via `npx tsc --noEmit`
- Applies intelligent fixes with pattern matching
- Logs all changes to `.error-fixes.log`
- Validates fixes by re-running compilation
- Returns exit code for CI/CD integration

**Daily workflow**:
```bash
# 1. Make code changes
# 2. Run auto-fix
./scripts/auto-fix-errors.sh
# 3. Review fixes in .error-fixes.log
# 4. Commit
```

See [../khalifa-mgmt/documentation/ERROR_AUTO_FIX_GUIDE.md](../khalifa-mgmt/documentation/ERROR_AUTO_FIX_GUIDE.md) for all 23 categories.

## Testing

Comprehensive test suite in [../tests/](../tests/) directory:

```bash
cd tests
./test-runner.sh                    # All integration tests
node performance-load-test.js       # Load testing
```

Tests cover:
- Service health checks (all containers)
- API endpoint CRUD operations
- Frontend-backend communication
- Database operations
- Performance metrics

**Document-specific tests**:
```bash
cd khalifa-mgmt
npm run test:pdf        # Test PDF generation
npm run test:documents  # Test document management
```

## Advanced Features

### Stirling PDF Integration

**Stirling PDF service** runs on port 8080 for PDF operations. See [../khalifa-mgmt/documentation/STIRLING_PDF_INTEGRATION.md](../khalifa-mgmt/documentation/STIRLING_PDF_INTEGRATION.md).

- Service: `stirling-pdf` container at `http://localhost:8080`
- Server actions: [../khalifa-mgmt/src/lib/pdfOperations.ts](../khalifa-mgmt/src/lib/pdfOperations.ts)
- Components: [../khalifa-mgmt/src/components/PdfComponents.tsx](../khalifa-mgmt/src/components/PdfComponents.tsx)
- Operations: merge, split, compress, watermark, extract, rotate, images-to-pdf

**Usage in any component**:
```typescript
import { mergePdfs, compressPdf, addWatermark } from '@/lib/pdfOperations';

// Merge PDFs
const result = await mergePdfs([file1, file2]);

// Add watermark
const watermarked = await addWatermark(file, 'CONFIDENTIAL', 0.3);
```

### Client Portal Architecture (Planned)

Future split into **Admin Portal** (`/admin/*`) and **Client Portal** (`/client/*`) using Next.js route groups. See [../khalifa-mgmt/documentation/CLIENT_PORTAL_PLAN.md](../khalifa-mgmt/documentation/CLIENT_PORTAL_PLAN.md).

- Admin: Full trustee dashboard (current implementation)
- Client: End-user view with intake, documents, messages
- Middleware-based role protection
- Separate layouts and theming

## Environment Configuration

Required `.env.local` files:

**khalifa-mgmt/.env.local**:
```env
MONGODB_URI=mongodb://localhost:27018/khalifa-mgmt
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional: Email service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**intake-form-app/backend/.env.local**:
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27018/khalifa_intake
CORS_ORIGIN=http://localhost:3006
```

**intake-form-app/frontend/.env.local**:
```env
REACT_APP_API_URL=http://localhost:4000
```

## Python Environment (valuecell/)
**Start services**: `cd khalifa-mgmt && ./start-dev.sh` (never `npm run dev` directly)
2. **Make code changes**: Edit files as needed
3. **Auto-fix errors**: `./scripts/auto-fix-errors.sh` (fixes 20+ error types)
4. **Review fixes**: `cat .error-fixes.log` to see what changed
5. **Test**: Run `cd tests && ./test-runner.sh` or specific test scripts
6. **Check MongoDB**: Logs show connection health automatically
7. **Commit**: Document changes referencing relevant docs in `documentation/`

**Quick reference docs**:
- Daily workflow: [../khalifa-mgmt/documentation/DEVELOPMENT_WORKFLOW.md](../khalifa-mgmt/documentation/DEVELOPMENT_WORKFLOW.md)
- Startup guide: [../khalifa-mgmt/documentation/STARTUP_QUICK_REF.md](../khalifa-mgmt/documentation/STARTUP_QUICK_REF.md)
- Error fixes: [../khalifa-mgmt/documentation/ERRORS_QUICK_REF.md](../khalifa-mgmt/documentation/ERRORS_QUICK_REF.md)
- Complete index: [../khalifa-mgmt/documentation/DOCUMENTATION_INDEX.md](../khalifa-mgmt/documentation/DOCUMENTATION_INDEX.md)
- Prefer async APIs for I/O operations

## Common Gotchas

1. **Port conflicts**: khalifa-mgmt tries port 3000 first, falls back to 3001. Docker uses 3001 consistently.
2. **Model redefinition errors**: Always use `mongoose.models.X || mongoose.model()` pattern
3. **NextAuth typing**: Default session only has `user.email`, `user.name`, `user.image` - extend types in `next-auth.d.ts` if needed
4. **MUI v7 changes**: Grid component API changed; consult errors and add `sx={{}}` when needed
5. **Next.js 16 params**: Must await `params` in dynamic route handlers
6. **Database confusion**: khalifa-mgmt uses `khalifa-mgmt` DB, intake-form-app uses `khalifa_intake` DB (both on same MongoDB instance)
7. **Container naming**: MongoDB containers use `khalifa-mgmt-mongo` and `intake-form-app-mongo` - not `khalifa-mongo`
8. **Smart rebuilds**: start-dev.sh detects code changes and only rebuilds when needed (65% faster on warm starts)

## Development Workflow

1. Always use `./start-dev.sh` to start services
2. Run `./scripts/auto-fix-errors.sh` after code changes
3. Check logs in terminal for MongoDB connectivity
4. Test with comprehensive test suite in `tests/`
5. Document major changes in `khalifa-mgmt/documentation/`

## Documentation Index

- **Quick starts**: See root [../README.md](../README.md) and [../khalifa-mgmt/README.md](../khalifa-mgmt/README.md)
- **Document system**: [../khalifa-mgmt/documentation/DOCUMENT_INDEX.md](../khalifa-mgmt/documentation/DOCUMENT_INDEX.md)
- **Intake system**: [../khalifa-mgmt/documentation/INTAKE_INDEX.md](../khalifa-mgmt/documentation/INTAKE_INDEX.md)
- **Invoices**: [../khalifa-mgmt/documentation/INVOICE_SYSTEM_SUMMARY.md](../khalifa-mgmt/documentation/INVOICE_SYSTEM_SUMMARY.md)
- **Error handling**: [../khalifa-mgmt/documentation/ERROR_AUTO_FIX_GUIDE.md](../khalifa-mgmt/documentation/ERROR_AUTO_FIX_GUIDE.md)
- **All docs**: See [../khalifa-mgmt/documentation/](../khalifa-mgmt/documentation/) for 30+ reference guides
