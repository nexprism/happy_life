// routes/chunkUpload.js
import express from "express";
import fs from "fs";
import path from "path";
import crypto from 'crypto';

import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";
import passport from "passport";
import { isContentManager as isAdmin } from "../middlewares/isAdmin.js";

const chunkRouter = express.Router();

const UPLOAD_DIR = path.resolve("uploads/chunks");

// Ensure upload dir exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Handle chunk upload
chunkRouter.post(
  "/upload-chunk",
  accessTokenAutoRefresh,
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  async (req, res) => {
    try {
      const fileId = req.headers["fileid"];
      const chunkIndexRaw = req.headers["chunkindex"];
      const totalChunksRaw = req.headers["totalchunks"];

      if (!fileId || chunkIndexRaw === undefined || !totalChunksRaw) {
        return res.status(400).json({ error: "Missing headers" });
      }

      // SECURITY (F05): Bound fileId to alphanumeric and prevent path traversal
      if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
        return res.status(400).json({ error: "Invalid fileId format" });
      }

      const chunkIndex = parseInt(chunkIndexRaw, 10);
      const totalChunks = parseInt(totalChunksRaw, 10);
      if (isNaN(chunkIndex) || isNaN(totalChunks) || totalChunks > 10000 || chunkIndex < 0 || chunkIndex >= totalChunks) {
        return res.status(400).json({ error: "Invalid chunkIndex or totalChunks" });
      }

      const chunkDir = path.resolve(UPLOAD_DIR, `${req.user._id}_${fileId}`);
      if (!chunkDir.startsWith(UPLOAD_DIR + path.sep)) {
        return res.status(400).json({ error: "Path traversal detected" });
      }
      if (!fs.existsSync(chunkDir)) fs.mkdirSync(chunkDir, { recursive: true });

      const chunkPath = path.resolve(chunkDir, `${chunkIndex}`);
      if (!chunkPath.startsWith(chunkDir + path.sep)) {
        return res.status(400).json({ error: "Invalid chunk destination" });
      }
      const writeStream = fs.createWriteStream(chunkPath);

      req.pipe(writeStream);

      writeStream.on("finish", () => {
        res.json({ success: true, chunkIndex });
      });

      writeStream.on("error", (err) => {
        console.error("Chunk write error:", err);
        res.status(500).json({ error: "Failed to write chunk" });
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

// Merge chunks
chunkRouter.post(
  "/merge-chunks",
  accessTokenAutoRefresh,
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  async (req, res) => {
    try {
      const { fileId, fileName, totalChunks: totalChunksRaw } = req.body;
      if (!fileId || !fileName || !totalChunksRaw) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
        return res.status(400).json({ error: "Invalid fileId format" });
      }
      const totalChunks = parseInt(totalChunksRaw, 10);
      if (isNaN(totalChunks) || totalChunks <= 0 || totalChunks > 10000) {
        return res.status(400).json({ error: "Invalid totalChunks" });
      }

      const baseUploads = path.resolve("uploads");
      const extension = path.extname(path.basename(fileName)).toLowerCase();
      if (!['.mp4', '.webm', '.mov', '.avi', '.mkv', '.mp3', '.wav', '.pdf', '.docx', '.png', '.jpg', '.jpeg', '.webp', '.zip', '.xlsx', '.csv'].includes(extension)) {
        return res.status(400).json({ error: 'Unsupported file extension' });
      }
      const safeFileName = `${crypto.randomUUID()}${extension}`;
      const chunkDir = path.resolve(UPLOAD_DIR, `${req.user._id}_${fileId}`);
      const finalPath = path.resolve(baseUploads, safeFileName);

      if (!chunkDir.startsWith(UPLOAD_DIR + path.sep)) {
        return res.status(400).json({ error: "Path traversal in chunk directory" });
      }
      if (!finalPath.startsWith(baseUploads + path.sep)) {
        return res.status(400).json({ error: "Path traversal in merge destination" });
      }

      for (let i = 0; i < totalChunks; i++) {
        if (!fs.existsSync(path.join(chunkDir, `${i}`))) return res.status(400).json({ error: `Missing chunk ${i}` });
      }
      const writeStream = fs.createWriteStream(finalPath, { flags: 'wx' });
      writeStream.on('error', () => {
        if (!res.headersSent) res.status(500).json({ error: 'Failed to merge chunks' });
      });

      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(chunkDir, `${i}`);
        if (!fs.existsSync(chunkPath)) {
          return res.status(400).json({ error: `Missing chunk ${i}` });
        }
        const data = fs.readFileSync(chunkPath);
        writeStream.write(data);
      }

      writeStream.end();

      writeStream.on("finish", () => {
        // Cleanup chunk dir
        fs.rmSync(chunkDir, { recursive: true, force: true });
        res.json({ success: true, filePath: finalPath });
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to merge chunks" });
    }
  });

export default chunkRouter;
