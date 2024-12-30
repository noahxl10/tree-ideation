import type { Express } from "express";
import { createServer } from "http";
import { db } from "@db";
import { thoughts } from "@db/schema";
import { eq, or } from "drizzle-orm";

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  app.get("/api/thoughts", async (_req, res) => {
    const allThoughts = await db.query.thoughts.findMany({
      orderBy: (thoughts, { asc }) => [asc(thoughts.createdAt)],
    });
    res.json(allThoughts);
  });

  app.post("/api/thoughts", async (req, res) => {
    const { parentId, content = "New thought" } = req.body;

    // Calculate position based on parent or default to center
    const position = parentId 
      ? { x: Math.random() * 300, y: Math.random() * 300 }
      : { x: 0, y: 0 };

    const thought = await db
      .insert(thoughts)
      .values({
        content,
        parentId: parentId || null,
        position,
      })
      .returning()
      .then(rows => rows[0]);

    if (!thought) {
      return res.status(500).json({ error: "Failed to create thought" });
    }

    // Generate LLM response
    try {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that responds to thoughts with insightful and concise responses.",
            },
            {
              role: "user",
              content,
            },
          ],
          max_tokens: 100,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const llmResponse = data.choices[0].message.content;

      await db
        .update(thoughts)
        .set({ response: llmResponse })
        .where(eq(thoughts.id, thought.id));

      thought.response = llmResponse;
    } catch (error) {
      console.error("Failed to generate LLM response:", error);
    }

    res.json(thought);
  });

  // Delete a thought and all its children recursively
  app.delete("/api/thoughts/:id", async (req, res) => {
    const thoughtId = parseInt(req.params.id);

    try {
      // First get all thoughts to analyze the tree structure
      const allThoughts = await db.query.thoughts.findMany();

      // Helper function to find all descendant IDs
      const findDescendants = (parentId: number): number[] => {
        const children = allThoughts.filter(t => t.parentId === parentId);
        return [
          parentId,
          ...children.flatMap(child => findDescendants(child.id))
        ];
      };

      // Get all descendant IDs including the thought itself
      const idsToDelete = findDescendants(thoughtId);

      // Delete all thoughts in the tree
      await db.delete(thoughts)
        .where(or(...idsToDelete.map(id => eq(thoughts.id, id))));

      res.json({ message: "Thought and its branches deleted successfully" });
    } catch (error) {
      console.error("Failed to delete thought:", error);
      res.status(500).json({ error: "Failed to delete thought" });
    }
  });

  return httpServer;
}