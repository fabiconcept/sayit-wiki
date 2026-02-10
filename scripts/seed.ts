// MongoDB Seed Script - TypeScript version with native MongoDB driver
// Install: npm install mongodb dotenv
// Install types: npm install -D @types/node
// Run: tsx seed-mongodb.ts or ts-node seed-mongodb.ts

import { MongoClient, ObjectId, Db } from 'mongodb';
import { config } from 'dotenv';
import path from 'path';
import { ClipType } from '@/components/ui/Clip';
import { NoteStyle } from '@/types/note';
import { FontFamily } from '@/constants/fonts';

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

const noteContents = [
    "my therapist told me I have 'avoidant attachment' but honestly I think she's just clingy",
    "fish microwaver: your mom doesn't love you",
    "I'm 32 and still don't know how to network professionally without feeling like a fraud",
    "your dog is NOT your child",
    "been lying on my resume for 6 years",
    "sometimes I go to the grocery store just to feel less alone",
    "crypto bros = astrology girls for men",
    "???",
    "I ghost people because I genuinely forget they exist",
    "my coworker chews so loud I've fantasized about quitting",
    "reddit mods lol",
    "47k debt. work at costco. happy.",
    "being 'brutally honest' is just being an asshole",
    "cried in therapy. she cried too. we both cried.",
    "rude to waitstaff = worse than criminals",
    "introverts are just rude",
    "working from the beach for 8 months. employer doesn't know.",
    "squidward was right",
    "beans",
    "don't want kids. family thinks I'm in a cult.",
    "$200 on self-help books. still a mess.",
    "mental illness isn't an excuse tho",
    "waiting for my turn to leave",
    "dumped someone over my cat. no regrets.",
    "music in public without headphones = jail",
    "being busy isn't a personality",
    "astrology is fake but I still check compatibility",
    "?????",
    "manchild vs womanchild double standard is real",
    "my love language is leaving you alone",
    "just say you don't know things",
    "situationship: 9 months",
    "h",
    "actually answer 'how are you' challenge",
    "sorry sorry sorry sorry (trauma)",
    "gym grunters shut UP",
    "pineapple pizza is fine you're boring",
    "I'm not busy I just don't like you",
    "LinkedIn = Facebook in a suit",
    "pandemic showed who actually likes their family lol",
    "adulting is saying 'after this week' until death",
    "people who are always nice are hiding something",
    "my screen time report attacked me personally",
    "hustle culture is capitalism gaslighting",
    "I peaked in high school",
    "rerack your weights you animals",
    "pretending I'm the main character helps",
    "Spotify: 87% sad music. yeah.",
    "low maintenance = gave up",
    "political opinions don't matter if you don't vote",
    "work 40 years then die",
    "what",
    "pronouns are fine. superiority complex is not.",
    "gen Z calling us old WHEN WE INVENTED THIS",
    "confidence is just faking it forever",
    "rent $2400 salary $3000",
    "anyone else or",
    "I hate it here but also I'm staying",
    "normalize",
    "the way I",
    "no thoughts head empty",
    "существование это боль",
    "gonna tell my kids this was",
    "not me reading this at 3am",
    "this is a wendy's sir",
    "electric cars are still cars. you're not saving the planet Karen you're just rich",
    "beep",
    "I don't dream of labor",
    "????? what ?????",
    "touch grass they said. there's bugs out there.",
    "my FBI agent is tired",
    "unsubscribe from life",
    "a",
    "commitment issues or just standards? discuss.",
    "everyone's trauma response is fight/flight/fawn and mine is just sleep apparently",
    "bro",
    "influencers are just salespeople who don't call themselves salespeople",
    "sometimes I lie about reading books I never read",
    "the masculine urge to",
    "girl dinner: crackers depression",
    "why is parking $40",
    "I lied on this post",
];

const commentContents = [
    "bestie you need therapy",
    "unhinged",
    "finally someone said it",
    "delete this",
    "are you okay?",
    "no literally same",
    "????",
    "seek help",
    "FELT",
    "valid",
    "why",
    "I'm calling the police",
    "red flag",
    "narcissist behavior",
    "this ain't it",
    "you're the problem",
    "bold",
    "uncomfortable",
    "therapy exists",
    "this is why",
    "projecting",
    "get well soon",
    "lmao",
    "shut up",
    "whiplash",
    "questions",
    "therapist not us",
    "didn't ask",
    "mess",
    "brave I guess",
    "no",
    "scared",
    "not the flex",
    "concerning",
    "delete",
    "what",
    "bestie",
    "fr",
    "real",
    "REAL",
    "cap",
    "based",
    "cringe",
    "L",
    "W",
    "ratio",
    "this you?",
    "yikes",
    "oof",
    "oh",
];

const backgroundColors = [
    '#FFE066', '#FFB3BA', '#BAE1FF', '#BAFFC9', '#FFD4BA',
    '#E0BBE4', '#FFDFD3', '#C7CEEA', '#B5EAD7', '#FFDAC1',
    '#E2F0CB', '#FEC8D8', '#D4E4BC', '#FFE5CC', '#E8DAEF',
    '#C5E3F6', '#FFE6E6', '#D5E8D4', '#FFF4E6', '#E6F3FF',
];

const noteStyles = Array.from(Object.values(NoteStyle));
const clipTypes = Array.from(Object.values(ClipType));
const fonts = Array.from(Object.values(FontFamily));
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