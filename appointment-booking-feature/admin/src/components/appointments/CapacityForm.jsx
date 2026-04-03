import React from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Switch, Button, Select, message } from 'antd'
import { appointmentAdminApi } from '../../lib/appointmentAdminApi'

const { Option } = Select

const DAY_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

const DURATION_OPTIONS = [15, 20, 30, 45, 60, 90, 120]

const validationSchema = Yup.object({
  sectionId: Yup.number().required('Section is required'),
  hourOfDay: Yup.number().min(0).max(23).required('Hour is required'),
  salespersonCount: Yup.number().min(1).max(50).required('Salesperson count is required'),
  appointmentDurationMinutes: Yup.number().min(5).required('Duration is required'),
})

/**
 * Formik form for creating/editing capacity rules.
 * @param {{ initialValues: object, sections: object[], onSuccess: () => void, onCancel: () => void }} props
 */
const CapacityForm = ({ initialValues, sections, onSuccess, onCancel }) => {
  const isEditing = !!initialValues?.capacityId

  const defaults = {
    sectionId: '',
    dayOfWeek: 1,
    specificDate: '',
    hourOfDay: 10,
    salespersonCount: 2,
    appointmentDurationMinutes: 30,
    isActive: true,
    ...initialValues,
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        sectionId: values.sectionId,
        dayOfWeek: values.specificDate ? null : values.dayOfWeek,
        specificDate: values.specificDate || null,
        hourOfDay: values.hourOfDay,
        salespersonCount: values.salespersonCount,
        appointmentDurationMinutes: values.appointmentDurationMinutes,
        isActive: values.isActive,
      }

      let res
      if (isEditing) {
        res = await appointmentAdminApi.updateCapacity(initialValues.capacityId, payload)
      } else {
        res = await appointmentAdminApi.createCapacity(payload)
      }

      if (res?.success) {
        message.success(isEditing ? 'Capacity rule updated' : 'Capacity rule created')
        onSuccess()
      } else {
        message.error(res?.message || 'Operation failed')
      }
    } catch {
      message.error('Unexpected error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
  const errorClass = 'text-red-500 text-xs mt-1'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <Formik
      initialValues={defaults}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, setFieldValue, isSubmitting }) => (
        <Form className="space-y-4 py-2">
          {/* Section */}
          <div>
            <label className={labelClass}>Section <span style={{ color: 'red' }}>*</span></label>
            <Select
              value={values.sectionId || undefined}
              onChange={(v) => setFieldValue('sectionId', v)}
              style={{ width: '100%' }}
              placeholder="Select section"
            >
              {(sections || []).map((s) => (
                <Option key={s.sectionId} value={s.sectionId}>{s.sectionName}</Option>
              ))}
            </Select>
            <ErrorMessage name="sectionId" component="p" className={errorClass} />
          </div>

          {/* Day of week or specific date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className={labelClass}>Day of Week</label>
              <Select
                value={values.dayOfWeek}
                onChange={(v) => setFieldValue('dayOfWeek', v)}
                style={{ width: '100%' }}
                disabled={!!values.specificDate}
              >
                {DAY_OPTIONS.map((d) => (
                  <Option key={d.value} value={d.value}>{d.label}</Option>
                ))}
              </Select>
            </div>
            <div>
              <label className={labelClass}>Specific Date (overrides day)</label>
              <Field name="specificDate" type="date" className={inputClass} />
            </div>
          </div>

          {/* Hour */}
          <div>
            <label className={labelClass}>Hour of Day (0–23) <span style={{ color: 'red' }}>*</span></label>
            <Field name="hourOfDay" type="number" min={0} max={23} className={inputClass} />
            <ErrorMessage name="hourOfDay" component="p" className={errorClass} />
          </div>

          {/* Salesperson count */}
          <div>
            <label className={labelClass}>Salesperson Count <span style={{ color: 'red' }}>*</span></label>
            <Field name="salespersonCount" type="number" min={1} max={50} className={inputClass} />
            <ErrorMessage name="salespersonCount" component="p" className={errorClass} />
          </div>

          {/* Duration */}
          <div>
            <label className={labelClass}>Appointment Duration (minutes) <span style={{ color: 'red' }}>*</span></label>
            <Select
              value={values.appointmentDurationMinutes}
              onChange={(v) => setFieldValue('appointmentDurationMinutes', v)}
              style={{ width: '100%' }}
            >
              {DURATION_OPTIONS.map((d) => (
                <Option key={d} value={d}>{d} min (→ {Math.floor(60 / d)} slots/hour)</Option>
              ))}
            </Select>
            <ErrorMessage name="appointmentDurationMinutes" component="p" className={errorClass} />
          </div>

          {/* Is Active */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label className={labelClass} style={{ margin: 0 }}>Active</label>
            <Switch
              checked={values.isActive}
              onChange={(v) => setFieldValue('isActive', v)}
              checkedChildren="Yes"
              unCheckedChildren="No"
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {isEditing ? 'Update Rule' : 'Create Rule'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default CapacityForm
