'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

import CategorySelect from './CategorySelect';
import AppointmentTypeSelect from './AppointmentTypeSelect';
import DatePicker from './DatePicker';
import SlotGrid from './SlotGrid';
import SlotLegend from './SlotLegend';
import ConfirmButton from './ConfirmButton';

import {
  setCategory,
  setAppointmentType,
  setDate,
  setSelectedSlot,
  fetchSlots,
  bookAppointment,
  clearAppointment,
} from '@/redux/features/appointmentSlice';

import styles from '../appointment.module.css';

export default function AppointmentBooking() {
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    category,
    appointmentType,
    date,
    slots,
    selectedSlot,
    slotsLoading,
    slotsError,
    bookingLoading,
    bookingError,
    confirmation,
  } = useSelector((state) => state.appointment);

  // Fetch slots whenever category, type, or date changes (all three must be set)
  useEffect(() => {
    if (category && appointmentType && date) {
      dispatch(fetchSlots({ category, appointmentType, date }));
    }
  }, [category, appointmentType, date, dispatch]);

  // Navigate to confirmation page after a successful booking
  useEffect(() => {
    if (confirmation) {
      router.push('/appointment/confirmation');
    }
  }, [confirmation, router]);

  const handleConfirm = () => {
    if (!category || !appointmentType || !date || !selectedSlot) return;
    dispatch(
      bookAppointment({
        category,
        appointmentType,
        date,
        slotId: selectedSlot.slotId,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      })
    );
  };

  const isConfirmDisabled =
    !category || !appointmentType || !date || !selectedSlot;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Book a Consultation</h1>
      <p className={styles.subheading}>
        Schedule a one-on-one session with an Aparna product specialist.
      </p>

      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="category">
          Product Category
        </label>
        <CategorySelect
          value={category}
          onChange={(val) => dispatch(setCategory(val))}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="appointmentType">
          Appointment Type
        </label>
        <AppointmentTypeSelect
          value={appointmentType}
          onChange={(val) => dispatch(setAppointmentType(val))}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="date">
          Select Date
        </label>
        <DatePicker
          value={date}
          onChange={(val) => dispatch(setDate(val))}
        />
      </div>

      {slotsError && (
        <p className={styles.errorMsg} role="alert">
          {slotsError}
        </p>
      )}

      {(category && appointmentType && date) && (
        <div className={styles.formGroup}>
          <label className={styles.label}>Available Time Slots</label>
          <SlotGrid
            slots={slots}
            selectedSlotId={selectedSlot?.slotId ?? null}
            onSelect={(slot) => dispatch(setSelectedSlot(slot))}
            loading={slotsLoading}
          />
          <SlotLegend />
        </div>
      )}

      {bookingError && (
        <p className={styles.errorMsg} role="alert">
          {bookingError}
        </p>
      )}

      <ConfirmButton
        disabled={isConfirmDisabled}
        loading={bookingLoading}
        onClick={handleConfirm}
      />
    </div>
  );
}
