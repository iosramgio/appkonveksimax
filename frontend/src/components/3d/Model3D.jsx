import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls, Environment, ContactShadows, useGLTF, Center, BakeShadows } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';

// This component will handle the actual 3D model
function Model({ scale = 1.5, position = [0, 0.2, 0], rotation = [0, 0, 0], isMobile }) {
  // Gunakan path relatif terhadap folder public
  const modelPath = '/assets/3d/Maxsupply6.glb';
  const gltf = useLoader(GLTFLoader, modelPath);
  const modelRef = useRef();
  const mixer = useRef(null);
  const clock = useRef(new THREE.Clock());
  
  // Initialize animation mixer when model loads
  useEffect(() => {
    if (gltf.animations.length) {
      mixer.current = new THREE.AnimationMixer(gltf.scene);
      // Play all animations
      gltf.animations.forEach(clip => {
        const action = mixer.current.clipAction(clip);
        action.play();
      });
    }
  }, [gltf]);
  
  // Use smaller scale on mobile
  const responsiveScale = isMobile ? scale * 0.7 : scale;
  
  // Smooth animation with easing
  useFrame(() => {
    // Update animation mixer if exists
    if (mixer.current) {
      mixer.current.update(clock.current.getDelta() * 0.5); // Slow down the animation
    }
    
    if (modelRef.current) {
      // Very slow, smooth rotation
      const time = clock.current.getElapsedTime();
      
      // Smooth rotation with subtle easing
      modelRef.current.rotation.y = THREE.MathUtils.lerp(
        modelRef.current.rotation.y,
        Math.sin(time * 0.2) * 0.1, // Subtle rotation range
        0.02 // Smooth transition factor
      );
      
      // Gentle floating effect with smooth easing
      modelRef.current.position.y = position[1] + Math.sin(time * 0.3) * 0.03;
    }
  });
  
  return (
    <Center position={[0, 0, 0]}>
      <primitive 
        ref={modelRef}
        object={gltf.scene} 
        scale={responsiveScale} 
        position={position} 
        rotation={rotation}
      />
    </Center>
  );
}

// Main component with canvas setup
export default function Model3D() {
  const [isMobile, setIsMobile] = useState(false);
  const controlsRef = useRef();
  const [showInstructions, setShowInstructions] = useState(true);
  
  useEffect(() => {
    // Check if device is mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Hide instructions after 5 seconds
    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 5000);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
      clearTimeout(timer);
    };
  }, []);

  // Add touch event handlers to prevent default behavior on canvas
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const preventDefaultTouch = (e) => {
        if (e.touches && e.touches.length > 1) {
          e.preventDefault();
        }
      };
      
      canvas.addEventListener('touchstart', preventDefaultTouch, { passive: false });
      canvas.addEventListener('touchmove', preventDefaultTouch, { passive: false });
      
      // Hide instructions on first interaction
      const hideInstructions = () => {
        setShowInstructions(false);
      };
      
      canvas.addEventListener('touchstart', hideInstructions, { once: true });
      
      return () => {
        canvas.removeEventListener('touchstart', preventDefaultTouch);
        canvas.removeEventListener('touchmove', preventDefaultTouch);
        canvas.removeEventListener('touchstart', hideInstructions);
      };
    }
  }, []);
  
  return (
    <div className="h-full w-full touch-manipulation relative">
      {isMobile && showInstructions && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-black/60 text-white px-4 py-2 rounded-lg text-center max-w-[200px] backdrop-blur-sm">
            <div className="flex justify-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
            </div>
            <p className="text-sm">Geser dengan satu jari untuk memutar model</p>
            <p className="text-xs mt-1">Gunakan dua jari untuk zoom</p>
          </div>
        </div>
      )}
      
      <Canvas 
        camera={{ position: [0, 1, 10], fov: 35 }}
        shadows
        dpr={[1, 2]} // Optimize for mobile by limiting pixel ratio
        style={{ touchAction: 'none' }} // Prevent browser's default touch actions
      >
        <Suspense fallback={null}>
          {/* Lighting for better visualization */}
          <ambientLight intensity={0.7} />
          <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={0.8} castShadow />
          <spotLight position={[-10, 15, -10]} angle={0.3} penumbra={1} intensity={0.4} castShadow />
          <pointLight position={[0, 10, 0]} intensity={0.5} />
          
          <Model isMobile={isMobile} />
          
          <Environment preset="studio" />
          <BakeShadows />
          
          <OrbitControls 
            ref={controlsRef}
            enablePan={false}
            enableZoom={true}
            zoomSpeed={isMobile ? 0.5 : 1}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            autoRotate={!isMobile} // Disable autoRotate on mobile to allow manual control
            autoRotateSpeed={0.2}
            target={[0, 0.5, 0]}
            // Improved touch sensitivity for mobile
            rotateSpeed={isMobile ? 1 : 0.8}
            touches={{
              one: 1, // Single finger rotation
              two: 2, // Two finger zoom
              three: 3 // Three finger pan (although pan is disabled)
            }}
            // Enhanced smooth damping effect
            enableDamping={true}
            dampingFactor={0.1}
          />
        </Suspense>
      </Canvas>
    </div>
  );
} 