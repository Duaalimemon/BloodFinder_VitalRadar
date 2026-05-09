import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Socket.io connection logic
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    
    // Join room based on blood type or region for targeted notifications
    socket.on("join-blood-group", (bloodType) => {
      socket.join(bloodType);
      console.log(`User ${socket.id} joined ${bloodType} group`);
    });

    // Always join global broadcast room
    socket.join("global-broadcast");

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // API Route for Emergency Notification (Triggered by client after creation)
  app.use(express.json());
  app.post("/api/notify-donors", async (req, res) => {
    console.log("POST /api/notify-donors", req.body);
    const { bloodType, lat, lng, radius, emergencyId, requesterName, hospitalName } = req.body;

    // Broadcast to the specific blood type room for targeted push
    io.to(bloodType).emit("emergency-alert", {
      emergencyId,
      bloodType,
      lat,
      lng,
      radius,
      requesterName,
      hospitalName,
      message: `URGENT: ${bloodType} needed nearby!`
    });

    // Also broadcast to global room for general awareness
    io.to("global-broadcast").emit("emergency-alert", {
      emergencyId,
      bloodType,
      lat,
      lng,
      radius,
      requesterName,
      hospitalName,
      message: `DISPATCH: New Pulse detected at ${hospitalName}`
    });

    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
