import { ref, set, push, get } from 'firebase/database';
import type { Post } from '../types/post.js';
import { PostService } from '../services/postService.js';

const postService = new PostService();

export class PostController {
  async getAllPosts() {
    return await postService.getAllPosts();
  }

  async getPostById(id: string) {
    return await postService.getPostById(id);
  }

  async createPost(data: Partial<Post>) {
    return await postService.createPost(data);
  }

  async updatePost(id: string, data: Partial<Post>) {
    return await postService.updatePost(id, data);
  }

  async deletePost(id: string) {
    return await postService.deletePost(id);
  }
}
