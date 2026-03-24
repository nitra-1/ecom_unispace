'use client';

import styles from '../appointment.module.css';

export default function ConfirmButton({ disabled, loading, onClick }) {
  return (
    <button
      type="button"
      className={`${styles.confirmBtn} ${disabled ? styles.confirmBtnDisabled : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
    >
      {loading ? (
        <span className={styles.spinner} aria-label="Booking in progress…" />
      ) : (
        'Confirm Booking'
      )}
    </button>
  );
}
