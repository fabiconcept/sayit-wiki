# Database Seed Script

This directory contains scripts for seeding the database with test data.

## Usage

### Install dependencies first

```bash
npm install
```

### Run the seed script

```bash
npm run seed
```

Or for development environment:

```bash
npm run seed:dev
```

## What gets seeded?

The seed script creates:

- **200 Notes** - Variety of content, styles, colors, and fonts
- **~1000 Comments** - Average of 5 comments per note (varied distribution)
- **Likes** - On both notes and comments
- **Views** - Unique views per user per note
- **Reports** - About 5% of notes get reported
- **50 Fake Users** - Realistic user IDs for testing

## Data Characteristics

- **Timestamps**: Spread across the last 3 months
- **Variety**: Different colors, fonts, note styles, clip types
- **Realistic**: Varied engagement (some notes popular, some not)
- **Safe**: Only creates test data, doesn't affect production

## Environment Variables

Make sure you have `.env.local` set up with:

```env
MONGODB_URI=mongodb://localhost:27017/sayit-wiki
```

## Warning

⚠️ **This script CLEARS ALL EXISTING DATA** before seeding. Use with caution!

## Output

The script provides progress updates and a final summary:

```
📊 Summary:
   Notes: 200
   Comments: 1024
   Likes: 3456
   Views: 5678
   Reports: 10
   Users: 50
```

## Tips

- Run this on a fresh database for testing
- Great for development and demo purposes
- Helps test pagination, infinite scroll, and performance
- Creates realistic data distribution
