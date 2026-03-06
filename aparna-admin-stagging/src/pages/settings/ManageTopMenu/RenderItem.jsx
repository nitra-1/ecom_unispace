import { useState } from 'react'

export function RenderItem({ item, collapseIcon, handlerStyles }) {
  const [selectedItem, setSelectedItem] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleDragStart(e) {
    e.stopPropagation()
    setIsDragging(true)
    setSelectedItem(item)
  }

  function handleDragEnd() {
    setIsDragging(false)
    setSelectedItem(null)
  }

  function handleClick() {
  }

  const itemStyle = {
    backgroundColor: item === selectedItem ? 'yellow' : 'white',
    opacity: isDragging && item === selectedItem ? 0.5 : 1,
    position: isDragging && item === selectedItem ? 'absolute' : 'static'
  }

  return (
    <div
      className='nestable-item'
      style={itemStyle}
      onClick={handleClick}
      draggable={!isDragging}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {item.children && (
        <div className='nestable-collapse' style={handlerStyles}>
          {collapseIcon}
        </div>
      )}
      <div>{item.text}</div>
      {item.children && (
        <div className='nestable-icon'>
          <i className='fas fa-cog'></i>
        </div>
      )}
    </div>
  )
}