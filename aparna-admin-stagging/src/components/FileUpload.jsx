import React, { useState } from 'react'

const FileUpload = () => {
  const [file, setFile] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    //if await is removed, console log will be called before the uploadFile() is executed completely.
    //since the await is added, this will pause here then console log will be called

    let res = await uploadFile(file)
  }
  // const UPLOAD_ENDPOINT =
  //   "http://localhost/react-php-file-upload/backend/upload.php";

  const uploadFile = async (file) => {
    let formData = new FormData()

    formData.append('avatar', file)
  }

  const handleOnChange = (e) => {
    setFile(e.target.files[0])
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type='file' onChange={handleOnChange} />
        <button type='submit'>Upload File</button>
      </form>
    </div>
  )
}

export default FileUpload
