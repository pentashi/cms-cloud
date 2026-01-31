import { db } from '../firebase.js';
import { ref, set, push, get, remove, update } from 'firebase/database';
import type { Post } from '../types/post';
import { NotFoundError, ValidationError } from '../utils/appError.js';

export class PostService {
  async getAllPosts(): Promise<Post[]> {
    const snapshot = await get(ref(db, 'posts'));
    const posts = snapshot.val() || {};
    const postsArray = Object.keys(posts).map((key) => ({ id: key, ...posts[key] })) as Post[];
    return postsArray;
  }

  async getPostById(id: string): Promise<Post | null> {
    const snapshot = await get(ref(db, `posts/${id}`));
    if (!snapshot.exists()) {
      return null;
    }
    return { id, ...snapshot.val() } as Post;
  }

  async createPost(data: Partial<Post>): Promise<Post> {
    if (!data.title || !data.content) {
      throw new ValidationError('Title and content are required');
    }

    const newPostRef = push(ref(db, 'posts'));
    const postData: Post = {
      title: data.title,
      content: data.content,
      createdAt: Date.now()
    };
    await set(newPostRef, postData);
    
    return {
      id: newPostRef.key || '',
      ...postData
    };
  }

  async updatePost(id: string, data: Partial<Post>): Promise<Post> {
    const post = await this.getPostById(id);
    if (!post) {
      throw new NotFoundError('Post');
    }

    if (!data.title || !data.content) {
      throw new ValidationError('Title and content are required');
    }

    const updateData = {
      title: data.title,
      content: data.content,
      updatedAt: Date.now()
    };

    await update(ref(db, `posts/${id}`), updateData);
    return { ...post, ...updateData };
  }

  async deletePost(id: string): Promise<void> {
    const post = await this.getPostById(id);
    if (!post) {
      throw new NotFoundError('Post');
    }
    await remove(ref(db, `posts/${id}`));
  }
}
