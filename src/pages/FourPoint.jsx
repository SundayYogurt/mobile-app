import React from 'react'
import VideoPlayer from '../components/VideoPlayer'

export const FourPoint = () => {
  return (
    <div className='flex flex-col items-center justify-center mt-10'>
      <h1 className='text-2xl'>4 จุด หยุดปัญหาเต้า</h1>
      <VideoPlayer src="/src/assets/fourstep/2.mp4" />
    </div>
  )
}
