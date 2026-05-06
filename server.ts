import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Jarvis API Skills
  app.get('/api/health', (req, res) => {
    res.json({ status: 'Jarvis is fully operational', version: '2.0.0' });
  });

  // Example Skill: News Reporting (Mocked for now as per instructions, but ready for real API)
  app.get('/api/news', (req, res) => {
    res.json({
      articles: [
        { title: "New AI Assistant Jarvis Next Released", source: "TechDaily" },
        { title: "Global Weather Patterns Shifting", source: "ScienceNews" },
        { title: "The Future of Web Development with AI", source: "DevWorld" }
      ]
    });
  });

  // Example Skill: Weather
  app.get('/api/weather', (req, res) => {
    const city = req.query.city || 'San Francisco';
    res.json({
      city: city,
      temp: 22,
      condition: 'Sunny',
      humidity: 45
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Jarvis Server running on http://localhost:${PORT}`);
  });
}

startServer();
