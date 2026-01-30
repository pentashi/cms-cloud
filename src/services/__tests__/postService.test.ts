import { PostService } from '../postService';
import { NotFoundError, ValidationError } from '../../utils/appError';

// Mock Firebase
jest.mock('../../firebase', () => ({
  db: {},
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn((db, path) => ({ path })),
  get: jest.fn(),
  set: jest.fn(),
  push: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

const { get, \set, push, update, remove } = require('firebase/database');

describe('PostService', () => {
  let postService: PostService;

  beforeEach(() => {
    postService = new PostService();
    jest.clearAllMocks();
  });

  describe('getAllPosts', () => {
    it('should return array of posts', async () => {
      const mockPosts = {
        post1: { title: 'Test 1', content: 'Content 1' },
        post2: { title: 'Test 2', content: 'Content 2' },
      };

      get.mockResolvedValue({
        val: () => mockPosts,
      });

      const result = await postService.getAllPosts();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'post1',
        title: 'Test 1',
        content: 'Content 1',
      });
    });

    it('should return empty array if no posts', async () => {
      get.mockResolvedValue({
        val: () => null,
      });

      const result = await postService.getAllPosts();

      expect(result).toEqual([]);
    });
  });

  describe('getPostById', () => {
    it('should return post by id', async () => {
      get.mockResolvedValue({
        exists: () => true,
        val: () => ({ title: 'Test', content: 'Content' }),
      });

      const result = await postService.getPostById('post1');

      expect(result).toEqual({
        id: 'post1',
        title: 'Test',
        content: 'Content',
      });
    });

    it('should return null if post not found', async () => {
      get.mockResolvedValue({
        exists: () => false,
        val: () => null,
      });

      const result = await postService.getPostById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createPost', () => {
    it('should create a post with title and content', async () => {
      const mockRef = { key: 'new-post-id' };
      push.mockReturnValue(mockRef);
      set.mockResolvedValue(undefined);

      const result = await postService.createPost({
        title: 'New Post',
        content: 'New Content',
      });

      expect(result.title).toBe('New Post');
      expect(result.content).toBe('New Content');
      expect(result.id).toBe('new-post-id');
      expect(result.createdAt).toBeDefined();
      expect(set).toHaveBeenCalled();
    });

    it('should throw ValidationError if title is missing', async () => {
      await expect(
        postService.createPost({ title: '', content: 'Content' })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if content is missing', async () => {
      await expect(
        postService.createPost({ title: 'Title', content: '' })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('updatePost', () => {
    it('should update a post', async () => {
      get.mockResolvedValue({
        exists: () => true,
        val: () => ({ title: 'Old', content: 'Old Content' }),
      });
      update.mockResolvedValue(undefined);

      const result = await postService.updatePost('post1', {
        title: 'Updated',
        content: 'Updated Content',
      });

      expect(result.title).toBe('Updated');
      expect(result.content).toBe('Updated Content');
      expect(update).toHaveBeenCalled();
    });

    it('should throw NotFoundError if post does not exist', async () => {
      get.mockResolvedValue({
        exists: () => false,
      });

      await expect(
        postService.updatePost('nonexistent', {
          title: 'Title',
          content: 'Content',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError if content is missing', async () => {
      get.mockResolvedValue({
        exists: () => true,
        val: () => ({ title: 'Title', content: 'Content' }),
      });

      await expect(
        postService.updatePost('post1', { title: 'Title', content: '' })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      get.mockResolvedValue({
        exists: () => true,
        val: () => ({ title: 'Test', content: 'Content' }),
      });
      remove.mockResolvedValue(undefined);

      await postService.deletePost('post1');

      expect(remove).toHaveBeenCalled();
    });

    it('should throw NotFoundError if post does not exist', async () => {
      get.mockResolvedValue({
        exists: () => false,
      });

      await expect(postService.deletePost('nonexistent')).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
