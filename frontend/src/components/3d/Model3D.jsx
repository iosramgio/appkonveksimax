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
  
  useEffect(() => {
    // Check if device is mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  return (
    <div className="h-full w-full">
      <Canvas 
        camera={{ position: [0, 1, 10], fov: 35 }}
        shadows
        dpr={[1, 2]} // Optimize for mobile by limiting pixel ratio
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
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={0.2}
            target={[0, 0.5, 0]}
            // Reduce touch sensitivity on mobile
            rotateSpeed={isMobile ? 0.5 : 1}
            touches={{
              one: isMobile ? 1.2 : 1.5,
              two: isMobile ? 0.5 : 0.5,
            }}
            // Add smooth damping effect
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
} 