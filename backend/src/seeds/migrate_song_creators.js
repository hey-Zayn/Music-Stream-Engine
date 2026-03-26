const mongoose = require("mongoose");
const Song = require("../models/song.model");
const Album = require("../models/album.model");
require("dotenv").config();

const SYSTEM_ADMIN_ID = "system_seed_admin";

const runMigration = async () => {
	try {
		console.log("Connecting to MongoDB...");
		await mongoose.connect(process.env.MONGO_URL);
		console.log("Connected successfully.");

		console.log("Starting migration: Backfilling 'creator' on legacy Songs...");
		const songResult = await Song.updateMany(
			{ $or: [{ creator: { $exists: false } }, { creator: null }] },
			{ $set: { creator: SYSTEM_ADMIN_ID } }
		);
		console.log(`Updated ${songResult.modifiedCount} legacy songs with creator ID: ${SYSTEM_ADMIN_ID}`);

		console.log("Starting migration: Backfilling 'creator' on legacy Albums...");
		const albumResult = await Album.updateMany(
			{ $or: [{ creator: { $exists: false } }, { creator: null }] },
			{ $set: { creator: SYSTEM_ADMIN_ID } }
		);
		console.log(`Updated ${albumResult.modifiedCount} legacy albums with creator ID: ${SYSTEM_ADMIN_ID}`);

		console.log("Migration completed successfully!");
	} catch (error) {
		console.error("Error running migration:", error);
	} finally {
		mongoose.connection.close();
	}
};

runMigration();
