import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore if restricted
}
import mongoose from 'mongoose';
import { ServerConfig } from '../config/server.config.js';

const cleanDuplicateDevices = async () => {
  try {
    const collection = mongoose.connection.db.collection('deviceapprovals');
    
    // Find all duplicate user-device combinations
    const duplicates = await collection.aggregate([
      {
        $group: {
          _id: { userId: "$userId", deviceId: "$deviceId" },
          count: { $sum: 1 },
          records: { $push: "$$ROOT" }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]).toArray();

    if (duplicates.length === 0) return;

    console.log(`[CLEANUP] Found ${duplicates.length} duplicate device sets. Cleaning up...`);

    for (const doc of duplicates) {
      // Sort to keep the best record: active first, then approved, then latest requested
      const sorted = doc.records.sort((a, b) => {
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        if (a.status === "approved" && b.status !== "approved") return -1;
        if (a.status !== "approved" && b.status === "approved") return 1;
        return new Date(b.requestedAt) - new Date(a.requestedAt);
      });

      const toDelete = sorted.slice(1).map(r => r._id);
      await collection.deleteMany({ _id: { $in: toDelete } });
    }
    console.log('[CLEANUP] Duplicate device records cleanup complete.');
  } catch (err) {
    console.error('❌ Error cleaning duplicate devices:', err.message);
  }
};

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(ServerConfig.mongoURI);
    console.log('✅ Connected to MongoDB');
    // Run cleanup on startup
    await cleanDuplicateDevices();
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
};
