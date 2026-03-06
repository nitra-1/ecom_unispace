'use client'

import { useSelector } from 'react-redux'
import MyaccountMenu from '@/components/MyaccountMenu'
import axiosProvider from '@/lib/AxiosProvider'
import { useEffect, useState } from 'react'
import GroupProducts from './GroupProducts' // Make sure this path is correct
import EmptyComponent from '@/components/EmptyComponent'
import Swal from 'sweetalert2'
import { _SwalDelete } from '@/lib/exceptionMessage'
import Loader from '@/components/Loader'
import ProjectListSkeleton from '@/components/skeleton/ProjectListSkeleton'

const Projects = () => {
  const { user } = useSelector((state) => state?.user)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState([])
  const [products, setProducts] = useState([])

  // --- MODIFICATION: State for accordion ---
  const [openProjectId, setOpenProjectId] = useState(null)
  // --- (Removed modal state) ---

  const addToast = (type, message, ttl = 3500) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, type, message }])
    if (ttl > 0) {
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id))
      }, ttl)
    }
  }

  const dismissToast = (id) => setToasts((t) => t.filter((x) => x.id !== id))

  const getProjectId = (p) => p?.id ?? p?.projectId
  const getProjectName = (p) => p?.name ?? p?.projectName ?? 'Untitled'
  const getProjectTotal = (p) => p?.totalProduct ?? 0

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      try {
        const res = await axiosProvider({
          method: 'GET',
          endpoint: 'Wishlist/project',
          params: { userId: user?.userId }
        })
        setProjects(res?.data?.data || [])
      } catch {
        setProjects([])
        addToast('error', 'Failed to load projects')
      } finally {
        setLoading(false)
      }
    }

    if (user?.userId) {
      fetchProjects()
    } else {
      setLoading(false)
    }
  }, [user?.userId])

  // --- MODIFICATION: Toggle function ---
  const handleToggleProject = (projectId) => {
    setOpenProjectId((prevId) => (prevId === projectId ? null : projectId))
  }
  // --- (Removed handleOpenModal and handleCloseModal) ---

  const handleDeleteProject = async (projectId) => {
    if (!projectId) return
    const prevProjects = projects
    setProjects((ps) => ps.filter((p) => getProjectId(p) !== projectId))
    // If the open project is deleted, close the accordion
    if (openProjectId === projectId) {
      setOpenProjectId(null)
    }
    try {
      await axiosProvider({
        method: 'DELETE',
        endpoint: 'Wishlist/project',
        params: { userId: user?.userId, id: projectId }
      })
      addToast('success', 'Project deleted')
    } catch (e) {
      setProjects(prevProjects)
      addToast(
        'error',
        e?.response?.data?.message || e?.message || 'Failed to delete project'
      )
    }
  }

  return (
    <>
      <div className="wish_main_flex relative">
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`rounded-md px-4 py-3 shadow-lg text-sm flex items-start gap-3 max-w-sm ${
                t.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : t.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-gray-50 text-gray-800 border border-gray-200'
              }`}
            >
              <span>
                {t.type === 'success' ? '✓' : t.type === 'error' ? '⚠️' : 'ℹ️'}
              </span>
              <div className="flex-1">{t.message}</div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => dismissToast(t.id)}
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="wish_inner_20">
          <MyaccountMenu activeTab="projects" />
        </div>

        <div className="w-full md:w-3/4">
          <div className="index-headingDiv !mt-0 mb-5">
            <span className="index-heading">Room Lists</span>
          </div>
          {loading ? (
            <>
              <ProjectListSkeleton />
              <Loader />
              {/* <p className="text-center py-10 text-gray-500">
                <ProjectListSkeleton />
              </p> */}
            </>
          ) : projects.length === 0 ? (
            <EmptyComponent
              title={'No room lists found!'}
              description={'Add a new room to begin building your collection.'}
              alt={'empty_Add'}
              src={'/images/empty_cart.png'}
            />
          ) : (
            <div className="space-y-4">
              {projects.map((project) => {
                const pid = getProjectId(project)
                const pname = getProjectName(project)
                const total = getProjectTotal(project)
                const isOpen = openProjectId === pid // Check if this project is the open one

                return (
                  <>
                    <div
                      key={pid}
                      className="rounded-xl bg-white p-0 shadow-sm transition-all duration-300"
                    >
                      <div className="border border-[#cdc9c9] rounded-md">
                        <div
                          className={`w-full flex items-center justify-between px-2 sm:px-4 hover:bg-[#e3e3e359] ${
                            isOpen && 'bg-[#e3e3e359]'
                          } transition-all duration-300 ease-in-out`}
                        >
                          {/* --- MODIFICATION: Button now toggles accordion --- */}
                          <button
                            onClick={() => handleToggleProject(pid)}
                            className="flex-1 text-left rounded-xl px-2 py-2 flex items-center justify-between"
                          >
                            <div>
                              <h2 className="text-medium font-semibold text-gray-800">
                                {pname}
                              </h2>
                              <p className="mt-1 text-gray-500 text-sm">
                                {total} {total === 1 ? 'Product' : 'Products'}
                              </p>
                            </div>
                            {/* --- MODIFICATION: Added Chevron Icon --- */}
                            {total > 0 && (
                              <span
                                className={`transform transition-transform text-gray-500 ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  className="w-5 h-5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                  />
                                </svg>
                              </span>
                            )}
                          </button>

                          {/* --- MODIFICATION: Added pl-4 for spacing --- */}
                          {total === 0 && (
                            <div className="flex items-center gap-2 pl-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  Swal.fire({
                                    title: 'Delete Project',
                                    html: `Are you sure you want to remove <b>${pname}</b>?`,
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor:
                                      _SwalDelete?.confirmButtonColor,
                                    cancelButtonColor:
                                      _SwalDelete?.cancelButtonColor,
                                    confirmButtonText: 'Yes, Remove It',
                                    cancelButtonText: 'Cancel'
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                      handleDeleteProject(pid)
                                    }
                                  })
                                }}
                                className="text-red-600 hover:text-red-700 px-2 py-1"
                                title="Delete project"
                                aria-label="Delete project"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>

                        {/* --- MODIFICATION: Conditionally render products inline --- */}
                        {total > 0 && isOpen && (
                          <div className="p-4 md:p-6 border-t border-[#cdc9c9]">
                            <GroupProducts
                              wishlistProjectId={pid}
                              products={products}
                              setProducts={setProducts}
                              projectName={pname}
                              deleteProject={() => {
                                Swal.fire({
                                  title: 'Delete Project',
                                  html: `Are you sure you want to remove <b>${pname}</b>?`,
                                  icon: 'warning',
                                  showCancelButton: true,
                                  confirmButtonColor:
                                    _SwalDelete?.confirmButtonColor,
                                  cancelButtonColor:
                                    _SwalDelete?.cancelButtonColor,
                                  confirmButtonText: 'Yes, Remove It',
                                  cancelButtonText: 'Cancel'
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    handleDeleteProject(pid)
                                  }
                                })
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )
              })}
            </div>
          )}
        </div>

        {/* --- MODIFICATION: Removed Modal --- */}
      </div>
    </>
  )
}

export default Projects
