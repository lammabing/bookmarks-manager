import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Bookmark from './models/Bookmark.js';

dotenv.config();

const args = process.argv.slice(2);
const email = args.find(a => a.startsWith('--email='))?.split('=')[1];
const autoRemove = args.includes('--remove');
const help = args.includes('--help');

function showHelp() {
  console.log(`
Usage: node deduplicate-bookmarks.js [options]

Find and manage duplicate bookmarks (same URL per user).

Options:
  --email=<email>   Scan duplicates only for the given user
  --remove          Automatically remove duplicates (keep the best one)
  --help            Show this help message

Without --email, scans all users.
Without --remove, only lists duplicates without deleting.
`);
}

async function deduplicate() {
  if (help) {
    showHelp();
    process.exit(0);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    let users;
    if (email) {
      const user = await User.findOne({ email });
      if (!user) {
        console.error(`No user found with email: ${email}`);
        await mongoose.connection.close();
        process.exit(1);
      }
      users = [user];
    } else {
      users = await User.find({});
    }

    console.log(`Scanning ${users.length} user(s) for duplicate bookmarks...\n`);

    let totalDuplicates = 0;
    let totalRemoved = 0;

    for (const user of users) {
      const bookmarks = await Bookmark.find({ owner: user._id }).lean();

      // Group by URL
      const grouped = {};
      for (const bm of bookmarks) {
        const url = bm.url?.trim().toLowerCase();
        if (!url) continue;
        if (!grouped[url]) grouped[url] = [];
        grouped[url].push(bm);
      }

      const duplicateUrls = Object.entries(grouped).filter(([, bms]) => bms.length > 1);

      if (duplicateUrls.length === 0) {
        console.log(`  ✓ ${user.email} (${user.username}): No duplicates found`);
        continue;
      }

      console.log(`  ✗ ${user.email} (${user.username}): ${duplicateUrls.length} URL(s) with duplicates`);
      let userRemoved = 0;

      for (const [url, bms] of duplicateUrls) {
        // Sort by completeness: prefer ones with description, notes, then by creation date
        bms.sort((a, b) => {
          const scoreA = (a.description ? 2 : 0) + (a.notes ? 1 : 0) + (a.tags?.length || 0);
          const scoreB = (b.description ? 2 : 0) + (b.notes ? 1 : 0) + (b.tags?.length || 0);
          if (scoreB !== scoreA) return scoreB - scoreA;
          return new Date(a.createdAt) - new Date(b.createdAt);
        });

        const keep = bms[0];
        const remove = bms.slice(1);

        console.log(`       URL: ${keep.url}`);
        console.log(`       Keeping: "${keep.title}" (${keep._id})`);
        for (const dup of remove) {
          console.log(`       Removing: "${dup.title}" (${dup._id})`);
        }

        if (autoRemove) {
          const ids = remove.map(b => b._id);
          const result = await Bookmark.deleteMany({ _id: { $in: ids } });
          userRemoved += result.deletedCount;
          console.log(`       → Removed ${result.deletedCount} duplicate(s)\n`);
        } else {
          console.log('');
        }
      }

      totalDuplicates += duplicateUrls.length;
      totalRemoved += userRemoved;
    }

    console.log('─── Summary ───');
    console.log(`Users scanned: ${users.length}`);
    console.log(`URLs with duplicates: ${totalDuplicates}`);
    if (autoRemove) {
      console.log(`Duplicates removed: ${totalRemoved}`);
    } else {
      console.log('Run with --remove to delete duplicates (keeps the most complete bookmark)');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

deduplicate();
