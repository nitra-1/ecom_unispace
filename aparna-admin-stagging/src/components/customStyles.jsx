function CheckClassName() {
  let isModalOpen = false
  const isModelClassPresent = document.body.classList.contains('modal-open')

  if (isModelClassPresent) {
    isModalOpen = true
  }
  const selectZIndex = isModalOpen ? 1060 : 1000
  return selectZIndex
}

export const customStyles = {
  menuPortal: (provided) => ({
    ...provided,
    zIndex: CheckClassName(),
    scrollbarWidth: '0px'
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: '150px',
    overflowY: 'auto'
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#000",
    opacity: 1,  
  }),
  control: (provided, state) => ({
    ...provided,
    backgroundColor: state.isDisabled ? '#e9ecef' : '#fff',
    cursor: state.isDisabled ? 'not-allowed' : 'default',
    //color: state.isSelected ? "#000000" : "#000000",
    borderColor: state.isFocused ? '#66d3e1' : '#ced4da',
    '&:hover': {
      borderColor: state.isFocused ? '#66d3e1' : '#ced4da'
    }
  })
}
