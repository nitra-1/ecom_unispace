'use client';

import styles from '../appointment.module.css';

const today = () => new Date().toISOString().split('T')[0];
const maxDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d.toISOString().split('T')[0];
};

export default function DatePicker({ value, onChange }) {
  return (
    <input
      id="date"
      type="date"
      className={styles.input}
      value={value}
      min={today()}
      max={maxDate()}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
