import React from 'react'
import Navbar from '@/components/Navbar'

const layout = ({childern}) => {
  return (
    <>
    <Navbar/>
    {childern}
    </>
  )
}

export default layout
