# EcoSpark Hub Frontend

Community portal frontend for sharing, reviewing, and discovering sustainability ideas.

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- TanStack Query
- Axios

## Core Features

- Authentication (register/login, role-aware navigation)
- Public Home, Ideas, About, Blog pages
- All Ideas page with:
	- search
	- category filter
	- payment filter (free/paid)
	- author filter (contributor)
	- vote-range filter
	- sorting (recent, top voted, most commented)
	- pagination (10 per page)
- Idea details page:
	- paid/free access logic
	- reddit-style voting (up/down/remove)
	- nested comments + replies
	- watchlist toggle
	- member reviews/ratings
- Role-based dashboards:
	- Member: create idea, submit for review, manage created ideas, purchased ideas
	- Admin: users, ideas moderation, comments, payments, stats

## Environment Variables

Create `.env.local` in this folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Local Setup

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Project Structure (High-Level)

- `src/app` — routes and pages
- `src/components` — reusable UI/layout components
- `src/context` — auth/query providers
- `src/services` — API service layer
- `src/lib` — axios instance and utilities

## Demo Flow (for assignment video)

1. Register a new member
2. Login
3. Create idea (free or paid)
4. Submit idea for review
5. View approved free idea
6. Purchase paid idea and verify access
7. Vote (up/down/remove)
8. Comment and nested reply
9. Member dashboard walkthrough
10. Admin moderation walkthrough
