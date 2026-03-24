'use client';

import styles from '../appointment.module.css';

const APPOINTMENT_TYPES = [
  { value: 'virtual',  label: 'Virtual (Video / Phone Call)' },
  { value: 'inperson', label: 'In-Person (Showroom Visit)' },
];

export default function AppointmentTypeSelect({ value, onChange }) {
  return (
    <select
      id="appointmentType"
      className={styles.select}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">-- Select type --</option>
      {APPOINTMENT_TYPES.map((type) => (
        <option key={type.value} value={type.value}>
          {type.label}
        </option>
      ))}
    </select>
  );
}
