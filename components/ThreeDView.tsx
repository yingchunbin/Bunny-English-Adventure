import React, { Suspense, useState, useLayoutEffect, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Stage, Html, useProgress, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// --- Global Loader Patch ---
// This overrides the default error handler for all THREE.js loaders.
// It's configured to specifically ignore the known harmless error from the Kenney assets
// regarding the missing 'colormap.png', providing a cleaner console.
THREE.DefaultLoadingManager.onError = (url) => {
  if (url.includes('Textures/colormap.png') || url.includes('colormap.png')) {
    // Silently ignore this specific error as we handle it gracefully in the component.
    return;
  }
  // For any other errors, log them to the console as usual.
  console.error(`There was an error loading ${url}`);
};

function Loader() {
  const { progress } = useProgress();
  return <Html center><span className="text-xs font-bold text-slate-400">{progress.toFixed(0)}%</span></Html>;
}

const Model = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  
  // Clone the scene to ensure we have a fresh instance for this component
  // and avoid modifying shared cache materials directly.
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // State to hold the loaded texture (if available)
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    // Attempt to load the colormap texture manually.
    const loader = new THREE.TextureLoader();
    loader.load(
        '/Textures/colormap.png', 
        (tex) => {
            // Success: Configure texture
            tex.flipY = false;
            tex.colorSpace = THREE.SRGBColorSpace;
            setTexture(tex);
        },
        undefined,
        () => {
            // Failure: Texture file missing. 
            // We ignore this here because the onError patch handles the console log,
            // and the layout effect below handles the visual fallback.
        }
    );
  }, []);

  useLayoutEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        
        // Clone materials to prevent side effects on other models
        if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map(m => m.clone());
        } else if (mesh.material) {
            mesh.material = mesh.material.clone();
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        
        materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
                // 1. Clear the broken texture reference from the GLTF file
                mat.map = null; 

                // 2. Apply strategy
                if (texture) {
                    // If texture loaded successfully, use it
                    mat.map = texture;
                    mat.vertexColors = false;
                } else {
                    // Fallback: Use built-in Vertex Colors
                    mat.vertexColors = true;
                }
                
                // Aesthetic tweaks
                mat.metalness = 0.1;
                mat.roughness = 0.8;
                mat.flatShading = false;
                mat.color.set(0xffffff); // Ensure no tint
                mat.side = THREE.DoubleSide;
                mat.needsUpdate = true;
            }
        });
      }
    });
  }, [clonedScene, texture]);

  // @ts-ignore
  return <primitive object={clonedScene} />;
};

const ErrorFallback = ({ emoji }: { emoji: string }) => (
  <div className="flex items-center justify-center w-full h-full bg-slate-100/50 rounded-2xl">
    <span className="text-5xl filter drop-shadow-sm grayscale-[0.2]">{emoji}</span>
  </div>
);

interface ThreeDViewProps {
  modelUrl: string;
  fallbackEmoji: string;
  scale?: number; 
  className?: string;
  autoRotate?: boolean;
  interactive?: boolean;
}

export const ThreeDView: React.FC<ThreeDViewProps> = ({ 
  modelUrl, 
  fallbackEmoji, 
  className = "w-full h-full", 
  autoRotate = true, 
  interactive = false
}) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [modelUrl]);

  if (error) {
    return <div className={className}><ErrorFallback emoji={fallbackEmoji} /></div>;
  }

  return (
    <div className={className}>
      <ErrorBoundary setHasError={setError}>
        <Canvas gl={{ preserveDrawingBuffer: true }} dpr={[1, 2]} shadows>
          <Suspense fallback={<Loader />}>
            <Stage 
                intensity={0.5} 
                preset="rembrandt" 
                adjustCamera={1.2} 
                environment="city"
                shadows={false} 
            >
              <Model url={modelUrl} />
            </Stage>
            
            <OrbitControls 
                autoRotate={autoRotate} 
                autoRotateSpeed={4} 
                enableZoom={interactive} 
                enablePan={interactive}
                makeDefault 
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

// Error Boundary to catch GLTF loading failures (404s)
class ErrorBoundary extends React.Component<{ setHasError: (v: boolean) => void, children: React.ReactNode }> {
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    // Explicitly cast 'this' to any to access props if TS complains about missing 'props' property
    (this as any).props.setHasError(true);
  }
  render() {
    // Explicitly cast 'this' to any to access props if TS complains about missing 'props' property
    return (this as any).props.children;
  }
}
