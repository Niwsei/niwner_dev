import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Input from '../../components/ui/Input';
import { createCourse, updateCourse, getCourse, listModules, createModule, updateModule, reorderModules, listLessons, createLesson, updateLesson, reorderLessons, listVersions, createVersion, publishCourse, unpublishCourse } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';

type ModuleItem = { id: number; title: string };
type LessonItem = { id: number; title: string };

function SortableItem({ id, title, onRemove }: { id: number; title: string; onRemove: (id: number) => void }) {
  const { listeners, setNodeRef, transform, transition, attributes } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition } as any;
  return (
    <div ref={setNodeRef} style={style} className="card" {...attributes} {...listeners}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>⋮⋮ {title}</strong>
        <button className="btn btn-ghost" onClick={() => onRemove(id)}>Remove</button>
      </div>
    </div>
  );
}

export default function CourseBuilder() {
  const { show } = useToast();
  const [courseId, setCourseId] = useState<number | null>(null);
  const [courseTitle, setCourseTitle] = useState('New Course');
  const [courseDesc, setCourseDesc] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [earlyPrice, setEarlyPrice] = useState<number>(0);
  const [earlyEnd, setEarlyEnd] = useState<string>('');
  const [preStart, setPreStart] = useState<string>('');
  const [preEnd, setPreEnd] = useState<string>('');
  const [status, setStatus] = useState<string>('draft');

  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<number, LessonItem[]>>({});
  const sensors = useSensors(useSensor(PointerSensor));

  const onDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = modules.findIndex((m) => m.id === active.id);
    const newIndex = modules.findIndex((m) => m.id === over.id);
    const next = arrayMove(modules, oldIndex, newIndex);
    setModules(next);
    if (courseId) {
      try { await reorderModules(courseId, next.map(m => m.id)); } catch (e: any) { show({ title: 'Reorder failed', description: e.message, variant: 'error' }); }
    }
  };

  const addModule = async () => {
    if (!courseId) return show({ title: 'Create course first', variant: 'warning' });
    const m = await createModule(courseId, { title: `Module ${modules.length + 1}` });
    setModules(await listModules(courseId));
  };
  const removeModule = async (id: number) => {
    // Soft remove: set title and skip for now (no delete endpoint). Optional: implement DELETE.
    await updateModule(id, { title: '(removed)' });
    if (courseId) setModules(await listModules(courseId));
  };

  const loadCourse = async (id: number) => {
    const c = await getCourse(id);
    setCourseId(c.id);
    setCourseTitle(c.title || '');
    setCourseDesc(c.description || '');
    setPrice(Number(c.price || 0));
    setDiscount(Number(c.discount_percent || 0));
    setEarlyPrice(Number(c.earlybird_price || 0));
    setEarlyEnd(c.earlybird_end_at || '');
    setPreStart(c.preorder_start_at || '');
    setPreEnd(c.preorder_end_at || '');
    setStatus(c.status || 'draft');
    const mods = await listModules(c.id);
    setModules(mods);
  };

  const createNewCourse = async () => {
    const created = await createCourse({ title: courseTitle, description: courseDesc, price, discount_percent: discount, earlybird_price: earlyPrice, earlybird_end_at: earlyEnd || null, preorder_start_at: preStart || null, preorder_end_at: preEnd || null });
    show({ title: 'Course created', description: created.title, variant: 'success' });
    await loadCourse(created.id);
  };

  const saveCourse = async () => {
    if (!courseId) return createNewCourse();
    const updated = await updateCourse(courseId, { title: courseTitle, description: courseDesc, price, discount_percent: discount, earlybird_price: earlyPrice, earlybird_end_at: earlyEnd || null, preorder_start_at: preStart || null, preorder_end_at: preEnd || null });
    show({ title: 'Course saved', description: updated.title, variant: 'success' });
  };

  const togglePublish = async () => {
    if (!courseId) return;
    if (status === 'published') {
      await unpublishCourse(courseId);
      setStatus('draft');
      show({ title: 'Unpublished', variant: 'success' });
    } else {
      await publishCourse(courseId);
      setStatus('published');
      show({ title: 'Published', variant: 'success' });
    }
  };

  const addLesson = async (moduleId: number) => {
    const l = await createLesson(moduleId, { title: `Lesson ${(lessonsByModule[moduleId]?.length || 0) + 1}` });
    const list = await listLessons(moduleId);
    setLessonsByModule(s => ({ ...s, [moduleId]: list }));
  };

  const loadLessons = async (moduleId: number) => {
    const list = await listLessons(moduleId);
    setLessonsByModule(s => ({ ...s, [moduleId]: list }));
  };

  return (
    <main>
      <PageHeader title="Course Builder" subtitle="Drag & Drop modules, manage lessons, pricing, and versions" />
      <div className="layout">
        <Card>
          <CardHeader title="Course Settings" />
          <div style={{ padding: 10, display: 'grid', gap: 10 }}>
            <Input label="Title" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} />
            <Input label="Description" value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)} />
            <div className="grid">
              <div className="col-4"><Input label="Price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></div>
              <div className="col-4"><Input label="Discount %" type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} /></div>
              <div className="col-4"><Input label="Early Bird Price" type="number" value={earlyPrice} onChange={(e) => setEarlyPrice(Number(e.target.value))} /></div>
              <div className="col-4"><Input label="Early Bird Ends" type="datetime-local" value={earlyEnd} onChange={(e) => setEarlyEnd(e.target.value)} /></div>
              <div className="col-4"><Input label="Pre-order Starts" type="datetime-local" value={preStart} onChange={(e) => setPreStart(e.target.value)} /></div>
              <div className="col-4"><Input label="Pre-order Ends" type="datetime-local" value={preEnd} onChange={(e) => setPreEnd(e.target.value)} /></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={saveCourse}>{courseId ? 'Save Course' : 'Create Course'}</Button>
              {courseId && <Button variant="outline" onClick={togglePublish}>{status === 'published' ? 'Unpublish' : 'Publish'}</Button>}
              {courseId && <Button variant="ghost" onClick={async () => { await createVersion(courseId!, 'Builder UI'); show({ title: 'New version created', variant: 'success' }); }}>{'Create Version'}</Button>}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Modules" extra={<div style={{ display: 'flex', gap: 8 }}><Button onClick={addModule}>Add Module</Button></div>} />
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            <div className="row">
              {modules.map((m) => (
                <div key={m.id} className="col-12">
                  <div className="card" style={{ padding: 12, display: 'grid', gap: 8 }}>
                    <SortableItem id={m.id} title={m.title} onRemove={removeModule} />
                    <Input value={m.title} onChange={(e) => setModules((list) => list.map(x => x.id === m.id ? { ...x, title: e.target.value } : x))} onBlur={async (e) => { try { await updateModule(m.id, { title: (e.target as HTMLInputElement).value }); } catch {} }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <strong>Lessons</strong>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button variant="outline" onClick={() => loadLessons(m.id)}>Load</Button>
                          <Button variant="ghost" onClick={() => addLesson(m.id)}>Add Lesson</Button>
                        </div>
                      </div>
                      <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
                        {(lessonsByModule[m.id] || []).map((l, idx, arr) => (
                          <div key={l.id} className="card" style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <Input value={l.title} onChange={(e) => setLessonsByModule(s => ({ ...s, [m.id]: (s[m.id] || []).map(x => x.id === l.id ? { ...x, title: e.target.value } : x) }))} onBlur={async (e) => { try { await updateLesson(l.id, { title: (e.target as HTMLInputElement).value }); } catch {} }} />
                            <div style={{ display: 'flex', gap: 6 }}>
                              <Button variant="ghost" size="sm" onClick={async () => { const order = [...arr.map(x => x.id)]; if (idx > 0) { [order[idx-1], order[idx]] = [order[idx], order[idx-1]]; await reorderLessons(m.id, order); await loadLessons(m.id); } }}>↑</Button>
                              <Button variant="ghost" size="sm" onClick={async () => { const order = [...arr.map(x => x.id)]; if (idx < arr.length - 1) { [order[idx+1], order[idx]] = [order[idx], order[idx+1]]; await reorderLessons(m.id, order); await loadLessons(m.id); } }}>↓</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        </Card>
     </div>
    </main>
  );
}
