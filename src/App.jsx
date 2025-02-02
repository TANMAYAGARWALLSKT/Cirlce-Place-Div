import { useState, useRef, useEffect } from "react";
import "./App.css";
import { useLenis } from "lenis/react";
import ReactLenis from "lenis/react";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import ImageComponent from "./ImageComponent";

function App() {
  const [DisplayImg, SetDisplayImg] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [CurrentSectionScroll, SetCurrentSectionScroll] = useState(0);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const springScroll = useSpring(0, {
    stiffness: 100,
    damping: 30,
    mass: 1,
  });

  const ImgdataRender = [
    {
      src: "./Project-2/aaron-huber-7Nsarl91394-unsplash.jpg",
      className: "z-10",
      textclassName: "z-10",
      name: "Mercedes AMG GT",
    },
    {
      src: "./Project-2/bro-takes-photos-fKNPmWPtESI-unsplash.jpg",
      className: "z-20",
      textclassName: "z-20",
      name: "Porsche 911",
    },
    {
      src: "./Project-2/blake-meyer-CRNbHjNaljo-unsplash.jpg",
      className: "z-30",
      textclassName: "z-30",
      name: "Audi R8",
    },
    {
      src: "./Project-2/devon-janse-van-rensburg-yoqHLUayUTg-unsplash.jpg",
      className: "z-40",
      textclassName: "z-40",
      name: "BMW M4",
    },
  ];

  useEffect(() => {
    let loadedImages = 0;
    
    ImgdataRender.forEach(img => {
      const image = new Image();
      image.src = img.src;
      image.onload = () => {
        loadedImages++;
        setLoadingProgress((loadedImages / ImgdataRender.length) * 100);
        if (loadedImages === ImgdataRender.length) {
          setTimeout(() => setIsLoading(false), 1000); // Add slight delay before transition
        }
      };
    });
  }, []);

  useLenis(({ progress, direction, velocity }) => {
    const sectionSize = 1 / ImgdataRender.length;
    const currentSection = Math.floor(progress / sectionSize);
    const progressInSection = (progress % sectionSize) / sectionSize;

    setScrollPercentage(Math.min(100, Math.round(progressInSection * 100)));
    springScroll.set(progress);
    SetCurrentSectionScroll(progress * 100);
    setOpacity(Math.max(0, Math.min(1, 1 - progressInSection)));

    if (currentSection >= 0 && currentSection < ImgdataRender.length) {
      SetDisplayImg(currentSection);
    }
  });

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-zinc-900 flex items-center justify-center">
        <motion.div 
          className="relative"
          initial={{ y: 0 }}
          animate={{ y: isLoading ? 0 : -100 }}
          exit={{ y: -100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="w-32 h-32 rounded-full border-4 border-white flex items-center justify-center">
            <motion.span 
              className="text-white text-2xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {Math.round(loadingProgress)}%
            </motion.span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <ReactLenis
      root
      options={{ smoothWheel: true, lerp: 0.075, wheelMultiplier: 0.5 }}
    >
      <div className="bg-zinc-900 h-full min-h-screen w-full relative">
        <motion.div
          className="fixed top-4 right-4 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full z-[9999] text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Scroll Progress: {scrollPercentage}%
        </motion.div>

        <motion.span
          className="w-[5vw] h-[5vw] rounded-full bg-zinc-500 sticky top-0 left-0 z-[9999]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="h-screen sticky top-0 left-0 z-[990] w-full">
          <div className="h-screen w-[100vw]  overflow-hidden">
            <AnimatePresence mode="wait">
              {ImgdataRender.map((item, index) =>
                index === DisplayImg ? (
                  <motion.div
                    key={index}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <ImageComponent
                      src={item.src}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <motion.div
                      className={`text-bold px-2 py-4 text-white text-6xl absolute mx-auto my-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center ${item.textclassName} uppercase tracking-wider font-black blend`}
                      initial={{ y: 50, opacity: 0, scale: 0.9 }}
                      animate={{
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        textShadow: "0 0 15px rgba(255,255,255,0.5)",
                      }}
                      exit={{ y: -50, opacity: 0, scale: 0.9 }}
                      transition={{
                        duration: 0.7,
                        delay: 0.2,
                        ease: [0.6, 0.01, -0.05, 0.95],
                        type: "spring",
                        stiffness: 120,
                        damping: 15,
                      }}
                    >
                      {item.name}
                    </motion.div>
                  </motion.div>
                ) : null
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="h-[200vh] relative w-full overflow-hidden"></div>
      </div>
    </ReactLenis>
  );
}

export default App;
