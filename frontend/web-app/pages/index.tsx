import { useEffect, useState } from 'react';
import Seo from '../components/Seo';
import Hero from '../components/home/Hero';
import Stats from '../components/home/Stats';
import FeatureList from '../components/home/FeatureList';
import Testimonials from '../components/home/Testimonials';
import CourseCard from '../components/home/CourseCard';
import CourseCarousel from '../components/home/CourseCarousel';
import Skeleton from '../components/ui/Skeleton';
import { listCourses } from '../lib/api';
import type { Course } from '../types';

export default function Index() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  useEffect(() => { listCourses().then((c) => setCourses(c)); }, []);

  return (
    <main>
      <Seo title="Home" description="Complete, modern learning platform to master skills" />
      <Hero />

      <div style={{ height: 16 }} />
      <Stats />

      <div style={{ height: 16 }} />
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>Featured Courses</h2>
        </div>
        <div style={{ marginTop: 10 }}>
          {courses ? (
            <CourseCarousel items={courses.slice(0, 10)} />
          ) : (
            <div className="grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="col-4">
                  <div className="card" style={{ padding: 16 }}>
                    <Skeleton height={24} width={'70%'} />
                    <div style={{ height: 8 }} />
                    <Skeleton height={14} width={'40%'} />
                    <div style={{ height: 16 }} />
                    <Skeleton height={36} width={'100%'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div style={{ height: 16 }} />
      <FeatureList />

      <div style={{ height: 16 }} />
      <Testimonials />
    </main>
  );
}
