import express from "express";
import path from "path";
import { spawn } from "child_process";
import http from "http";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const PYTHON_PORT = 8008;

// Start Python Native Forensic backend on port 8008
let pythonProcess: any = null;

function spawnPythonBackend() {
  console.log("[CFX Engine] Spawning Python Forensic backend on port 8008...");
  pythonProcess = spawn("python3", ["backend/api_server.py"], {
    stdio: ["ignore", "inherit", "inherit"]
  });

  pythonProcess.on("error", (err: any) => {
    console.error("[CFX Engine Error] Failed to launch Python backend:", err);
  });

  pythonProcess.on("exit", (code: number) => {
    console.log(`[CFX Engine] Python backend exited with code ${code}. Respawning in 1s...`);
    setTimeout(spawnPythonBackend, 1000);
  });
}

spawnPythonBackend();

process.on("exit", () => {
  try {
    if (pythonProcess) pythonProcess.kill();
  } catch (e) {}
});

async function startServer() {
  const app = express();

  // Serve static files from public (sample videos, icons, assets)
  const publicDir = path.join(process.cwd(), "public");
  app.use(express.static(publicDir, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".mp4")) {
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Accept-Ranges", "bytes");
      }
    }
  }));

  // Proxy /api/* to Python API Server on port 8008
  app.all("/api/*", (req, res) => {
    const options: http.RequestOptions = {
      hostname: "127.0.0.1",
      port: PYTHON_PORT,
      path: req.originalUrl,
      method: req.method,
      headers: {
        ...req.headers,
        host: `127.0.0.1:${PYTHON_PORT}`,
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      console.warn(`[Proxy Warning] Forensic backend connection attempt: ${err.message}`);
      res.status(503).json({
        error: "Forensic backend initializing. Please retry in 2 seconds.",
        timestamp: new Date().toISOString()
      });
    });

    req.pipe(proxyReq);
  });

  // Vite middleware for development vs static serve for production
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CFX Workstation] CCTV FORENSIX running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start CCTV FORENSIX server:", err);
});
