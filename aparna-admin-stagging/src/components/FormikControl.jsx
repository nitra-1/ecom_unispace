import React from 'react'
import Input from '../components/validation/Input.jsx'
import HKSelect from './HKSelect.jsx'
import DatePickers from './validation/DatePickers.jsx'
import FormikCheckBox from './validation/FormikCheckBox.jsx'
import IpFile from './validation/IpFile.jsx'

function FormikControl(props) {
  const { control, ...rest } = props
  switch (control) {
    case 'input':
      return <Input {...rest} />
    case 'select':
      return <HKSelect {...rest} />
    case 'filetype':
      return <IpFile {...rest} />
    case 'checkbox':
      return <FormikCheckBox {...rest} />
    //     case "textarea":
    //         return <TextArea {...rest}/>
    //     case "radio":
    //         return <RadioButton {...rest}/>
    case 'time':
      return <DatePickers {...rest} />
    //  case "dateandtime":
    //         return <DateAndTime {...rest} />
    //     case "arryfield":
    //         return <FieldArrayss {...rest} />
    //         case "memberarryfield":
    //             return <MemberFieldArray {...rest} />
    default:
      return null
  }
}

export default FormikControl
