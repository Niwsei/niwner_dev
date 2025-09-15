export type Course = {
  id: number;
  title: string;
  description?: string;
  category?: string;
  difficulty_level?: string;
  duration?: number;
  price?: number;
  instructor_id?: number | null;
  rating?: number;
  enrollment_count?: number;
  course_type?: 'logic' | 'flow' | 'project' | string;
};

export type Module = {
  id: number;
  course_id: number;
  title: string;
  order: number;
  content_type?: string;
  content_url?: string;
  estimated_time?: number;
};

export type Lesson = {
  id: number;
  module_id: number;
  title: string;
  content?: string;
  lesson_type?: string;
  duration?: number;
  resources?: any[];
};

export type CourseDetail = Course & {
  modules: Module[];
  lessons: Lesson[];
};

export type PointsState = { xp: number; level: number };

