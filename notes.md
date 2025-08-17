DATABASE_URL="postgresql://insightos_app:Upwork!1iOS@localhost:5432/insightos?schema=public"

```json
{
  "name": "insightos",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@prisma/client": "^6.13.0",
    "bcryptjs": "^3.0.2",
    "next": "15.4.6",
    "prisma": "^6.13.0",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.4.6",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-unused-imports": "^4.1.4",
    "prettier": "^3.6.2",
    "tailwindcss": "^4",
    "ts-node": "^10.9.2",
    "tsx": "^4.20.3",
    "typescript": "^5"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts",
    "seed": "tsx prisma/seed.ts"
  }
}
```
