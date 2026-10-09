import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authorizedFetch from '../../utils/apiClient';

// Helper: simple concurrency limiter
const runWithConcurrency = async (items, worker, concurrency = 5) => {
  const results = [];
  let i = 0;
  const runners = new Array(concurrency).fill(0).map(async () => {
    while (i < items.length) {
      const idx = i++;
      try {
        const res = await worker(items[idx], idx);
        results[idx] = { status: 'fulfilled', value: res };
      } catch (err) {
        results[idx] = { status: 'rejected', reason: err };
      }
    }
  });
  await Promise.all(runners);
  return results;
};

// Thunk: fetch unlock status + progress for an array of lessons
export const fetchLessonsStatus = createAsyncThunk(
  'drip/fetchLessonsStatus',
  async ({ userId, lessons }, thunkAPI) => {
    if (!Array.isArray(lessons) || lessons.length === 0) return {};

    const worker = async (lesson) => {
      const targetId = lesson._id || lesson.id || lesson;
      const targetType = 'lesson';

      // POST check-unlock-conditions
      let checkResp = {};
      try {
        const res = await authorizedFetch('/drip/check-unlock-conditions', {
          method: 'POST',
          body: JSON.stringify({ userId, targetId, targetType }),
        });
        if (res.ok) checkResp = await res.json();
      } catch (e) {
        checkResp = {};
      }

      // GET progress
      const courseId = lesson.courseId || lesson.course || '';
      const progressPath = `/courses/${courseId}/lessons/${targetId}/progress`;
      let progressResp = null;
      try {
        const p = await authorizedFetch(progressPath, { method: 'GET' });
        if (p.ok) progressResp = await p.json();
      } catch (e) {
        progressResp = null;
      }

      let progress = 0;
      if (progressResp) {
        if (typeof progressResp.progress === 'number') progress = progressResp.progress;
        else if (typeof progressResp.percentage === 'number') progress = progressResp.percentage;
        else if (progressResp.success && progressResp.data && typeof progressResp.data.progressPercentage === 'number') {
          progress = progressResp.data.progressPercentage;
        } else if (typeof progressResp.progressPercentage === 'number') {
          progress = progressResp.progressPercentage;
        }
      }

      const unlocked = (checkResp?.canUnlock === true) || (checkResp?.unlocked === true) || (checkResp?.allowed === true) || (checkResp?.isLocked === false) || false;
      const completed = progress >= 80 || progressResp?.data?.completed || false;

      return { lessonId: targetId, progress, unlocked, completed };
    };

    const results = await runWithConcurrency(lessons, worker, 6);

    const map = {};
    results.forEach((r) => {
      if (r && r.status === 'fulfilled' && r.value) {
        map[r.value.lessonId] = { progress: r.value.progress, unlocked: r.value.unlocked, completed: r.value.completed };
      }
    });

    return map;
  }
);

const dripSlice = createSlice({
  name: 'drip',
  initialState: {
    statuses: {},
    loading: false,
    error: null,
  },
  reducers: {
    setLessonStatus(state, action) {
      const { lessonId, status } = action.payload;
      state.statuses[lessonId] = { ...(state.statuses[lessonId] || {}), ...status };
    },
    clearDrip(state) {
      state.statuses = {};
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLessonsStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonsStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.statuses = { ...(state.statuses || {}), ...(action.payload || {}) };
      })
      .addCase(fetchLessonsStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to fetch drip statuses';
      });
  },
});

export const { setLessonStatus, clearDrip } = dripSlice.actions;
export default dripSlice.reducer;
