import React, { useState, useEffect } from 'react'
import { ListGroup } from 'react-bootstrap'

const CustomScrollSpy = ({ targetIds, navigationTitleDisable }) => {
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      for (let i = targetIds.length - 1; i >= 0; i--) {
        const targetId = targetIds[i]
        const target = document.getElementById(targetId)
        if (target) {
          const targetOffset =
            target.getBoundingClientRect().top + window.scrollY
          if (targetOffset <= scrollPosition + 200) {
            setActiveId(targetId)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [targetIds])

  useEffect(() => {
    if (activeId === null && targetIds.length > 0) {
      setActiveId(targetIds[0])
    }
  }, [activeId, targetIds])

  return (
    <ListGroup
      as="ul"
      className="navigation position-sticky text-black"
      style={{ top: '6.5rem' }}
    >
      {!navigationTitleDisable && (
        <ListGroup.Item as="li" disabled>
          <span
            className="pv-seller-detail-head"
            style={{ marginBottom: '0px' }}
          >
            Quick navigation
          </span>
        </ListGroup.Item>
      )}
      {targetIds?.map((id) => (
        <ListGroup.Item
          as="li"
          key={id}
          className={id === activeId ? 'active' : ' '}
        >
          <a
            href={`#${id}`}
            className={id === activeId ? 'text-white' : 'text-black'}
          >
            {id}
          </a>
        </ListGroup.Item>
      ))}
    </ListGroup>
  )
}

export default CustomScrollSpy
