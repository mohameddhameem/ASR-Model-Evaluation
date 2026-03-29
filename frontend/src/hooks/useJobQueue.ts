import { useState, useCallback } from 'react';

export interface Job {
  id: string;
  name: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: number;
  endTime?: number;
  error?: string;
}

export function useJobQueue() {
  const [jobs, setJobs] = useState<Job[]>([]);

  const addJob = useCallback((name: string) => {
    const id = Math.random().toString(36).substring(7);
    const job: Job = {
      id,
      name,
      status: 'queued',
      progress: 0,
      startTime: Date.now(),
    };
    setJobs(prev => [...prev, job]);
    return id;
  }, []);

  const updateJob = useCallback((id: string, updates: Partial<Job>) => {
    setJobs(prev =>
      prev.map(job =>
        job.id === id ? { ...job, ...updates } : job
      )
    );
  }, []);

  const startJob = useCallback((id: string) => {
    updateJob(id, { status: 'processing', progress: 0 });
  }, [updateJob]);

  const completeJob = useCallback((id: string) => {
    updateJob(id, {
      status: 'completed',
      progress: 100,
      endTime: Date.now(),
    });
  }, [updateJob]);

  const failJob = useCallback((id: string, error: string) => {
    updateJob(id, {
      status: 'failed',
      error,
      endTime: Date.now(),
    });
  }, [updateJob]);

  const setJobProgress = useCallback((id: string, progress: number) => {
    updateJob(id, { progress: Math.min(100, Math.max(0, progress)) });
  }, [updateJob]);

  const removeJob = useCallback((id: string) => {
    setJobs(prev => prev.filter(job => job.id !== id));
  }, []);

  const clearCompletedJobs = useCallback(() => {
    setJobs(prev => prev.filter(job => job.status !== 'completed'));
  }, []);

  const getActiveJobs = useCallback(() => {
    return jobs.filter(job => job.status === 'processing' || job.status === 'queued');
  }, [jobs]);

  return {
    jobs,
    addJob,
    updateJob,
    startJob,
    completeJob,
    failJob,
    setJobProgress,
    removeJob,
    clearCompletedJobs,
    getActiveJobs,
  };
}
