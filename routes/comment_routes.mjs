import express from "express";
import { ObjectId } from "mongodb";
import comments from "../comments.mjs";
import documents from "../docs.mjs";

const commentRouter = express.Router({ mergeParams: true });

// GET /api/documents/:id/comments list comments for a document
commentRouter.get("/", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid document id" });
        }

        // Check that the document exists and belongs to the user
        const doc = await documents.getOne(id, req.user.id);
        if (!doc) {
            return res.status(404).json({ error: "Document not found" });
        }

        const data = await comments.getByDocument(id);
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/documents/:id/comments add a comment to a line
commentRouter.post("/", async (req, res) => {
    try {
        const { id } = req.params;
        const { line, text } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid document id" });
        }

        // line must be a positive integer
        if (!Number.isInteger(line) || line < 1) {
            return res.status(400).json({ error: "Line must be a positive integer" });
        }

        // text must be a non-empty string, cap at 500 characters
        if (typeof text !== "string" || text.trim().length === 0) {
            return res.status(400).json({ error: "Comment text is required" });
        }

        if (text.length > 500) {
            return res.status(400).json({ error: "Comment text is too long (max 500 characters)" });
        }

        // Check that the document exists and belongs to the user
        const doc = await documents.getOne(id, req.user.id);
        if (!doc) {
            return res.status(404).json({ error: "Document not found" });
        }

        const newComment = {
            documentId: id,
            line,
            text: text.trim(),
            author: req.user.id,
            authorEmail: req.user.email,
            createdAt: new Date().toISOString()
        };

        const result = await comments.addOne(newComment);
        res.status(201).json({ data: { id: result.insertedId, ...newComment } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/documents/:id/comments/:commentId delete a comment
commentRouter.delete("/:commentId", async (req, res) => {
    try {
        const { id, commentId } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid document id" });
        }

        if (!ObjectId.isValid(commentId)) {
            return res.status(400).json({ error: "Invalid comment id" });
        }

        // Check that the document exists and belongs to the user
        const doc = await documents.getOne(id, req.user.id);
        if (!doc) {
            return res.status(404).json({ error: "Document not found" });
        }

        const comment = await comments.getOne(commentId);

        // Return 404 if the comment is missing or belongs to another document
        if (!comment || comment.documentId.toString() !== id) {
            return res.status(404).json({ error: "Comment not found" });
        }

        // Only the comment author can delete their own comment
        if (comment.author !== req.user.id) {
            return res.status(403).json({ error: "You can only delete your own comments" });
        }

        const result = await comments.deleteOne(commentId);

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Comment not found" });
        }

        res.status(200).json({ data: "Comment deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default commentRouter;