import styles from '../appointment.module.css';

export default function SlotLegend() {
  return (
    <div className={styles.slotLegend} aria-label="Slot availability legend">
      <span className={`${styles.legendDot} ${styles.legendDotAvailable}`} aria-hidden="true" />
      <span>Available</span>
      <span className={`${styles.legendDot} ${styles.legendDotFull}`} aria-hidden="true" />
      <span>Unavailable</span>
    </div>
  );
}
