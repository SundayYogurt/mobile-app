import React from 'react'

export const Posture = () => {
  return (
    <>
         <div className="w-full flex flex-col items-center justify-center mt-10 relative z-10 gap-6 px-6 max-w-[440px] mx-auto">
       {/* ปุ่ม: ท่านวดเต้านมด้วยตนเอง */}
          <div className=" relative w-full flex justify-center items-center">
            <img
              className="absolute right-[-20px] w-[70px] h-[70px] rotate-[15deg]"
              src="/assets/knowledge/hearth.png"
              alt="heart"
            />
            <button className="btn rounded-xl bg-[#CB6CE670] w-full h-[70px] text-[26px] font-medium">
              ท่านวดเต้านมด้วยตนเอง
            </button>

           
              
          </div>
            <button className='btn rounded-xl text-xl font-light bg-[#FF66C457]'>ท่านวดเต้านมด้วยตนเอง</button>

            <img src='/assets/milk/milk.jpg'></img>
            <img src='/assets/milk/milk2.jpg'></img>
          </div>
 
        </>
  )
}
