import React from 'react'

const BabySign = () => {
  return (
    <>
        <div className="w-full flex flex-col items-center justify-center mt-10 relative z-10 gap-6 px-6 max-w-[440px] mx-auto">
       {/* ปุ่ม: ท่านวดเต้านมด้วยตนเอง */}
          <div className=" relative w-full flex justify-center items-center">
            <button className="btn rounded-xl bg-[#CB6CE670] w-full h-[70px] text-[26px] font-medium">
              สัญญานหิวของทารก
            </button>

           
              
          </div>
            

            <img src='/src/assets/child.png'></img>

          </div>
 
        </>
  )
}

export default BabySign