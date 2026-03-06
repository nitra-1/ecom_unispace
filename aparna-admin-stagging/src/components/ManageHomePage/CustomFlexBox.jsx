import { ClassicEditor } from '@ckeditor/ckeditor5-build-classic'
import { CKEditor, InlineEditor } from '@ckeditor/ckeditor5-react'
import React, { useEffect, useState } from 'react'
import { Button, Container, Row, Col, Modal } from 'react-bootstrap'
import ReactPlayer from 'react-player'

const LayoutComponent = () => {
  const [selectedLayout, setSelectedLayout] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [content, setContent] = useState([])
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [fileInput, setFileInput] = useState(null)
  const [image, setImage] = useState(null)
  const [imageUploadShow, setImageUploadShow] = useState(true)
  const [layoutshowModal, setlayoutShowModal] = useState(false)

  const [editorData, setEditorData] = useState('')

  const handleEditorChange = (event, editor) => {
    const data = editor.getData()
    setEditorData(data)
  }

  const layouts = {
    1: [12],
    2: [6, 6],
    3: [4, 4, 4],
    4: [3, 3, 3, 3],
    '7c-5c': [7, 5],
    '5c-7c': [5, 7],
    '8c-4c': [8, 4],
    '4c-8c': [4, 8]
  }

  const renderFlexLayout = () => {
    if (selectedLayout && layouts[selectedLayout]) {
      const columns = layouts[selectedLayout]

      return (
        <Container fluid>
          <Row className='flex-layout'>
            {columns.map((col, index) => (
              <Col
                key={index}
                xs={col}
                onClick={() => handleColumnClick(index)}
                className={selectedColumn === index ? 'selected-column' : ''}
              >
                {content[index] ? (
                  <>
                    <button onClick={() => handleEdit(index)}>Edit</button>
                    <button onClick={() => handleDelete(index)}>Delete</button>
                    {content[index]}
                  </>
                ) : (
                  `Column ${index + 1}`
                )}
              </Col>
            ))}
          </Row>
        </Container>
      )
    }

    return null
  }

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const handleLayoutSelect = (layout) => {
    setSelectedLayout(layout)
    setSelectedColumn(null) // Reset selected column when layout changes
  }

  const handleColumnClick = (index) => {
    setSelectedColumn(index)
    setEditContent(content[index] || '')
  }

  const handleContentSelect = (contentType) => {
    const newContent = [...content]
    newContent[selectedColumn] = getContentElement(contentType)
    setContent(newContent)
    closeModal()
  }

  useEffect(() => {
    setContent([])
    handleContentSelect('Image')
  }, [image])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      let url = URL.createObjectURL(file)
      setImage(url)
      handleContentSelect('Image')
      setImageUploadShow(false)
    }
    // if (file) {
    //   const reader = new FileReader();
    //   reader.onload = (event) => {
    //     const imageUrl = event.target.result;
    //     setImage(URL.createObjectURL(imageUrl)); // Set the image URL in state
    //   };
    //   reader.readAsDataURL(file);
    // }
  }

  const getContentElement = (contentType) => {
    switch (contentType) {
      case 'Image':
        return (
          <>
            {/* {imageUploadShow && ( */}
            <input type='file' accept='image/*' onChange={handleImageUpload} />
            {/* )} */}
            {image && <img src={image} alt='Uploaded' />}
          </>
        )
      case 'Video':
        return (
          <>
            <input
              type='text'
              placeholder='Enter video URL'
              onChange={(e) => setFileInput(e.target.value)}
            />
            {fileInput && <ReactPlayer url={fileInput} />};{' '}
          </>
        )
      case 'Paragraph':
        return (
          <CKEditor
            editor={ClassicEditor}
            data={editContent}
            onChange={(event, editor) => setEditContent(editor.getData())}
          />
        )
      case 'Heading':
        return <h2>Heading Text</h2>
      case 'Testimonial':
        return <div>Testimonial content goes here.</div>
      default:
        return null
    }
  }

  const handleEdit = (index) => {
    setImageUploadShow(true)
    setSelectedColumn(index)
    openModal()
  }

  const handleEditSave = () => {
    if (selectedColumn !== null) {
      const newContent = [...content]
      newContent[selectedColumn] = editContent
      setContent(newContent)
      setImageUploadShow(false)
      closeModal()
    }
  }

  const handleDelete = (index) => {
    const newContent = [...content]
    newContent[index] = null
    setContent(newContent)
    setSelectedColumn(null)
    setImage(null)
    setImageUploadShow(true)
  }

  return (
    <div>
      <Button variant='primary' onClick={() => setlayoutShowModal(true)}>
        Open Layout Modal
      </Button>
      <Modal show={layoutshowModal} onHide={() => setlayoutShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select a Layout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='card-selector'>
            {Object.keys(layouts).map((layout) => (
              <div
                key={layout}
                className={`card ${
                  selectedLayout === layout ? 'selected' : ''
                }`}
                onClick={() => handleLayoutSelect(layout)}
              >
                {layout}
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setlayoutShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      {selectedLayout && renderFlexLayout()}
      {selectedLayout && (
        <div>
          <Button
            variant='success'
            onClick={() => handleContentSelect('Image')}
          >
            Add Image
          </Button>
          <Button
            variant='success'
            onClick={() => handleContentSelect('Video')}
          >
            Add Video
          </Button>
          <Button
            variant='success'
            onClick={() => handleContentSelect('Paragraph')}
          >
            Add Paragraph
          </Button>
          <Button
            variant='success'
            onClick={() => handleContentSelect('Heading')}
          >
            Add Heading
          </Button>
          <Button
            variant='success'
            onClick={() => handleContentSelect('Testimonial')}
          >
            Add Testimonial
          </Button>
        </div>
      )}
      <Modal show={showModal && selectedColumn !== null} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Content</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='card-selector'>
            {selectedColumn !== null ? (
              // Check the content type of the selected column to show the appropriate edit input
              content[selectedColumn] &&
              typeof content[selectedColumn] === 'string' ? (
                // Text content (Paragraph or Heading)
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              ) : (
                // Image or Video content
                <div>
                  {content[selectedColumn]}
                  <button
                    onClick={() => {
                      handleEditSave()
                      handleContentSelect('Video')
                      handleContentSelect('image')
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              )
            ) : null}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default LayoutComponent
