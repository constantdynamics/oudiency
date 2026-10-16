import * as z from 'zod/mini';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions, registerStore } from './persist';
import { PostSchema, type Post, type Reaction } from './schemas';

interface PostState {
  posts: Post[];
  add: (post: Post) => void;
  update: (id: string, patch: Partial<Post>) => void;
  remove: (id: string) => void;
  addReactions: (id: string, reactions: Reaction[]) => void;
  markReactionsSeen: (ids: string[]) => void;
}

const Persisted = z.object({ posts: z.array(PostSchema) });

export const usePostStore = create<PostState>()(
  persist(
    (set) => ({
      posts: [],
      add: (post) => set((s) => ({ posts: [post, ...s.posts] })),
      update: (id, patch) =>
        set((s) => ({ posts: s.posts.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      remove: (id) => set((s) => ({ posts: s.posts.filter((p) => p.id !== id) })),
      addReactions: (id, reactions) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === id ? { ...p, reactions: [...p.reactions, ...reactions] } : p,
          ),
        })),
      markReactionsSeen: (ids) => {
        const wanted = new Set(ids);
        set((s) => ({
          posts: s.posts.map((p) =>
            p.reactions.some((r) => wanted.has(r.id) && !r.seen)
              ? {
                  ...p,
                  reactions: p.reactions.map((r) => (wanted.has(r.id) ? { ...r, seen: true } : r)),
                }
              : p,
          ),
        }));
      },
    }),
    persistOptions<PostState, { posts: Post[] }>({
      name: 'posts',
      version: 1,
      schema: Persisted,
      partialize: (s) => ({ posts: s.posts }),
    }),
  ),
);

registerStore({
  name: 'posts',
  version: 1,
  schema: Persisted,
  rehydrate: () => usePostStore.persist.rehydrate(),
});
