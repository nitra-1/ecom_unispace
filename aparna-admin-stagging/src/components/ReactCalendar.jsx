import React, { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css';

const ReactCalendar = ({ label, value }) => {
  //   const [currentDate, setCurrentDate] = useState(new Date())

  //   const datefun =(value)=> {
  //     setCurrentDate(value)
  //   }

  //   return (
  //     <div>
  //       <Calendar onChange={datefun} value={currentDate}/>
  //       <br></br>
  //       <h4>{currentDate && currentDate.toString() }</h4>
  //     </div>
  //   )

  const [selectedDate, setSelectedDate] = useState('');

  const handleDateChange = (event) => {
    const inputDate = event.target.value;
    const today = new Date().toISOString().split('T')[0];

    if (inputDate >= today) {
      setSelectedDate('inputDate', inputDate);
    }
  };

  return (
    <div >
      <label htmlFor="">{label}</label>
      <input className='form-control' type="date" value={selectedDate} onChange={handleDateChange} />
    </div>
  );

}

export default ReactCalendar
