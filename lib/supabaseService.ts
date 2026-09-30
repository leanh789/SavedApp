import { supabase, isSupabaseConfigured } from './supabase';
import { Topic, VideoItem } from '@/types';

// Types for Supabase DB rows
export interface DbTopic {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface DbVideo {
  id: string;
  url: string;
  video_id: string;
  title: string;
  topic_id: string | null;
  notes: string | null;
  created_at: string;
}

export function mapDbTopicToTopic(row: DbTopic): Topic {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export function mapDbVideoToVideo(row: DbVideo): VideoItem {
  return {
    id: row.id,
    url: row.url,
    videoId: row.video_id,
    title: row.title,
    topicId: row.topic_id || 'unassigned',
    notes: row.notes || '',
    createdAt: new Date(row.created_at).getTime(),
  };
}

// ================= TOPICS SERVICE =================
export async function fetchTopicsFromSupabase(): Promise<Topic[]> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching topics from Supabase:', error);
    throw error;
  }

  return (data || []).map(mapDbTopicToTopic);
}

export async function createTopicInSupabase(name: string, color?: string): Promise<Topic> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('topics')
    .insert([
      {
        name,
        color: color || '#25F4EE',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating topic in Supabase:', error);
    throw error;
  }

  return mapDbTopicToTopic(data);
}

export async function updateTopicInSupabase(
  id: string,
  name: string,
  color?: string
): Promise<Topic> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured');
  }

  const updatePayload: { name: string; color?: string } = { name };
  if (color) updatePayload.color = color;

  const { data, error } = await supabase
    .from('topics')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating topic in Supabase:', error);
    throw error;
  }

  return mapDbTopicToTopic(data);
}

export async function deleteTopicInSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase.from('topics').delete().eq('id', id);

  if (error) {
    console.error('Error deleting topic in Supabase:', error);
    throw error;
  }
}

// ================= VIDEOS SERVICE =================
export async function fetchVideosFromSupabase(): Promise<VideoItem[]> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching videos from Supabase:', error);
    throw error;
  }

  return (data || []).map(mapDbVideoToVideo);
}

export async function createVideoInSupabase(
  video: Omit<VideoItem, 'id' | 'createdAt'>
): Promise<VideoItem> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('videos')
    .insert([
      {
        url: video.url,
        video_id: video.videoId,
        title: video.title,
        topic_id: video.topicId && video.topicId !== 'unassigned' ? video.topicId : null,
        notes: video.notes || '',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating video in Supabase:', error);
    throw error;
  }

  return mapDbVideoToVideo(data);
}

export async function updateVideoInSupabase(
  id: string,
  data: Partial<VideoItem>
): Promise<VideoItem> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured');
  }

  const updatePayload: Record<string, unknown> = {};
  if (data.url !== undefined) updatePayload.url = data.url;
  if (data.videoId !== undefined) updatePayload.video_id = data.videoId;
  if (data.title !== undefined) updatePayload.title = data.title;
  if (data.topicId !== undefined) {
    updatePayload.topic_id = data.topicId && data.topicId !== 'unassigned' ? data.topicId : null;
  }
  if (data.notes !== undefined) updatePayload.notes = data.notes;

  const { data: updated, error } = await supabase
    .from('videos')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating video in Supabase:', error);
    throw error;
  }

  return mapDbVideoToVideo(updated);
}

export async function deleteVideoInSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase.from('videos').delete().eq('id', id);

  if (error) {
    console.error('Error deleting video in Supabase:', error);
    throw error;
  }
}
