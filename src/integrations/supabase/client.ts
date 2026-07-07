import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Mock database helper functions
const getLocalData = (table: string): any[] => {
  try {
    const data = localStorage.getItem(`local_db_${table}`);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(`Error reading local db table ${table}`, e);
    return [];
  }
};

const setLocalData = (table: string, data: any[]) => {
  try {
    localStorage.setItem(`local_db_${table}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing local db table ${table}`, e);
  }
};

// Default mock user
const DEFAULT_DEMO_USER = {
  id: 'demo-user-uuid-1234-5678',
  email: 'demo@lifescript.com',
  user_metadata: {
    display_name: 'Demo User',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150'
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

// Create a robust Mock Supabase Client
const createMockSupabaseClient = () => {
  let authChangeCallbacks: Function[] = [];
  
  const getSessionUser = () => {
    try {
      const stored = localStorage.getItem('local_db_session_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const setSessionUser = (user: any) => {
    if (user) {
      localStorage.setItem('local_db_session_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('local_db_session_user');
    }
  };

  const getSession = () => {
    const user = getSessionUser();
    if (!user) return null;
    return {
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user,
    };
  };

  const triggerAuthChange = (event: string) => {
    const session = getSession();
    authChangeCallbacks.forEach(cb => cb(event, session));
  };

  return {
    auth: {
      onAuthStateChange: (callback: Function) => {
        authChangeCallbacks.push(callback);
        // Call immediately with current session
        setTimeout(() => {
          callback(getSessionUser() ? 'INITIAL_SESSION' : 'SIGNED_OUT', getSession());
        }, 0);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                authChangeCallbacks = authChangeCallbacks.filter(cb => cb !== callback);
              }
            }
          }
        };
      },
      getSession: async () => {
        return { data: { session: getSession() }, error: null };
      },
      signInWithPassword: async ({ email, password }: any) => {
        // Authenticate any user with password longer than 5 chars, or default demo
        if (password && password.length >= 6) {
          const user = {
            ...DEFAULT_DEMO_USER,
            email: email || DEFAULT_DEMO_USER.email,
            user_metadata: {
              ...DEFAULT_DEMO_USER.user_metadata,
              display_name: email ? email.split('@')[0] : 'Demo User',
            }
          };
          setSessionUser(user);
          triggerAuthChange('SIGNED_IN');
          return { data: { user, session: getSession() }, error: null };
        }
        return { data: { user: null, session: null }, error: { message: 'Invalid password. Must be at least 6 characters.' } };
      },
      signUp: async ({ email, password, options }: any) => {
        const user = {
          id: `user-${Math.random().toString(36).substr(2, 9)}`,
          email,
          user_metadata: {
            display_name: options?.data?.display_name || email.split('@')[0],
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150'
          },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        setSessionUser(user);
        triggerAuthChange('SIGNED_IN');
        return { data: { user, session: getSession() }, error: null };
      },
      signOut: async () => {
        setSessionUser(null);
        triggerAuthChange('SIGNED_OUT');
        return { error: null };
      },
    },

    from: (table: string) => {
      const filters: { col: string; val: any; type: string }[] = [];
      let orderCol: string | null = null;
      let orderAscending = true;
      let limitVal: number | null = null;
      let isSingle = false;
      let deleteCalled = false;
      let updateData: any = null;
      let insertData: any = null;
      let upsertData: any = null;

      const executeQuery = () => {
        let items = getLocalData(table);
        const currentUser = getSessionUser();

        // Auto-initialize empty tables with mock starter items for demo if empty
        if (items.length === 0 && currentUser) {
          if (table === 'profiles') {
            items = [{
              id: currentUser.id,
              display_name: currentUser.user_metadata?.display_name || 'Demo User',
              avatar_url: currentUser.user_metadata?.avatar_url || '',
              xp_points: 120,
              level: 2,
              current_streak: 5,
              best_streak: 10,
              streak_freeze_count: 1,
              total_tasks_completed: 12,
              calorie_goal: 2000,
              activity_level: 'moderate',
              age: 25,
              weight_kg: 70,
              height_cm: 175,
              gender: 'male',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }];
            setLocalData(table, items);
          } else if (table === 'goals') {
            items = [
              { id: '1', user_id: currentUser.id, title: 'Read Books', current_progress: 2, target_value: 5, unit: 'books', category: 'Growth', status: 'active', deadline: new Date(Date.now() + 86400000 * 5).toISOString() },
              { id: '2', user_id: currentUser.id, title: 'Drink Water', current_progress: 4, target_value: 8, unit: 'glasses', category: 'Health', status: 'active', deadline: new Date(Date.now() + 86400000 * 2).toISOString() }
            ];
            setLocalData(table, items);
          } else if (table === 'tasks') {
            items = [
              { id: 't1', user_id: currentUser.id, title: 'Plan weekly roadmap', status: 'pending', priority: 'high', category: 'work', due_date: new Date().toISOString(), scheduled_date: new Date().toISOString().split('T')[0] },
              { id: 't2', user_id: currentUser.id, title: 'Workout session', status: 'completed', priority: 'medium', category: 'health', due_date: new Date().toISOString(), scheduled_date: new Date().toISOString().split('T')[0], is_completed: true }
            ];
            setLocalData(table, items);
          }
        }

        // Apply filters
        filters.forEach(f => {
          items = items.filter(item => {
            const itemVal = item[f.col];
            if (f.type === 'eq') {
              if (Array.isArray(f.val)) return f.val.includes(itemVal);
              return String(itemVal) === String(f.val);
            }
            if (f.type === 'neq') return String(itemVal) !== String(f.val);
            if (f.type === 'gte') return new Date(itemVal) >= new Date(f.val) || itemVal >= f.val;
            if (f.type === 'lte') return new Date(itemVal) <= new Date(f.val) || itemVal <= f.val;
            return true;
          });
        });

        // Handle delete
        if (deleteCalled) {
          const original = getLocalData(table);
          const remaining = original.filter(item => {
            const matchesFilters = filters.every(f => {
              const itemVal = item[f.col];
              return String(itemVal) === String(f.val);
            });
            return !matchesFilters;
          });
          setLocalData(table, remaining);
          return remaining;
        }

        // Handle update
        if (updateData) {
          const original = getLocalData(table);
          const updatedList = original.map(item => {
            const matchesFilters = filters.every(f => {
              const itemVal = item[f.col];
              return String(itemVal) === String(f.val);
            });
            if (matchesFilters) {
              return { ...item, ...updateData, updated_at: new Date().toISOString() };
            }
            return item;
          });
          setLocalData(table, updatedList);
          return updatedList.filter(item => {
            return filters.every(f => String(item[f.col]) === String(f.val));
          });
        }

        // Handle insert
        if (insertData) {
          const original = getLocalData(table);
          const newItems = Array.isArray(insertData) 
            ? insertData.map(i => ({ id: Math.random().toString(36).substr(2, 9), user_id: currentUser?.id, created_at: new Date().toISOString(), ...i }))
            : [{ id: Math.random().toString(36).substr(2, 9), user_id: currentUser?.id, created_at: new Date().toISOString(), ...insertData }];
          
          const combined = [...original, ...newItems];
          setLocalData(table, combined);
          return newItems;
        }

        // Handle upsert
        if (upsertData) {
          const original = getLocalData(table);
          const upsertList = Array.isArray(upsertData) ? upsertData : [upsertData];
          const updatedOriginal = original.map(item => {
            const matchingUpsert = upsertList.find(u => {
              if (table === 'daily_goals') {
                return u.goal_date === item.goal_date && (u.user_id === item.user_id || currentUser?.id === item.user_id);
              }
              return u.id === item.id;
            });
            if (matchingUpsert) {
              return { ...item, ...matchingUpsert, updated_at: new Date().toISOString() };
            }
            return item;
          });

          const nonMatchingUpserts = upsertList.filter(u => {
            if (table === 'daily_goals') {
              return !original.some(item => item.goal_date === u.goal_date && (item.user_id === u.user_id || currentUser?.id === item.user_id));
            }
            return !original.some(item => item.id === u.id);
          }).map(u => ({ id: Math.random().toString(36).substr(2, 9), user_id: currentUser?.id, created_at: new Date().toISOString(), ...u }));

          const combined = [...updatedOriginal, ...nonMatchingUpserts];
          setLocalData(table, combined);
          return [...updatedOriginal.filter(item => {
            if (table === 'daily_goals') {
              return upsertList.some(u => u.goal_date === item.goal_date);
            }
            return upsertList.some(u => u.id === item.id);
          }), ...nonMatchingUpserts];
        }

        // Apply sorting
        if (orderCol) {
          items.sort((a, b) => {
            const valA = a[orderCol!];
            const valB = b[orderCol!];
            if (valA < valB) return orderAscending ? -1 : 1;
            if (valA > valB) return orderAscending ? 1 : -1;
            return 0;
          });
        }

        // Apply limits
        if (limitVal !== null) {
          items = items.slice(0, limitVal);
        }

        if (isSingle) {
          return items.length > 0 ? items[0] : null;
        }

        return items;
      };

      const chain = {
        select: (fields?: string) => chain,
        insert: (data: any) => {
          insertData = data;
          return chain;
        },
        update: (data: any) => {
          updateData = data;
          return chain;
        },
        upsert: (data: any) => {
          upsertData = data;
          return chain;
        },
        delete: () => {
          deleteCalled = true;
          return chain;
        },
        eq: (col: string, val: any) => {
          filters.push({ col, val, type: 'eq' });
          return chain;
        },
        neq: (col: string, val: any) => {
          filters.push({ col, val, type: 'neq' });
          return chain;
        },
        gt: (col: string, val: any) => chain,
        gte: (col: string, val: any) => {
          filters.push({ col, val, type: 'gte' });
          return chain;
        },
        lt: (col: string, val: any) => chain,
        lte: (col: string, val: any) => {
          filters.push({ col, val, type: 'lte' });
          return chain;
        },
        or: (val: string) => chain,
        order: (col: string, options?: { ascending?: boolean }) => {
          orderCol = col;
          orderAscending = options?.ascending !== false;
          return chain;
        },
        limit: (val: number) => {
          limitVal = val;
          return chain;
        },
        single: () => {
          isSingle = true;
          return chain;
        },
        maybeSingle: () => {
          isSingle = true;
          return chain;
        },
        // Thenable implementation to support async/await directly
        then: (onfulfilled?: (value: any) => any) => {
          try {
            const res = executeQuery();
            return Promise.resolve({ data: res, error: null }).then(onfulfilled);
          } catch (err: any) {
            return Promise.resolve({ data: null, error: err }).then(onfulfilled);
          }
        }
      };

      return chain;
    },

    functions: {
      invoke: async (functionName: string, options?: any) => {
        console.log(`Mocking Supabase Edge Function: ${functionName}`, options);
        if (functionName === 'ai-motivation') {
          return {
            data: {
              motivation: "🎯 Progress is not about perfection. You are building momentum every day. Keep going!"
            },
            error: null
          };
        }
        if (functionName === 'generate-daily-summary') {
          return {
            data: {
              summary: "📊 You completed tasks and logged nutritional habits today. Keep maintaining this solid streak!"
            },
            error: null
          };
        }
        return { data: {}, error: null };
      }
    },

    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: any) => {
          return { data: { path }, error: null };
        },
        getPublicUrl: (path: string) => {
          return {
            data: {
              publicUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150'
            }
          };
        }
      })
    }
  };
};

// Export the mock client if offline mode is configured, otherwise export standard Supabase client
const isOffline = SUPABASE_URL === 'http://localhost:54321' || !SUPABASE_URL || SUPABASE_URL.includes('offline');

export const supabase = isOffline 
  ? (createMockSupabaseClient() as any)
  : createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    });