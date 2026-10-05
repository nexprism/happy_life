import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://happy-life-sx03.onrender.com';

export const fetchEvents = createAsyncThunk(
    'events/fetchEvents',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { page = 1, limit = 50, status = 'published' } = typeof params === 'object' ? params : {};
            let queryUrl = `${BASE_URL}/events?page=${page}&limit=${limit}`;
            if (status) {
                queryUrl += `&status=${encodeURIComponent(status)}`;
            }
            const response = await fetch(queryUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const eventSlice = createSlice({
    name: 'events',
    initialState: {
        eventList: [],
        loading: false,
        error: null,
        total: 0,
        currentPage: 1,
        totalPages: 1,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEvents.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.data) {
                    if (Array.isArray(action.payload.data)) {
                        state.eventList = action.payload.data;
                        state.total = action.payload.data.length;
                    } else {
                        const { data: events, total, page, totalPages } = action.payload.data;
                        state.eventList = Array.isArray(events) ? events : [];
                        state.total = total || 0;
                        state.currentPage = page || 1;
                        state.totalPages = totalPages || 1;
                    }
                } else if (Array.isArray(action.payload)) {
                    state.eventList = action.payload;
                    state.total = action.payload.length;
                }
            })
            .addCase(fetchEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default eventSlice.reducer;
