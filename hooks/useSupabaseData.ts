import { useEffect, useState } from 'react';
import { supabase, DbSubject, DbSession, DbTask } from '../lib/supabase';
import { Subject, Session, Task } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Convert DB types to app types
const dbSubjectToSubject = (dbSubject: DbSubject): Subject => ({
  id: dbSubject.id,
  name: dbSubject.name,
  color: dbSubject.color,
  weeklyTargetMinutes: Number(dbSubject.weekly_goal) || 0,
});

const dbSessionToSession = (dbSession: DbSession): Session => ({
  id: dbSession.id,
  subjectId: dbSession.subject_id,
  date: dbSession.date,
  durationMinutes: dbSession.duration_minutes,
  topic: dbSession.topic || '',
  notes: dbSession.notes || '',
  rating: dbSession.rating,
});

const dbTaskToTask = (dbTask: DbTask): Task => ({
  id: dbTask.id,
  text: dbTask.text,
  completed: dbTask.completed,
  createdAt: dbTask.created_at,
});

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const fetchData = async () => {
    if (!user) {
      setSubjects([]);
      setSessions([]);
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (subjectsError) throw subjectsError;
      setSubjects((subjectsData || []).map(dbSubjectToSubject));

      // Fetch sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (sessionsError) throw sessionsError;
      setSessions((sessionsData || []).map(dbSessionToSession));

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;
      setTasks((tasksData || []).map(dbTaskToTask));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (!user) return;

    // Subscribe to real-time changes
    const subjectsSubscription = supabase
      .channel('subjects_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects', filter: `user_id=eq.${user.id}` }, () => {
        fetchData();
      })
      .subscribe();

    const sessionsSubscription = supabase
      .channel('sessions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions', filter: `user_id=eq.${user.id}` }, () => {
        fetchData();
      })
      .subscribe();

    const tasksSubscription = supabase
      .channel('tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      subjectsSubscription.unsubscribe();
      sessionsSubscription.unsubscribe();
      tasksSubscription.unsubscribe();
    };
  }, [user]);

  // Subject operations
  const addSubject = async (subjectData: Omit<Subject, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase.from('subjects').insert({
      user_id: user.id,
      name: subjectData.name,
      color: subjectData.color,
      weekly_goal: subjectData.weeklyTargetMinutes || 0,
    }).select();

    if (error) {
      console.error('Error adding subject:', error);
      throw error;
    }

    // Immediately add to local state for instant UI update
    if (data && data.length > 0) {
      setSubjects(prev => [...prev, dbSubjectToSubject(data[0])]);
    }
  };

  const updateSubject = async (id: string, subjectData: Partial<Subject>) => {
    if (!user) return;

    const updateData: any = {};
    if (subjectData.name !== undefined) updateData.name = subjectData.name;
    if (subjectData.color !== undefined) updateData.color = subjectData.color;
    if (subjectData.weeklyTargetMinutes !== undefined) updateData.weekly_goal = subjectData.weeklyTargetMinutes;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('subjects')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error('Error updating subject:', error);
      throw error;
    }

    // Immediately update local state for instant UI update
    if (data && data.length > 0) {
      setSubjects(prev => prev.map(s => s.id === id ? dbSubjectToSubject(data[0]) : s));
    }
  };

  const deleteSubject = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }

    // Immediately remove from local state for instant UI update
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  // Session operations
  const addSession = async (sessionData: Omit<Session, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase.from('sessions').insert({
      user_id: user.id,
      subject_id: sessionData.subjectId,
      date: sessionData.date,
      duration_minutes: sessionData.durationMinutes,
      topic: sessionData.topic || null,
      notes: sessionData.notes || null,
      rating: sessionData.rating,
    }).select();

    if (error) {
      console.error('Error adding session:', error);
      throw error;
    }

    // Immediately add to local state for instant UI update
    if (data && data.length > 0) {
      setSessions(prev => [dbSessionToSession(data[0]), ...prev]);
    }
  };

  const updateSession = async (id: string, sessionData: Partial<Session>) => {
    if (!user) return;

    const updateData: any = { updated_at: new Date().toISOString() };
    if (sessionData.subjectId !== undefined) updateData.subject_id = sessionData.subjectId;
    if (sessionData.date !== undefined) updateData.date = sessionData.date;
    if (sessionData.durationMinutes !== undefined) updateData.duration_minutes = sessionData.durationMinutes;
    if (sessionData.topic !== undefined) updateData.topic = sessionData.topic || null;
    if (sessionData.notes !== undefined) updateData.notes = sessionData.notes || null;
    if (sessionData.rating !== undefined) updateData.rating = sessionData.rating;

    const { data, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error('Error updating session:', error);
      throw error;
    }

    // Immediately update local state for instant UI update
    if (data && data.length > 0) {
      setSessions(prev => prev.map(s => s.id === id ? dbSessionToSession(data[0]) : s));
    }
  };

  const deleteSession = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting session:', error);
      throw error;
    }

    // Immediately remove from local state for instant UI update
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  // Task operations
  const addTask = async (text: string) => {
    if (!user) return;

    const { data, error } = await supabase.from('tasks').insert({
      user_id: user.id,
      text,
      completed: false,
    }).select();

    if (error) {
      console.error('Error adding task:', error);
      throw error;
    }

    // Immediately add to local state for instant UI update
    if (data && data.length > 0) {
      setTasks(prev => [dbTaskToTask(data[0]), ...prev]);
    }
  };

  const toggleTask = async (id: string) => {
    if (!user) return;

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Optimistically update UI
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

    const { error } = await supabase
      .from('tasks')
      .update({
        completed: !task.completed,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error toggling task:', error);
      // Revert on error
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: task.completed } : t));
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }

    // Immediately remove from local state for instant UI update
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return {
    subjects,
    sessions,
    tasks,
    loading,
    addSubject,
    updateSubject,
    deleteSubject,
    addSession,
    updateSession,
    deleteSession,
    addTask,
    toggleTask,
    deleteTask,
    refreshData: fetchData,
  };
};

