import React, { useRef, useEffect } from "react";

const Banner = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        const loopVideo = () => {
            if (video.currentTime >= video.duration) {
                video.currentTime = 0; // Restart seamlessly
                video.play();
            }
            requestAnimationFrame(loopVideo);
        };

        video.addEventListener("play", () => {
            requestAnimationFrame(loopVideo);
        });

        return () => {
            video.removeEventListener("play", loopVideo);
        };
    }, []);

    return (
        <section className="relative h-[500px] overflow-hidden">
            {/* Video Background */}
            <video
                ref={videoRef}
                src="https://videos.pexels.com/video-files/6394054/6394054-uhd_2732_1366_24fps.mp4"
                autoPlay
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
                preload="auto"
                loop={false} // Let custom logic handle looping
                poster="https://images.pexels.com/videos/6394054/adventure-beauty-forrest-hike-6394054.jpeg?auto=compress&amp;cs=tinysrgb&amp;fit=crop&amp;h=630&amp;w=1200"
            ></video>

            {/* Banner Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white bg-black/50">
                <h1 className="text-4xl font-bold mb-4">Welcome to Risers Consultancy</h1>
                <p className="text-lg mb-6">
                    Your trusted partner for success in every step of your journey.
                </p>
                <button className="bg-white text-[#274E6B] border-2 border-white px-6 py-3 rounded-md font-bold transition-all duration-700 ease-in-out hover:bg-transparent hover:text-white hover:border-white hover:border-2">
                    Learn More
                </button>
            </div>
        </section>
    );
};

export default Banner;
