import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import vertexShader from "../Shaders/vertexShader.glsl?raw";
import fragmentShader from "../Shaders/fragmentShader.glsl?raw";

function ImageComponent({ src, alt, className }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const composerRef = useRef(null);
  const textureRef = useRef(null);
  const meshRef = useRef(null);
  const timeRef = useRef(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  // Handle mouse movement
  const handleMouseMove = (event) => {
    if (meshRef.current) {
      const mouse = new THREE.Vector2(
        event.clientX / window.innerWidth,
        1.0 - event.clientY / window.innerHeight // Flip Y coordinate
      );

      // Use GSAP to smoothly animate the mouse movement
      gsap.to(meshRef.current.material.uniforms.uMouse.value, {
        duration: 0.8,
        x: mouse.x,
        y: mouse.y,
        ease: "power2.out",
      });
    }
  };

  useEffect(() => {
    // Setup scene
    sceneRef.current = new THREE.Scene();

    const CamDistance = 600;
    const fov =
      2 * Math.atan(window.innerHeight / 2 / CamDistance) * (180 / Math.PI);

    // Setup camera
    cameraRef.current = new THREE.PerspectiveCamera(
      fov,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current.position.z = CamDistance;

    // Setup renderer with correct color management
    rendererRef.current = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
      antialias: true,
    });
    rendererRef.current.outputEncoding = THREE.sRGBEncoding;
    rendererRef.current.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current.toneMappingExposure = 1;
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(rendererRef.current.domElement);

    // Setup post-processing
    composerRef.current = new EffectComposer(rendererRef.current);
    const renderPass = new RenderPass(sceneRef.current, cameraRef.current);
    composerRef.current.addPass(renderPass);

    // Load texture
    const textureLoader = new THREE.TextureLoader();
    textureRef.current = textureLoader.load(src, (texture) => {
      // Calculate aspect ratios
      const imageAspect = texture.image.width / texture.image.height;
      const screenAspect = window.innerWidth / window.innerHeight;

      // Calculate dimensions to cover screen while maintaining aspect ratio
      let width, height;
      if (screenAspect > imageAspect) {
        width = window.innerWidth;
        height = window.innerWidth / imageAspect;
      } else {
        height = window.innerHeight;
        width = window.innerHeight * imageAspect;
      }

      // Create mesh with shader material
      const geometry = new THREE.PlaneGeometry(width, height);
      const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        uniforms: {
          uTexture: { value: texture },
          uTime: { value: 0.0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uProgress: { value: 0.0 },
          uIntensity: { value: 0.0 },
        },
      });

      meshRef.current = new THREE.Mesh(geometry, material);
      sceneRef.current.add(meshRef.current);

      // Animate in the effect
      gsap.to(material.uniforms.uProgress, {
        duration: 1.5,
        value: 1.0,
        ease: "power2.inOut",
      });

      // Create hover animation for intensity
      gsap.to(material.uniforms.uIntensity, {
        duration: 1,
        value: 1.0,
        ease: "power2.out",
      });
    });

    // Animation loop
    const animate = () => {
      if (meshRef.current) {
        meshRef.current.material.uniforms.uTime.value += 0.01;
        composerRef.current.render();
      }
      requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (textureRef.current && meshRef.current) {
        const imageAspect =
          textureRef.current.image.width / textureRef.current.image.height;
        const screenAspect = width / height;

        let newWidth, newHeight;
        if (screenAspect > imageAspect) {
          newWidth = width;
          newHeight = width / imageAspect;
        } else {
          newHeight = height;
          newWidth = height * imageAspect;
        }

        meshRef.current.geometry.dispose();
        meshRef.current.geometry = new THREE.PlaneGeometry(newWidth, newHeight);
      }

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
      composerRef.current.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      containerRef.current?.removeChild(rendererRef.current.domElement);
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        meshRef.current.material.dispose();
      }
      if (textureRef.current) {
        textureRef.current.dispose();
      }
      composerRef.current.dispose();
    };
  }, [src]);

  return (
    <div
      onMouseMove={handleMouseMove}
      ref={containerRef}
      className={className}
    />
  );
}

export default ImageComponent;
