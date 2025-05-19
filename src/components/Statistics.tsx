import React from 'react'
import AttendanceChart from './AttendanceChart'
import Image from 'next/image'

const Statistics = () => {
  return (
    <div className='flex flex-col justify-center gap-6'>
        <div className='flex flex-col lg:flex-row justify-start gap-6 items-center'>
            <div className=' flex justify-start w-1/2'>
                <div className='flex flex-col justify-start items-start gap-4'>
                    <div className='flex gap-2 items-center'>
                        <Image src="list-icon.svg" alt="list icon" width={32} height={32}/>
                        <p>Attendance</p>
                    </div>
                    <div className='flex gap-2 items-center'>
                        <Image src="list-icon.svg" alt="list icon" width={32} height={32}/>
                        <p>Absence</p>
                    </div>
                    <div className='flex gap-2 items-center'>
                        <Image src="list-icon.svg" alt="list icon" width={32} height={32}/>
                        <p>Late</p>
                    </div>   
                </div> 
            </div>
            <div className='w-1/2'>
                <AttendanceChart />
            </div>
        </div>
        
    </div>
  )
}

export default Statistics