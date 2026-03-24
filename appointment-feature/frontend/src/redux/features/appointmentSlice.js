import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosProvider from '@/lib/AxiosProvider';

// ─── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
  category: '',
  appointmentType: '',
  date: '',
  slots: [],
  selectedSlot: null,
  slotsLoading: false,
  slotsError: null,
  bookingLoading: false,
  bookingError: null,
  confirmation: null,
  userAppointments: [],
};

// ─── Async Thunks ──────────────────────────────────────────────────────────────

/**
 * Fetch available/unavailable time slots for a given category, type, and date.
 */
export const fetchSlots = createAsyncThunk(
  'appointment/fetchSlots',
  async ({ category, appointmentType, date }, { rejectWithValue }) => {
    try {
      const res = await axiosProvider({
        method: 'GET',
        endpoint: 'Appointment/Slots',
        params: { category, type: appointmentType, date },
      });
      if (res?.data?.data) return res.data.data;
      return rejectWithValue('Unable to load slots. Please try again.');
    } catch {
      return rejectWithValue('Unable to load slots. Please try again.');
    }
  }
);

/**
 * Create a new consultation-cum-sale appointment booking.
 */
export const bookAppointment = createAsyncThunk(
  'appointment/bookAppointment',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosProvider({
        method: 'POST',
        endpoint: 'Appointment/Book',
        data: payload,
      });
      if (res?.data?.data) return res.data.data;
      if (res?.data?.status === 409) {
        return rejectWithValue(
          'This slot was just booked. Please select another slot.'
        );
      }
      return rejectWithValue('Something went wrong. Please try again.');
    } catch {
      return rejectWithValue('Something went wrong. Please try again.');
    }
  }
);

/**
 * Fetch all appointments for the currently logged-in user.
 */
export const fetchUserAppointments = createAsyncThunk(
  'appointment/fetchUserAppointments',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosProvider({
        method: 'GET',
        endpoint: 'Appointment/byUserId',
        params: { userId },
      });
      if (res?.data?.data) return res.data.data;
      return rejectWithValue('Unable to fetch your appointments.');
    } catch {
      return rejectWithValue('Unable to fetch your appointments.');
    }
  }
);

/**
 * Cancel a pending or confirmed appointment.
 */
export const cancelAppointment = createAsyncThunk(
  'appointment/cancelAppointment',
  async ({ appointmentId, userId }, { rejectWithValue }) => {
    try {
      const res = await axiosProvider({
        method: 'PUT',
        endpoint: 'Appointment/Cancel',
        data: { appointmentId, userId },
      });
      if (res?.data?.status === 200) return appointmentId;
      return rejectWithValue(
        res?.data?.message ?? 'Unable to cancel the appointment.'
      );
    } catch {
      return rejectWithValue('Unable to cancel the appointment.');
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────────

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setCategory(state, action) {
      state.category = action.payload;
      state.selectedSlot = null;
      state.slots = [];
    },
    setAppointmentType(state, action) {
      state.appointmentType = action.payload;
      state.selectedSlot = null;
      state.slots = [];
    },
    setDate(state, action) {
      state.date = action.payload;
      state.selectedSlot = null;
      state.slots = [];
    },
    setSelectedSlot(state, action) {
      state.selectedSlot = action.payload;
    },
    clearAppointment() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // ── fetchSlots ──────────────────────────────────────────────────────────
    builder
      .addCase(fetchSlots.pending, (state) => {
        state.slotsLoading = true;
        state.slotsError = null;
        state.slots = [];
        state.selectedSlot = null;
      })
      .addCase(fetchSlots.fulfilled, (state, action) => {
        state.slotsLoading = false;
        state.slots = action.payload;
      })
      .addCase(fetchSlots.rejected, (state, action) => {
        state.slotsLoading = false;
        state.slotsError = action.payload;
      });

    // ── bookAppointment ─────────────────────────────────────────────────────
    builder
      .addCase(bookAppointment.pending, (state) => {
        state.bookingLoading = true;
        state.bookingError = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.bookingLoading = false;
        state.confirmation = action.payload;
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.bookingLoading = false;
        state.bookingError = action.payload;
      });

    // ── fetchUserAppointments ───────────────────────────────────────────────
    builder
      .addCase(fetchUserAppointments.fulfilled, (state, action) => {
        state.userAppointments = action.payload;
      });

    // ── cancelAppointment ───────────────────────────────────────────────────
    builder
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const id = action.payload;
        const appt = state.userAppointments.find(
          (a) => a.appointmentId === id
        );
        if (appt) appt.status = 'cancelled';
      });
  },
});

export const {
  setCategory,
  setAppointmentType,
  setDate,
  setSelectedSlot,
  clearAppointment,
} = appointmentSlice.actions;

export default appointmentSlice;
