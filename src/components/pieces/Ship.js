
import React from 'react';


const Ship = (props) => {
  return (
    <span 
    className='Ship' 
    style={{
      color: props.colors,
      fontSize: props.fontsize
    }}> 
    🛥
    </span>
  )
}

export default Ship;