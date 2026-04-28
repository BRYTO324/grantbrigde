import { useState, useEffect } from 'react';
import { projectsApi, analyticsApi, fundingApi, notificationsApi } from './api';

export function useProjects(params?: Record<string, string>) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    projectsApi.list(params)
      .then((res: any) => {
        setData(res.data || []);
        setMeta(res.meta || null);
      })
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);

  return { data, loading, error, meta };
}

export function useMyProjects() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    projectsApi.myProjects()
      .then((res: any) => setData(res.data || []))
      .catch(() => setError('Failed to load your projects'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    analyticsApi.myDashboard()
      .then((res: any) => setData(res.data || {}))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useMyTransactions() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fundingApi.myTransactions()
      .then((res: any) => setData(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useNotifications() {
  const [data, setData] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationsApi.list()
      .then((res: any) => {
        const items = res.data || [];
        setData(items);
        setUnread(items.filter((n: any) => !n.is_read).length);
      })
      .catch(() => {});
  }, []);

  return { data, unread };
}
