// MongoDB Seed Script - TypeScript version with native MongoDB driver
// Install: npm install mongodb dotenv
// Install types: npm install -D @types/node
// Run: tsx seed-mongodb.ts or ts-node seed-mongodb.ts

import { MongoClient, ObjectId, Db } from 'mongodb';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sayit-wiki';
const DATABASE_NAME = 'sayit-wiki';

// Types
interface Note {
    _id: ObjectId;
    userId: string;
    content: string;
    backgroundColor: string;
    noteStyle: string;
    clipType: string;
    tilt: number;
    selectedFont: string;
    timestamp: Date;
    likesCount: number;
    commentsCount: number;
    viewsCount: number;
    isDeleted: boolean;
    isTakenDown: boolean;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

interface Comment {
    _id: ObjectId;
    noteId: ObjectId;
    userId: string;
    content: string;
    backgroundColor: string;
    noteStyle: string;
    clipType: string;
    selectedFont: string;
    tilt: number;
    timestamp: Date;
    likesCount: number;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

interface Like {
    _id: ObjectId;
    userId: string;
    targetId: ObjectId;
    targetType: 'note' | 'comment';
    createdAt: Date;
    __v: number;
}

interface View {
    _id: ObjectId;
    userId: string;
    noteId: ObjectId;
    createdAt: Date;
    __v: number;
}

interface Report {
    _id: ObjectId;
    reporterId: string;
    targetId: ObjectId;
    targetType: 'note' | 'comment';
    reason: string;
    status: 'pending' | 'resolved' | 'ignored';
    resolvedAt: Date | null;
    resolvedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

// Sample data arrays
const noteContents = [
    "Remember to buy groceries: milk, eggs, bread, and coffee",
    "Meeting with the team at 3 PM tomorrow",
    "Birthday gift ideas: books, headphones, or a nice plant",
    "Don't forget to water the plants this weekend",
    "Movie night: Inception, The Matrix, or Interstellar?",
    "Workout routine: 30 min cardio, 20 min weights, 10 min stretch",
    "Book recommendations: Atomic Habits, Deep Work, The Alchemist",
    "Weekend plans: hiking, brunch, or museum visit?",
    "Learn a new skill: cooking, photography, or coding",
    "Travel bucket list: Japan, Iceland, New Zealand",
    "Favorite quotes: 'Be yourself; everyone else is already taken'",
    "Recipe idea: homemade pizza with fresh basil",
    "Music playlist: jazz, lo-fi, or classical?",
    "Project deadline: finish presentation by Friday",
    "Call Mom this Sunday",
    "Fix the leaky faucet in the bathroom",
    "Organize desk and clean workspace",
    "Try that new coffee shop downtown",
    "Start reading that book everyone's talking about",
    "Plan summer vacation - beach or mountains?",
    "Learn to play guitar - practice 30 mins daily",
    "Meditation goal: 10 minutes every morning",
    "Take more photos and document memories",
    "Write thank you notes to friends",
    "Declutter closet and donate old clothes",
    "Try cooking a new recipe every week",
    "Join a local sports club or gym",
    "Start a journal and write daily thoughts",
    "Learn a new language - Spanish or French?",
    "Volunteer at local community center",
    "Watch that documentary series on Netflix",
    "Update resume and LinkedIn profile",
    "Practice public speaking skills",
    "Create a budget and track expenses",
    "Plant a small herb garden on the balcony",
    "Fix bike and start cycling to work",
    "Attend that workshop next month",
    "Reconnect with old friends",
    "Set up automatic bill payments",
    "Research investment opportunities",
    "Plan a surprise for someone special",
    "Learn to bake sourdough bread",
    "Take an online course on something interesting",
    "Reduce screen time before bed",
    "Create a morning routine that sticks",
    "Try intermittent fasting for health",
    "Go stargazing this weekend if weather permits",
    "Write down 3 things I'm grateful for daily",
    "Learn basic home repairs",
    "Organize all digital files and photos",
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "Coffee: because adulting is hard",
    "Today's mood: procrastinating productively",
    "Mental note: stop overthinking everything",
    "Life hack: take naps seriously",
    "Current status: living for the weekend",
    "Fun fact: I can't adult today, please don't make me adult",
    "Reminder: be kind to yourself",
    "Note to self: you're doing great",
    "Thought of the day: pizza fixes everything",
    "Random wisdom: sometimes you just need a good laugh",
    "PSA: hydration is important, drink water!",
    "Breaking news: I need more coffee",
    "Weather forecast: 100% chance of staying in bed",
    "Today's agenda: survive",
    "Life update: still figuring it out",
    "Mood: caffeinated and motivated",
    "Status: professionally procrastinating",
    "Announcement: taking a mental health day",
    "Important: snacks are a necessity, not a luxury",
    "Quick note: dancing in the kitchen is underrated",
    "Friendly reminder: mistakes are proof that you're trying",
    "Hot take: afternoon naps should be mandatory",
    "Observation: life is better with music",
    "Truth bomb: you don't need permission to be yourself",
    "Deep thought: maybe the real treasure is the memes we made along the way",
    "Reality check: it's okay to not have everything figured out",
    "Wisdom: laughter is the best medicine (and also pizza)",
    "Philosophy: if you can dream it, you can probably Google how to do it",
    "Life lesson: comparison is the thief of joy",
];

const commentContents = [
    "Great idea! Thanks for sharing!",
    "I totally agree with this",
    "This is so helpful, saved!",
    "Exactly what I needed to hear today",
    "Love this! 💯",
    "Can relate to this so much",
    "This made my day better",
    "Wise words right here",
    "Thanks for the reminder!",
    "This is gold ✨",
    "Needed to see this today",
    "So true! Same here",
    "Amazing! Keep it up",
    "This resonates with me",
    "Brilliant thought!",
    "Could not agree more",
    "This is everything",
    "Saving this for later",
    "You're so right about this",
    "Spot on! 👏",
    "This is genius",
    "Exactly my thoughts",
    "Well said!",
    "This speaks to me",
    "Couldn't have said it better",
    "This is important",
    "Yes! This!",
    "Absolutely love this",
    "This is perfect",
    "So good! Thanks",
];

const backgroundColors = [
    '#FFE066', '#FFB3BA', '#BAE1FF', '#BAFFC9', '#FFD4BA',
    '#E0BBE4', '#FFDFD3', '#C7CEEA', '#B5EAD7', '#FFDAC1',
    '#E2F0CB', '#FEC8D8', '#D4E4BC', '#FFE5CC', '#E8DAEF',
    '#C5E3F6', '#FFE6E6', '#D5E8D4', '#FFF4E6', '#E6F3FF',
];

const noteStyles = ['SPIRAL_LEFT', 'SPIRAL_TOP', 'TORN_EDGES', 'CLEAN'];
const clipTypes = ['Binder', 'Staple', 'Pin', 'Tape'];
const fonts = ['Schoolbell', 'Caveat', 'Kalam', 'Patrick Hand', 'Indie Flower'];
const reportReasons = [
    'Inappropriate content',
    'Spam or advertising',
    'Offensive language',
    'Misleading information',
    'Harassment or bullying',
];

// Helper functions
function randomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateUserId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `user-${timestamp}-${random}`;
}

// Generate fake user IDs
const userIds = Array.from({ length: 50 }, generateUserId);

async function clearDatabase(db: Db): Promise<void> {
    console.log('🗑️  Clearing existing data...');
    await db.collection('notes').deleteMany({});
    await db.collection('comments').deleteMany({});
    await db.collection('likes').deleteMany({});
    await db.collection('views').deleteMany({});
    await db.collection('reports').deleteMany({});
    console.log('✅ Database cleared\n');
}

async function seedNotes(db: Db, count: number): Promise<Note[]> {
    console.log(`📝 Creating ${count} notes...`);
    const notes: Note[] = [];
    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < count; i++) {
        const note: Note = {
            _id: new ObjectId(),
            userId: randomItem(userIds),
            content: randomItem(noteContents),
            backgroundColor: randomItem(backgroundColors),
            noteStyle: randomItem(noteStyles),
            clipType: randomItem(clipTypes),
            tilt: randomInt(-4, 4),
            selectedFont: randomItem(fonts),
            timestamp: randomDate(threeMonthsAgo, now),
            likesCount: randomInt(0, 100),
            commentsCount: 0,
            viewsCount: randomInt(10, 500),
            isDeleted: false,
            isTakenDown: false,
            createdAt: randomDate(threeMonthsAgo, now),
            updatedAt: now,
            __v: 0
        };
        notes.push(note);

        if ((i + 1) % 50 === 0) {
            console.log(`   Created ${i + 1}/${count} notes...`);
        }
    }

    await db.collection('notes').insertMany(notes);
    console.log(`✅ Created ${notes.length} notes\n`);
    return notes;
}

async function seedComments(db: Db, notes: Note[], avgCommentsPerNote: number): Promise<Comment[]> {
    console.log(`💬 Creating comments (avg ${avgCommentsPerNote} per note)...`);
    const comments: Comment[] = [];
    const now = new Date();

    for (const note of notes) {
        const numComments = Math.max(0, Math.floor(Math.random() * avgCommentsPerNote * 2));

        for (let i = 0; i < numComments; i++) {
            const comment: Comment = {
                _id: new ObjectId(),
                noteId: note._id,
                userId: randomItem(userIds),
                content: randomItem(commentContents),
                backgroundColor: randomItem(backgroundColors),
                noteStyle: randomItem(noteStyles),
                clipType: randomItem(clipTypes),
                selectedFont: randomItem(fonts),
                tilt: randomInt(-4, 4),
                timestamp: randomDate(note.timestamp, now),
                likesCount: randomInt(0, 30),
                isDeleted: false,
                createdAt: randomDate(note.timestamp, now),
                updatedAt: now,
                __v: 0
            };
            comments.push(comment);
        }

        // Update note's comment count
        await db.collection('notes').updateOne(
            { _id: note._id },
            { $set: { commentsCount: numComments } }
        );
    }

    if (comments.length > 0) {
        await db.collection('comments').insertMany(comments);
    }
    console.log(`✅ Created ${comments.length} comments\n`);
    return comments;
}

async function seedLikes(db: Db, notes: Note[], comments: Comment[]): Promise<void> {
    console.log('❤️  Creating likes...');
    const likes: Like[] = [];
    const now = new Date();

    // Likes for notes
    for (const note of notes) {
        const numLikes = Math.min(note.likesCount, randomInt(5, 30));
        const likers = new Set<string>();

        for (let i = 0; i < numLikes; i++) {
            let userId = randomItem(userIds);
            let attempts = 0;
            while (likers.has(userId) && attempts < 10) {
                userId = randomItem(userIds);
                attempts++;
            }
            if (attempts < 10) {
                likers.add(userId);
                likes.push({
                    _id: new ObjectId(),
                    userId,
                    targetId: note._id,
                    targetType: 'note',
                    createdAt: randomDate(note.timestamp, now),
                    __v: 0
                });
            }
        }
    }

    // Likes for comments (first 200)
    const commentsToLike = comments.slice(0, 200);
    for (const comment of commentsToLike) {
        const numLikes = Math.min(comment.likesCount, randomInt(0, 10));
        const likers = new Set<string>();

        for (let i = 0; i < numLikes; i++) {
            let userId = randomItem(userIds);
            let attempts = 0;
            while (likers.has(userId) && attempts < 10) {
                userId = randomItem(userIds);
                attempts++;
            }
            if (attempts < 10) {
                likers.add(userId);
                likes.push({
                    _id: new ObjectId(),
                    userId,
                    targetId: comment._id,
                    targetType: 'comment',
                    createdAt: randomDate(comment.timestamp, now),
                    __v: 0
                });
            }
        }
    }

    if (likes.length > 0) {
        try {
            await db.collection('likes').insertMany(likes, { ordered: false });
        } catch (error) {
            // Ignore duplicate key errors
        }
    }
    console.log(`✅ Created ${likes.length} likes\n`);
}

async function seedViews(db: Db, notes: Note[]): Promise<void> {
    console.log('👀 Creating views...');
    const views: View[] = [];
    const now = new Date();

    for (const note of notes) {
        const numViews = Math.min(note.viewsCount, randomInt(10, 50));
        const viewers = new Set<string>();

        for (let i = 0; i < numViews; i++) {
            let userId = randomItem(userIds);
            let attempts = 0;
            while (viewers.has(userId) && attempts < 10) {
                userId = randomItem(userIds);
                attempts++;
            }
            if (attempts < 10) {
                viewers.add(userId);
                views.push({
                    _id: new ObjectId(),
                    userId,
                    noteId: note._id,
                    createdAt: randomDate(note.timestamp, now),
                    __v: 0
                });
            }
        }
    }

    if (views.length > 0) {
        try {
            await db.collection('views').insertMany(views, { ordered: false });
        } catch (error) {
            // Ignore duplicate key errors
        }
    }
    console.log(`✅ Created ${views.length} views\n`);
}

async function seedReports(db: Db, notes: Note[]): Promise<void> {
    console.log('🚨 Creating reports...');
    const reports: Report[] = [];
    const now = new Date();
    const notesToReport = notes.slice(0, Math.floor(notes.length * 0.05));

    for (const note of notesToReport) {
        const status = randomItem<'pending' | 'resolved' | 'ignored'>(['pending', 'pending', 'pending', 'resolved', 'ignored']);
        reports.push({
            _id: new ObjectId(),
            reporterId: randomItem(userIds),
            targetId: note._id,
            targetType: 'note',
            reason: randomItem(reportReasons),
            status,
            resolvedAt: status === 'resolved' ? randomDate(note.timestamp, now) : null,
            resolvedBy: status === 'resolved' ? randomItem(userIds) : null,
            createdAt: randomDate(note.timestamp, now),
            updatedAt: now,
            __v: 0
        });
    }

    if (reports.length > 0) {
        await db.collection('reports').insertMany(reports);
    }
    console.log(`✅ Created ${reports.length} reports\n`);
}

async function createIndexes(db: Db): Promise<void> {
    console.log('🔧 Creating indexes...');
    
    await db.collection('notes').createIndexes([
        { key: { userId: 1 } },
        { key: { timestamp: -1 } },
        { key: { isDeleted: 1, isTakenDown: 1 } }
    ]);
    
    await db.collection('comments').createIndexes([
        { key: { noteId: 1 } },
        { key: { userId: 1 } },
        { key: { timestamp: -1 } }
    ]);
    
    await db.collection('likes').createIndexes([
        { key: { userId: 1, targetId: 1 }, unique: true },
        { key: { targetId: 1, targetType: 1 } }
    ]);
    
    await db.collection('views').createIndexes([
        { key: { userId: 1, noteId: 1 }, unique: true },
        { key: { noteId: 1 } }
    ]);
    
    await db.collection('reports').createIndexes([
        { key: { targetId: 1, targetType: 1 } },
        { key: { status: 1 } },
        { key: { reporterId: 1 } }
    ]);
    
    console.log('✅ Indexes created\n');
}

async function seed(): Promise<void> {
    const client = new MongoClient(MONGODB_URI);

    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected to MongoDB\n');

        const db = client.db(DATABASE_NAME);

        // Clear existing data
        await clearDatabase(db);

        // Seed data
        console.log('🌱 Starting seed process...\n');

        const notes = await seedNotes(db, 200);
        const comments = await seedComments(db, notes, 5);
        await seedLikes(db, notes, comments);
        await seedViews(db, notes);
        await seedReports(db, notes);
        await createIndexes(db);

        // Summary
        console.log('🎉 Seed completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Notes: ${await db.collection('notes').countDocuments()}`);
        console.log(`   Comments: ${await db.collection('comments').countDocuments()}`);
        console.log(`   Likes: ${await db.collection('likes').countDocuments()}`);
        console.log(`   Views: ${await db.collection('views').countDocuments()}`);
        console.log(`   Reports: ${await db.collection('reports').countDocuments()}`);
        console.log(`   Users: ${userIds.length}`);
        console.log('');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the seed
seed();