// ============================================================
// redux/features/appointmentSlice.js
//
// Redux Toolkit slice for the Appointment Booking feature.
//
// STATE SHAPE
// -----------
// appointments: {
//   list:        [],      – array of appointment records from the API
//   pagination:  {},      – pagination metadata { recordCount, pageCount }
//   loading:     false,   – true while an API call is in flight
//   error:       null,    – error message string or null
//   activeFilter: {       – current filter/search state (persisted across
//     pageIndex:  1,        page navigations within the session)
//     pageSize:   10,
//     searchText: ''
//   }
// }
//
// This slice is consumed by:
//   - Appointments.jsx   (customer "My Appointments" page)
//   - AppointmentBookig.jsx  (booking modal – reads user state)
//
// The slice is persisted via redux-persist so the customer's
// appointment list survives a page refresh.
// ============================================================
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axiosProvider from '@/lib/AxiosProvider'

// ----------------------------------------------------------------
// Async thunks
// ----------------------------------------------------------------

/**
 * fetchAppointments – loads the current user's appointment history.
 *
 * Called by Appointments.jsx on mount and whenever the filter changes.
 *
 * @param {Object} params
 * @param {string} params.userId       – customer user ID (from userSlice)
 * @param {number} [params.pageIndex]  – 1-based page number (default 1)
 * @param {number} [params.pageSize]   – records per page (default 10)
 */
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async ({ userId, pageIndex = 1, pageSize = 10 }, { rejectWithValue }) => {
    try {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'AppointmentData/Search',
        // The rebuilt API accepts both ?UserId= and ?pi= / ?ps=
        queryString: `?UserId=${userId}&pi=${pageIndex}&ps=${pageSize}`
      })

      if (response?.data?.code === 200) {
        return {
          list:       response.data.data,
          pagination: response.data.pagination
        }
      }

      // API returned a non-200 code – treat as empty list (not an error)
      return { list: [], pagination: { recordCount: 0, pageCount: 0 } }
    } catch (error) {
      // Propagate the error message to the rejected action
      return rejectWithValue(error?.message ?? 'Failed to fetch appointments')
    }
  }
)

/**
 * bookAppointment – submits a new appointment booking.
 *
 * Called by AppointmentBookig.jsx when the customer clicks
 * "Book an Appointment".
 *
 * @param {Object} payload  – matches CreateAppointmentDto on the backend
 */
export const bookAppointment = createAsyncThunk(
  'appointments/bookAppointment',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosProvider({
        method: 'POST',
        endpoint: 'AppointmentData',
        data: payload
      })

      if (response?.data?.code === 200) {
        return response.data.data
      }

      return rejectWithValue(response?.data?.message ?? 'Booking failed')
    } catch (error) {
      return rejectWithValue(error?.message ?? 'Booking failed')
    }
  }
)

// ----------------------------------------------------------------
// Slice definition
// ----------------------------------------------------------------

const initialState = {
  /** Appointment records for the current page. */
  list: [],

  /** Pagination metadata from the last Search response. */
  pagination: {
    recordCount: 0,
    pageCount: 0,
    pageIndex: 1,
    pageSize: 10
  },

  /** True while an API call is in flight. */
  loading: false,

  /** Error message from the last failed API call. */
  error: null,

  /** Persisted filter state for the "My Appointments" page. */
  activeFilter: {
    pageIndex: 1,
    pageSize: 10
  }
}

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,

  reducers: {
    /**
     * setActiveFilter – updates the filter state and resets to page 1
     * when the search criteria change.
     *
     * Called by Appointments.jsx when the user changes page size or
     * navigates to a different page.
     */
    setActiveFilter: (state, action) => {
      state.activeFilter = { ...state.activeFilter, ...action.payload }
    },

    /**
     * clearAppointments – resets the slice to its initial state.
     * Called on logout (in the logout reducer of userSlice) to ensure
     * a signed-out user never sees another user's appointments.
     */
    clearAppointments: () => initialState
  },

  extraReducers: (builder) => {
    // ---- fetchAppointments ----

    builder.addCase(fetchAppointments.pending, (state) => {
      state.loading = true
      state.error   = null
    })

    builder.addCase(fetchAppointments.fulfilled, (state, action) => {
      state.loading    = false
      state.list       = action.payload.list
      state.pagination = action.payload.pagination
    })

    builder.addCase(fetchAppointments.rejected, (state, action) => {
      state.loading = false
      state.error   = action.payload ?? 'Unknown error'
    })

    // ---- bookAppointment ----

    builder.addCase(bookAppointment.pending, (state) => {
      state.loading = true
      state.error   = null
    })

    builder.addCase(bookAppointment.fulfilled, (state, action) => {
      state.loading = false
      // Prepend the newly booked appointment to the list so it appears
      // immediately in the "My Appointments" page without a refetch.
      if (action.payload) {
        state.list = [action.payload, ...state.list]
        state.pagination.recordCount += 1
      }
    })

    builder.addCase(bookAppointment.rejected, (state, action) => {
      state.loading = false
      state.error   = action.payload ?? 'Booking failed'
    })
  }
})

export const { setActiveFilter, clearAppointments } = appointmentSlice.actions

export default appointmentSlice
