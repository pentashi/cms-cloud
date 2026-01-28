import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { db } from './firebase.ts'; 
import { ref, set, push, get } from "firebase/database";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Fetch all posts
app.get('/posts', async (req: Request, res: Response) => {
  try {
    const snapshot = await get(ref(db, 'posts'));
    const posts = snapshot.val() || {};
    // convert to array
    const postsArray = Object.keys(posts).map((key) => ({ id: key, ...posts[key] }));
    res.json(postsArray);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts', details: error });
  }
});

// Add new post
app.post('/posts', async (req: Request, res: Response) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const newPostRef = push(ref(db, 'posts')); // create unique key
    await set(newPostRef, { title, content });
    res.status(201).json({ id: newPostRef.key, title, content });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post', details: error });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
