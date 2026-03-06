import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'

const FileOverlay = ({ fileUrls = [], onClose, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const currentFile = fileUrls[currentIndex]

  if (!currentFile) return null

  const isPDF = currentFile.toLowerCase().endsWith('.pdf')
  const isMultiple = fileUrls.length > 1

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? fileUrls.length - 1 : prev - 1))
  }, [fileUrls.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === fileUrls.length - 1 ? 0 : prev + 1))
  }, [fileUrls.length])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'Escape') onClose()
    },
    [handlePrev, handleNext, onClose]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '30px',
          fontSize: '40px',
          background: 'none',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          zIndex: 1001
        }}
        aria-label="Close"
      >
        &times;
      </button>

      {/* Previous Button */}
      {isMultiple && !isPDF && (
        <button
          onClick={handlePrev}
          style={arrowButtonStyle('left')}
          aria-label="Previous"
        >
          &#10094;
        </button>
      )}

      {/* File Content */}
      {isPDF ? (
        <iframe
          src={currentFile}
          style={{
            width: '90%',
            height: '90%',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: '#fff'
          }}
          title="PDF Preview"
        />
      ) : (
        <Image
          src={currentFile}
          alt="Preview"
          style={{
            maxWidth: '90%',
            maxHeight: '90%',
            borderRadius: '8px',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
          }}
          width={300}
          height={300}
          sizes="100vw"
          quality={100}
        />
      )}

      {/* Next Button */}
      {isMultiple && !isPDF && (
        <button
          onClick={handleNext}
          style={arrowButtonStyle('right')}
          aria-label="Next"
        >
          &#10095;
        </button>
      )}
    </div>
  )
}

// Arrow button shared style
const arrowButtonStyle = (position) => ({
  position: 'absolute',
  top: '50%',
  [position]: '30px',
  fontSize: '40px',
  background: 'none',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
  zIndex: 1001,
  transform: 'translateY(-50%)'
})

export default FileOverlay
