import React from 'react'
import VideoPlayer from '../components/VideoPlayer'

export const FourPoint = () => {
  return (
    <div className='flex flex-col items-center justify-center mt-10'>
      <h1 className='text-2xl'>4 จุด หยุดปัญหาเต้า</h1>
      <p>แตะตรงกลางเพื่อเล่น</p>
      <VideoPlayer src="/src/assets/fourstep/new.mp4" />
    </div>
  )
}
