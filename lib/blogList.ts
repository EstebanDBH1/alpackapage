// Caché del blog (mismo patrón que lib/promptsList.ts): memoria +
// sessionStorage con stale-while-revalidate. El listado ya viaja sin
// `content`; aquí además evitamos re-descargarlo en cada navegación y
// cacheamos cada artículo por slug para que reabrirlo sea instantáneo.

import { supabase } from './supabase';
import { BlogPost } from '../types';

export type BlogPostPreview = Omit<BlogPost, 'content'>;

const LIST_KEY = 'blog-list-v1';
const POST_KEY = (slug: string) => `blog-post-v1:${slug}`;

const LIST_COLUMNS = 'id, title, slug, excerpt, cover_image_url, category, published, created_at, updated_at';

// ── Listado ──────────────────────────────────────────────────────────────────

let listCache: BlogPostPreview[] | null = null;
let listInflight: Promise<BlogPostPreview[] | null> | null = null;

export const getCachedBlogList = (): BlogPostPreview[] | null => {
    if (listCache) return listCache;
    try {
        const raw = sessionStorage.getItem(LIST_KEY);
        if (raw) {
            listCache = JSON.parse(raw) as BlogPostPreview[];
            return listCache;
        }
    } catch { /* sessionStorage no disponible */ }
    return null;
};

export const fetchBlogList = (): Promise<BlogPostPreview[] | null> => {
    if (listInflight) return listInflight;

    listInflight = Promise.resolve(
        supabase
            .from('blog_posts')
            .select(LIST_COLUMNS)
            .eq('published', true)
            .order('created_at', { ascending: false })
    ).then(({ data, error }) => {
        listInflight = null;
        if (error || !data) return null;
        listCache = data as unknown as BlogPostPreview[];
        try { sessionStorage.setItem(LIST_KEY, JSON.stringify(data)); } catch { /* solo memoria */ }
        return listCache;
    });

    return listInflight;
};

// ── Artículo por slug ────────────────────────────────────────────────────────

const postCache = new Map<string, BlogPost>();

export const getCachedBlogPost = (slug: string): BlogPost | null => {
    const inMemory = postCache.get(slug);
    if (inMemory) return inMemory;
    try {
        const raw = sessionStorage.getItem(POST_KEY(slug));
        if (raw) {
            const post = JSON.parse(raw) as BlogPost;
            postCache.set(slug, post);
            return post;
        }
    } catch { /* sessionStorage no disponible */ }
    return null;
};

export const fetchBlogPost = (slug: string): Promise<BlogPost | null> =>
    Promise.resolve(
        supabase.from('blog_posts').select('*').eq('slug', slug).maybeSingle()
    ).then(({ data, error }) => {
        if (error || !data) return null;
        const post = data as BlogPost;
        postCache.set(slug, post);
        try { sessionStorage.setItem(POST_KEY(slug), JSON.stringify(post)); } catch { /* solo memoria */ }
        return post;
    });
