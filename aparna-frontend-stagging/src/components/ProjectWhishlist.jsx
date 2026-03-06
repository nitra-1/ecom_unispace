import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { reactImageUrl } from '@/lib/GetBaseUrl'
import { _productImg_ } from '@/lib/ImagePath'
import Image from 'next/image'
import Loader from './Loader'

export default function ProjectWishlist({
  product,
  onClose,
  onSaved,
  axiosProvider,
  brandId,
  sellerId,
  productId,
  setToast
}) {
  const { user } = useSelector((state) => state?.user)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [selectedId, setSelectedId] = useState(null) // project id
  const [error, setError] = useState('')

  // Helpers
  const toStr = (v) => (v == null ? '' : String(v))
  const getProjectId = (p) => p?.id ?? p?.projectId
  const getProjectName = (p) => p?.name ?? p?.projectName ?? 'Untitled'

  const selectedProject = useMemo(
    () =>
      projects.find((p) => toStr(getProjectId(p)) === toStr(selectedId)) ||
      null,
    [projects, selectedId]
  )

  const showToast = (text, variation = 'success') => {
    if (!setToast) return
    setToast({ show: true, text, variation })
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }))
    }, 1500)
  }

  // API calls
  const fetchWishlistProjects = async () => {
    const res = await axiosProvider({
      method: 'GET',
      endpoint: 'Wishlist/project',
      params: { userId: user?.userId }
    })
    return res?.data?.data || []
  }

  const createProject = async (values) => {
    const res = await axiosProvider({
      method: 'POST',
      endpoint: 'Wishlist/project',
      data: values
    })
    if (res?.data?.code !== 200) {
      throw new Error(res?.data?.message || 'Failed to create project')
    }
    return res?.data?.data
  }

  // Initial load
  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const proj = await fetchWishlistProjects()
        if (!mounted) return
        setProjects(Array.isArray(proj) ? proj : [])
      } catch (e) {
        if (!mounted) return
        setError(e.message || 'Failed to load wishlist data')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [axiosProvider, user?.userId])

  //   const handleCreateProject = async () => {
  //     if (!newName.trim()) return
  //     setSaving(true)
  //     setError('')
  //     try {
  //       const values = { name: newName.trim(), userId: user?.userId }
  //       const created = await createProject(values)

  //       const serverProjectId =
  //         created?.id ?? created?.projectId ?? created?.data?.id ?? created?.data?.projectId
  //       const serverProjectName =
  //         created?.name ?? created?.projectName ?? created?.data?.name ?? created?.data?.projectName ?? values.name

  //       setProjects((prev) => [{ id: serverProjectId, name: serverProjectName }, ...prev])
  //       setSelectedId(serverProjectId)

  //       setCreating(false)
  //       setNewName('')
  //       showToast('Project created', 'success')
  //     } catch (e) {
  //       setError(e.message)
  //       showToast(e.message, 'error')
  //     } finally {
  //       setSaving(false)
  //     }
  //   }
  const handleCreateProject = async () => {
    if (!newName.trim()) return
    setSaving(true)
    setError('')
    try {
      const values = { name: newName.trim(), userId: user?.userId }
      const created = await createProject(values)

      let serverProjectId =
        created?.id ??
        created?.projectId ??
        created?.data?.id ??
        created?.data?.projectId

      const serverProjectName =
        created?.name ??
        created?.projectName ??
        created?.data?.name ??
        created?.data?.projectName ??
        values.name

      // If no id in response, refetch and resolve by name
      if (!serverProjectId) {
        const fresh = await fetchWishlistProjects()
        const arr = Array.isArray(fresh) ? fresh : []
        setProjects(arr)
        const found = arr.find(
          (p) => (p?.name ?? p?.projectName) === values.name
        )
        if (!found) {
          throw new Error('Project created but no projectId returned by server')
        }
        serverProjectId = found?.id ?? found?.projectId
      } else {
        // optimistically insert
        setProjects((prev) => [
          { id: serverProjectId, name: serverProjectName },
          ...prev
        ])
      }

      // Critically: select the newly created project id
      setSelectedId(serverProjectId)

      setCreating(false)
      setNewName('')
      showToast('Project created', 'success')
    } catch (e) {
      setError(e.message)
      showToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Save product directly into project
  const handleSaveToProject = async (projectIdArg = null) => {
    const finalProjectId = projectIdArg || selectedId
    if (!finalProjectId) {
      setError('Please select a project')
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload = {
        wishlistProjectId: finalProjectId,
        productId,
        // products: product?.data,
        createdBy: user.userId,
        userId: user.userId,
        GetRoomlistProduct: true
        // sellerId,
        // brandId,
      }

      const res = await axiosProvider({
        method: 'POST',
        endpoint: 'Wishlist',
        data: payload
      })

      if (res?.data?.code !== 200) {
        throw new Error(res?.data?.message || 'Failed to add to wishlist')
      }

      showToast('Added to wishlist', 'success')
      onSaved?.(selectedProject || { id: finalProjectId })
      onClose?.()
    } catch (e) {
      setError(e.message)
      showToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold text-xl md:text-24">
          {creating
            ? 'Save to Room and Space List'
            : 'Create New Room and Space List'}
        </h2>
        <i
          className="m-icon mp-close flex-shrink-0 cursor-pointer w-[18px] h-[18px] bg-gray-600"
          onClick={onClose}
        />
      </div>
      <div className="flex gap-3 sm:gap-6">
        {product?.data?.productImage && (
          <Image
            src={`${reactImageUrl}${_productImg_}${product?.data?.productImage?.[0]?.url}`}
            alt={product?.title || product?.data?.productName || 'Product'}
            height={100}
            width={100}
            quality={100}
            className="object-contain rounded max-sm:w-[3.125rem]"
          />
        )}
        {product?.data?.productName && (
          <div>
            <h3 className="text-base sm:text-lg font-medium mb-1">
              {product?.data?.productName}
            </h3>
            <p className="text-sm font-normal text-[#666687]">
              SKU: {product?.data?.companySKUCode}
            </p>
          </div>
        )}
      </div>
      <div>
        {!creating ? (
          <button
            type="button"
            onClick={() => {
              setCreating(true)
            }}
            className="mt-2.5 bg-transparent font-medium py-[10px] px-3 cursor-pointer text-primary"
          >
            ＋ Create new
          </button>
        ) : (
          <div className="mt-[10px]">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter Your Project name"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              className="w-full py-[10px] px-3 border border-[#ddd] rounded-md"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                onClick={handleCreateProject}
                disabled={saving || !newName.trim()}
                className="bg-primary py-[10px] px-[14px] rounded-md w-1/2 text-white cursor-pointer"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreating(false)
                  setNewName('')
                }}
                disabled={saving}
                className="w-1/2 border-primary text-primary rounded-md border py-[10px] px-[14px]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <>
            {/* <div className="sm:min-h-[16.25rem]">Loading projects…</div> */}
            <Loader />
          </>
        ) : (
          <>
            {!creating && (
              <div className="max-h-[16.25rem] overflow-y-auto">
                {projects.map((p, index) => {
                  const pid = getProjectId(p)
                  const pname = getProjectName(p)
                  const lastIndex = index === projects.length - 1
                  return (
                    <button
                      type="button"
                      key={pid}
                      onClick={() => setSelectedId(pid)}
                      className={`w-full text-left py-[10px] px-3 ${
                        toStr(selectedId) === toStr(pid)
                          ? 'bg-[#F6F6F9] font-semibold'
                          : 'font-normal'
                      } ${
                        !lastIndex ? 'border-b border-[#f5f5f5]' : ''
                      } cursor-pointer flex items-center`}
                    >
                      <span className="text-base">{pname}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
      {/* </div> */}

      {error && <div className="text-[#c00] mt-2">{error}</div>}
      {!creating && (
        <div className="flex items-center gap-4 mt-4">
          <button
            type="button"
            onClick={() => handleSaveToProject()}
            disabled={saving || !selectedId}
            className="bg-primary py-[10px] px-[14px] rounded-md w-1/2 text-white cursor-pointer"
          >
            {creating ? 'Create' : saving ? 'Saving…' : 'Save & Continue'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-1/2 border-primary text-primary rounded-md border py-[10px] px-[14px]"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
