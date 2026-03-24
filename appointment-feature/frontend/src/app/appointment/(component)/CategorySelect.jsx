'use client';

import { useEffect, useState } from 'react';
import axiosProvider from '@/lib/AxiosProvider';
import styles from '../appointment.module.css';

const FALLBACK_CATEGORIES = [
  { value: 'tiles',    label: 'Tiles' },
  { value: 'kitchen',  label: 'Kitchen' },
  { value: 'wardrobe', label: 'Wardrobe' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'lighting', label: 'Lighting' },
];

export default function CategorySelect({ value, onChange }) {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);

  useEffect(() => {
    axiosProvider({ method: 'GET', endpoint: 'Category/list' })
      .then((res) => {
        if (res?.data?.data?.length) {
          setCategories(
            res.data.data.map((c) => ({ value: c.slug, label: c.name }))
          );
        }
      })
      .catch(() => {
        // Fallback categories already set
      });
  }, []);

  return (
    <select
      id="category"
      className={styles.select}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">-- Select category --</option>
      {categories.map((cat) => (
        <option key={cat.value} value={cat.value}>
          {cat.label}
        </option>
      ))}
    </select>
  );
}
