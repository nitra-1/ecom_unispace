'use client';

import styles from '../appointment.module.css';

export default function SlotCard({ slot, isSelected, onSelect }) {
  const { slotId, startTime, endTime, isAvailable } = slot;

  const label = `${startTime} – ${endTime}`;
  const availabilityText = isAvailable ? 'Available' : 'Unavailable';

  let cardClass = styles.slot;
  if (!isAvailable) {
    cardClass += ` ${styles.slotFull}`;
  } else if (isSelected) {
    cardClass += ` ${styles.slotAvailable} ${styles.slotSelected}`;
  } else {
    cardClass += ` ${styles.slotAvailable}`;
  }

  const handleClick = () => {
    if (isAvailable) onSelect(slot);
  };

  return (
    <button
      type="button"
      className={cardClass}
      onClick={handleClick}
      disabled={!isAvailable}
      aria-label={`${label}, ${availabilityText}`}
      aria-disabled={!isAvailable}
      aria-pressed={isSelected}
    >
      <span className={styles.slotTime}>{label}</span>
      <span className={styles.slotStatus}>{availabilityText}</span>
    </button>
  );
}
