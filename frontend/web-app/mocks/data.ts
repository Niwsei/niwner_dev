import type { Course, Module, Lesson, PointsState } from '../types';

// Seeded demo data
export const courses: Course[] = [
  {
    id: 1,
    title: 'Intro to Logic',
    description: 'Learn the fundamentals of logical thinking and boolean algebra.',
    category: 'Logic',
    difficulty_level: 'beginner',
    duration: 180,
    price: 29,
    instructor_id: 1,
    rating: 4.8,
    enrollment_count: 1234,
    course_type: 'logic'
  },
  {
    id: 2,
    title: 'Workflow Design Basics',
    description: 'Visualize and optimize business processes with flow diagrams.',
    category: 'Flow',
    difficulty_level: 'intermediate',
    duration: 240,
    price: 39,
    instructor_id: 2,
    rating: 4.6,
    enrollment_count: 865,
    course_type: 'flow'
  }
];

// More demo courses
courses.push(
  { id: 3, title: 'Project Management Essentials', description: 'Plan, execute, and deliver projects effectively.', category: 'Project', difficulty_level: 'beginner', duration: 200, price: 35, instructor_id: 3, rating: 4.7, enrollment_count: 540, course_type: 'project' },
  { id: 4, title: 'Advanced Logic Puzzles', description: 'Challenge your mind with advanced puzzles.', category: 'Logic', difficulty_level: 'advanced', duration: 180, price: 49, instructor_id: 1, rating: 4.9, enrollment_count: 980, course_type: 'logic' },
  { id: 5, title: 'Business Flow Templates', description: 'Use ready-made flow templates to jumpstart work.', category: 'Flow', difficulty_level: 'beginner', duration: 120, price: 25, instructor_id: 2, rating: 4.4, enrollment_count: 260, course_type: 'flow' },
  { id: 6, title: 'Team Collaboration Toolkit', description: 'Communicate and collaborate efficiently.', category: 'Collaboration', difficulty_level: 'intermediate', duration: 150, price: 29, instructor_id: 4, rating: 4.5, enrollment_count: 330, course_type: 'project' }
);

export const modules: Module[] = [
  { id: 1, course_id: 1, title: 'What is Logic?', order: 1, content_type: 'video', content_url: '', estimated_time: 20 },
  { id: 2, course_id: 1, title: 'Truth Tables', order: 2, content_type: 'video', content_url: '', estimated_time: 30 },
  { id: 3, course_id: 2, title: 'Flow Basics', order: 1, content_type: 'video', content_url: '', estimated_time: 25 },
];

export const lessons: Lesson[] = [
  { id: 1, module_id: 1, title: 'Intro Video', content: '...', lesson_type: 'video', duration: 10, resources: [] },
  { id: 2, module_id: 1, title: 'Reading: Propositions', content: '...', lesson_type: 'text', duration: 10, resources: [] },
  { id: 3, module_id: 2, title: 'Building Truth Tables', content: '...', lesson_type: 'interactive', duration: 15, resources: [] },
];

// Gamification
export const userPoints = new Map<string, PointsState>([
  ['demo-user-1', { xp: 350, level: 1 }]
]);
export const userAchievements = new Map<string, Array<{ badge_type: string; description: string; skill_category: string; earned_date: string }>>([
  ['demo-user-1', [
    { badge_type: 'starter', description: 'Completed first lesson', skill_category: 'general', earned_date: new Date().toISOString() }
  ]]
]);

export const leaderboard = [
  { userId: 'alice', xp: 4200, level: 5 },
  { userId: 'bob', xp: 3800, level: 5 },
  { userId: 'charlie', xp: 2600, level: 3 },
  { userId: 'demo-user-1', xp: 350, level: 1 }
];

export const streaks = new Map<string, { current: number; longest: number; days: string[] }>([
  ['demo-user-1', { current: 5, longest: 12, days: ['2025-09-10','2025-09-11','2025-09-12','2025-09-13','2025-09-14'] }]
]);

// Logic
export function randomPuzzle() {
  const types = ['boolean-eval', 'truth-table', 'sequence'] as const;
  const type = types[Math.floor(Math.random() * types.length)];
  if (type === 'boolean-eval') {
    return { id: Date.now(), difficulty_level: 'beginner', puzzle: { type, expression: '(A && B) || !C', variables: ['A','B','C'] } };
  }
  if (type === 'truth-table') {
    return { id: Date.now(), difficulty_level: 'beginner', puzzle: { type, expression: 'P -> Q', variables: ['P','Q'] } };
  }
  return { id: Date.now(), difficulty_level: 'beginner', puzzle: { type, sequence: [1,2,4,7,11], task: 'Find next number' } };
}

// Flow
export type Workflow = { id: number; title: string; description?: string; nodes: Array<{ id: string }>; connections: Array<{ from: string; to: string }>; };
export const workflows: Workflow[] = [
  { id: 1, title: 'Onboarding Flow', nodes: [{ id: 'start' }, { id: 'end' }], connections: [{ from: 'start', to: 'end' }] }
];

// Shop / Subscriptions
export const subscriptionPlans = [
  { id: 'basic', name: 'Basic', price: 9, features: ['Access to free courses', 'Community'] },
  { id: 'pro', name: 'Pro', price: 29, features: ['All basic', 'Premium courses', 'Certificates'] },
  { id: 'ultimate', name: 'Ultimate', price: 59, features: ['All Pro', 'Projects + Templates', 'Priority support'] }
];

// Analytics
export const learningSeries = {
  labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  data: [30, 42, 28, 60, 90, 120, 75]
};

// Projects / Kanban
export const kanban = {
  columns: [
    { id: 'backlog', title: 'Backlog' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' }
  ],
  tasks: [
    { id: 't1', title: 'Define course outline', columnId: 'backlog' },
    { id: 't2', title: 'Record intro video', columnId: 'inprogress' },
    { id: 't3', title: 'Build quiz questions', columnId: 'review' },
    { id: 't4', title: 'Publish course page', columnId: 'done' }
  ]
};

// Community
export const groups = [
  { id: 'g1', name: 'Logic Learners', members: 124 },
  { id: 'g2', name: 'Workflow Designers', members: 88 }
];
export const threads = [
  { id: 'f1', title: 'Best resources for truth tables?', author: 'alice', replies: 12 },
  { id: 'f2', title: 'Share your favorite flow templates', author: 'bob', replies: 5 }
];
