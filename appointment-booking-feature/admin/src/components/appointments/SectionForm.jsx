/**
 * SectionForm.jsx — Formik-based form for creating/editing appointment sections.
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ INTEGRATION WITH EF CORE DATABASE-FIRST BACKEND                               │
 * │                                                                            │
 * │ This form submits to the AppointmentSectionController:                     │
 * │   POST api/Appointment/Section         (create)                            │
 * │   PUT  api/Appointment/Section/{id}    (update)                            │
 * │                                                                            │
 * │ The backend model is dbo.AppointmentSection (EF Core DB-First scaffolded).     │
 * │ All column mappings are in AppointmentDbContext.OnModelCreating().          │
 * │                                                                            │
 * │ Form fields map to the SectionRequest DTO:                                 │
 * │   sectionName → SectionRequest.SectionName (max 100, required)            │
 * │   description → SectionRequest.Description (max 500, optional)            │
 * │   location    → SectionRequest.Location    (max 200, optional)            │
 * │   imageUrl    → SectionRequest.ImageUrl    (max 500, optional URL)        │
 * │   isActive    → SectionRequest.IsActive    (bool, default true)           │
 * │                                                                            │
 * │ The Yup validation below mirrors the SQL Server column constraints.        │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Switch, Button, message } from 'antd'
import { appointmentAdminApi } from '../../lib/appointmentAdminApi'

// Yup validation schema — mirrors the DB column constraints from
// dbo.AppointmentSection (scaffolded via EF Core Database-First)
const validationSchema = Yup.object({
  sectionName: Yup.string().required('Section name is required').max(100),
  description: Yup.string().max(500),
  location: Yup.string().max(200),
  imageUrl: Yup.string().url('Must be a valid URL').nullable(),
})

/**
 * Formik-powered form for creating or editing an appointment section.
 * @param {{ initialValues: object|null, onSuccess: () => void, onCancel: () => void }} props
 */
const SectionForm = ({ initialValues, onSuccess, onCancel }) => {
  const isEditing = !!initialValues?.sectionId

  const defaults = {
    sectionName: '',
    description: '',
    location: '',
    imageUrl: '',
    isActive: true,
    ...initialValues,
  }

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const payload = {
        sectionName: values.sectionName.trim(),
        description: values.description?.trim() || null,
        location: values.location?.trim() || null,
        imageUrl: values.imageUrl?.trim() || null,
        isActive: values.isActive,
      }

      let res
      if (isEditing) {
        res = await appointmentAdminApi.updateSection(initialValues.sectionId, payload)
      } else {
        res = await appointmentAdminApi.createSection(payload)
      }

      if (res?.success) {
        message.success(isEditing ? 'Section updated' : 'Section created')
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
          {/* Section Name */}
          <div>
            <label className={labelClass}>
              Section Name <span style={{ color: 'red' }}>*</span>
            </label>
            <Field name="sectionName" className={inputClass} placeholder="e.g. Kitchen & Dining" />
            <ErrorMessage name="sectionName" component="p" className={errorClass} />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <Field
              as="textarea"
              name="description"
              rows={3}
              className={inputClass}
              placeholder="Brief description of this section"
            />
            <ErrorMessage name="description" component="p" className={errorClass} />
          </div>

          {/* Location */}
          <div>
            <label className={labelClass}>Location</label>
            <Field name="location" className={inputClass} placeholder="e.g. Floor 1, Wing A" />
            <ErrorMessage name="location" component="p" className={errorClass} />
          </div>

          {/* Image URL */}
          <div>
            <label className={labelClass}>Image URL</label>
            <Field
              name="imageUrl"
              type="url"
              className={inputClass}
              placeholder="https://cdn.aparna.com/sections/..."
            />
            <ErrorMessage name="imageUrl" component="p" className={errorClass} />
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

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
            <Button onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {isEditing ? 'Update Section' : 'Create Section'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default SectionForm
