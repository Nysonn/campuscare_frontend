import { api } from './client';
import type { Blog } from '../types';

interface CreateBlogPayload {
  title: string;
  description: string;
  content: string;
  image_url: string;
}

export const blogsApi = {
  list: () => api.get<Blog[]>('/blogs'),
  getById: (id: string) => api.get<Blog>(`/blogs/${id}`),
  create: (data: CreateBlogPayload) => api.post<Blog>('/admin/blogs', data),
  update: (id: string, data: CreateBlogPayload) => api.put<Blog>(`/admin/blogs/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/admin/blogs/${id}`),
};
