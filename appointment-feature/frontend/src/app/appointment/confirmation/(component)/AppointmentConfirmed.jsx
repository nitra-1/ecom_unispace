'use client';

import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearAppointment } from '@/redux/features/appointmentSlice';
import styles from '../../appointment.module.css';

export default function AppointmentConfirmed() {
  const router = useRouter();
  const dispatch = useDispatch();
  const confirmation = useSelector((state) => state.appointment.confirmation);

  // If someone navigates directly without a booking, redirect to booking page
  useEffect(() => {
    if (!confirmation) {
      router.replace('/appointment');
    }
  }, [confirmation, router]);

  if (!confirmation) return null;

  const {
    referenceNo,
    category,
    appointmentType,
    date,
    startTime,
    endTime,
    specialistName,
    meetingLink,
    message,
  } = confirmation;

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : date;

  const handleBookAnother = () => {
    dispatch(clearAppointment());
  };

  return (
    <div className={styles.confirmCard}>
      <div className={styles.confirmIcon}>✅</div>
      <h1 className={styles.confirmTitle}>Booking Confirmed!</h1>
      {message && <p>{message}</p>}

      <dl className={styles.confirmDetails}>
        <dt>Reference No</dt>
        <dd>{referenceNo}</dd>

        <dt>Category</dt>
        <dd style={{ textTransform: 'capitalize' }}>{category}</dd>

        <dt>Type</dt>
        <dd style={{ textTransform: 'capitalize' }}>
          {appointmentType === 'virtual' ? 'Virtual' : 'In-Person'}
        </dd>

        <dt>Date</dt>
        <dd>{formattedDate}</dd>

        <dt>Time</dt>
        <dd>
          {startTime} – {endTime}
        </dd>

        {specialistName && (
          <>
            <dt>Specialist</dt>
            <dd>{specialistName}</dd>
          </>
        )}

        {meetingLink && (
          <>
            <dt>Meeting Link</dt>
            <dd>
              <a
                href={meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.meetingLink}
              >
                {meetingLink}
              </a>
            </dd>
          </>
        )}
      </dl>

      <Link href="/appointment" className={styles.bookAnotherLink} onClick={handleBookAnother}>
        Book another consultation
      </Link>
    </div>
  );
}
