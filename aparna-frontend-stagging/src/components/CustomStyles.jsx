export const customStyles = {
  menuPortal: (provided) => ({
    ...provided,
    // zIndex: CheckClassName(),
    scrollbarWidth: '0px'
  }),
  // menu: (provided) => ({ ...provided, zIndex: 9999, maxHeight:'150px', overflowY: 'auto' })
  // menu: (provided) => ({
  //   ...provided,
  //   zIndex: 10000,
  //   position: 'relative',
  // }),
  // option: (provided, state) => ({
  //   ...provided,
  //   backgroundColor: state.isSelected ? '#eee' : 'white',
  //   color: state.isSelected ? 'white' : 'black',
  //   scrollbarWidth:"opx"
  // }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: '150px',
    overflowY: 'auto',
    overflowY: 'scroll',
    scrollbarWidth: 'none',
    '-ms-overflow-style': 'none',
    '&::-webkit-scrollbar': {
      width: '0.5em'
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'lightgray',
      borderRadius: '4px'
    }
  })
}
