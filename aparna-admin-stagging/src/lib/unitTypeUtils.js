export function getUnitTypeOptions(apiData) {
  if (!Array.isArray(apiData)) return []
  const unitType = apiData.find((item) => item.keyName === 'unit_type')
  if (!unitType || typeof unitType.value !== 'string') return []
  return unitType.value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}
