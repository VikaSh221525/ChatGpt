import React from 'react'

const HeroPage = () => {
    return (
        <>
            <div className='w-full h-screen relative'>
                <video className='w-full h-screen object-cover' autoPlay muted loop playsinline src="https://ik.imagekit.io/eh27q6bly/Earth%20hour%20(1).mp4?tr=orig&updatedAt=1755884962369" />
                <h1 className='absolute-center text-8xl font-agrandir font-bold text-[#bad9ff]  leading-none text-center whitespace-nowrap'>WELCOME TO ANOLA AI</h1>
                <p className='absolute top-75 left-1/2 transform -translate-x-1/2 text-white text-lg font-medium text-center w-[60%] px-4'>
                    Unleash the power of artificial intelligence with Anola AI. Where innovation meets intelligence, 
                    transforming your ideas into reality through cutting-edge technology and limitless possibilities.
                </p>

            </div>
        </>
    )
}

export default HeroPage