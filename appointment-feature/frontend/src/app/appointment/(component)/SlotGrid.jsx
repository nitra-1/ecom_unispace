'use client';

import SlotCard from './SlotCard';
import styles from '../appointment.module.css';

const SKELETON_COUNT = 9;

export default function SlotGrid({ slots, selectedSlotId, onSelect, loading }) {
  if (loading) {
    return (
      <div className={styles.slotGrid} aria-busy="true" aria-label="Loading time slots">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div key={i} className={styles.slotSkeleton} />
        ))}
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <p className={styles.noSlots}>
        No slots available for the selected date. Please try another date.
      </p>
    );
  }

  return (
    <div className={styles.slotGrid}>
      {slots.map((slot) => (
        <SlotCard
          key={slot.slotId}
          slot={slot}
          isSelected={selectedSlotId === slot.slotId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
