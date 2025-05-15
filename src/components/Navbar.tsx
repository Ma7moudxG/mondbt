import Image from 'next/image'
import React from 'react'

const Navbar = () => {
    return (
      <div className='flex items-center justify-between p-4'>
        {/* SEARCH BAR */}
        {/* <div className='hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2'>
          <Image src="/search.png" alt="" width={14} height={14}/>
          <input type="text" placeholder="Search..." className="w-[200px] p-2 bg-transparent outline-none"/>
        </div> */}
        {/* ICONS AND USER */}
        <div className='flex items-center gap-6 justify-end w-full'>
          <div className='items-center justify-center'>
            <p className='text-xs text-[#9B9B9B] font-bold'> Hello! MINISTER</p>
          </div>

          <button className='rounded-full bg-white px-4 py-2 hover:bg-[#8447AB] hover:text-white font-bold hover:font-black text-xs'>
            Log out
          </button>
        </div>
      </div>
    )
  }

export default Navbar