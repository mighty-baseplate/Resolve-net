import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertIssueSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Ensure uploads directory exists
  try {
    await fs.mkdir("./uploads", { recursive: true });
  } catch (err) {
    console.error("Failed to create uploads directory:", err);
  }

  // File upload endpoint
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  // Serve uploaded files
  app.use("/uploads", express.static("uploads"));

  // Issues API
  app.get("/api/issues", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const issues = await storage.getIssues();
    res.json(issues);
  });

  app.post("/api/issues", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const issueData = insertIssueSchema.parse(req.body);
      const issue = await storage.createIssue({
        ...issueData,
        userId: req.user.id,
      });
      res.status(201).json(issue);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json(err.errors);
      } else {
        res.status(500).send("Failed to create issue");
      }
    }
  });

  app.patch("/api/issues/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== 'authority') return res.sendStatus(403);

    const status = req.body.status;
    if (!status || !['reported', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).send("Invalid status");
    }

    const issue = await storage.updateIssueStatus(parseInt(req.params.id), status);
    if (!issue) return res.status(404).send("Issue not found");
    res.json(issue);
  });

  app.post("/api/issues/:id/vote", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const increment = req.body.increment === true;
    const issue = await storage.updateIssueVotes(parseInt(req.params.id), increment);
    if (!issue) return res.status(404).send("Issue not found");
    res.json(issue);
  });

  const httpServer = createServer(app);
  return httpServer;
}