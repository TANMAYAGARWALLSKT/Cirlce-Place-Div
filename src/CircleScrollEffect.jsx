import React from 'react'
import { useState, useRef, useEffect } from "react";
import "./App.css";
import { useLenis } from "lenis/react";
import ReactLenis from "lenis/react";
import gsap from "gsap";

function CircleScrollEffect() {
    const points = [];
    const container = useRef(null);
    const sliderRef = useRef(null);
    const [containerDim, setContainerDim] = useState({ w: 0, h: 0 });
    const Parts = 10;
    const [positions, setPositions] = useState([]);
    const velocityList = [];
    const [DisplayImg, SetDisplayImg] = useState()

    useEffect(() => {
        if (container.current) {
            const updateDimensions = () => {
                const { width, height } = container.current.getBoundingClientRect();
                setContainerDim({ w: width, h: height });
            };

            updateDimensions(); // Initialize dimensions on mount
            window.addEventListener("resize", updateDimensions); // Update on window resize

            return () => {
                window.removeEventListener("resize", updateDimensions);
            };
        }
    }, []);

    const calculatePoints = () => {
        for (let i = 0; i < Parts; i++) {
            const angle = (2 * Math.PI * i) / Parts;
            const x = (containerDim.w / 2) * Math.cos(angle);
            const y = (containerDim.h / 2) * Math.sin(angle);
            points.push({ x, y });
        }
        return points;
    };

    const initialPoints = calculatePoints();

    useEffect(() => {
        setPositions(initialPoints);
    }, [containerDim.w, containerDim.h]);

    useLenis(({ velocity, direction }) => {
        velocityList.push(velocity);

        // Animate rotation based on scroll velocity
        if (sliderRef.current) {
            gsap.to(sliderRef.current, {
                rotateX: velocity * direction * 2,
                rotateY: velocity * direction * 2,
                duration: 0.5,
                ease: "power2.out"
            });
        }

        if (velocity > 15) {
            console.log(velocity);
            ChangeImg();
        }
    });

    //Change Img Src
    const ChangeImg = () => {
        if (sliderRef.current) {
            gsap.to(sliderRef.current, {
                scale: 1.1,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut"
            });
        }
    };

    return (
        <ReactLenis root>
            <div className="bg-black w-screen h-full min-h-screen relative z-10">
                <div className="w-screen h-screen bg-amber-300/10 flex justify-center items-center sticky top-0 left-0 z-80">
                    <div
                        id="banner"
                        ref={container}
                        className="backdrop-blur-lg bg-white/10 mx-auto my-auto text-center w-[80vh] h-[80vh] rounded-full"
                    >
                        <div
                            id="slider"
                            ref={sliderRef}
                            className="bg-amber-500/10 w-full h-full rota"
                        >
                            {positions.map((point, index) => (
                                <div
                                    id="item"
                                    key={index}
                                    className="absolute w-32 h-auto "
                                    style={{
                                        left: `${point.x + containerDim.w / 2 - 80}px`,
                                        top: `${point.y + containerDim.h / 2 - 80}px`,
                                    }}
                                >
                                    <img
                                        src={`/Img/${index + 1}.jpg`}
                                        alt="part"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}</div>
                    </div>
                </div>
                <div className="relative w-screen h-screen z-50 bg-amber-50"></div>
            </div>
        </ReactLenis>
    );
}



export default CircleScrollEffect