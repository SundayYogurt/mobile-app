import React from 'react'
import VideoPlayer from '../components/VideoPlayer'


const FourStep = () => {
  return (
    <div className='flex flex-col items-center justify-center mt-10'>
      <h1 className='text-2xl'>4 Steps ดูดเป๊ะ</h1>
      <VideoPlayer src="/src/assets/fourstep/1.mp4" />
    </div>
  )
}

export default FourStep
