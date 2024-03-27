import * as THREE from 'three';
import { CuboidCollider } from '@react-three/rapier';

import { Float, Text } from '@react-three/drei';

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

const floor1Material = new THREE.MeshStandardMaterial({ color: 'limegreen' });

export function Ground({ position = [0, 0, 0], scale = 20 }) {
    return (
      <group position={position}>
        <Float floatIntensity={0.25} rotationIntensity={0.25}>
          <Text
            font="/bebas-neue-v9-latin-regular.woff"
            scale={0.5}
            maxWidth={0.25}
            lineHeight={0.75}
            textAlign="left"
            position={[0.75, 0.65, 0]}
            rotation-y={-0.25}
          >
            Pixel Playground
            <meshBasicMaterial toneMapped={false} />
          </Text>
        </Float>
        <mesh
          geometry={boxGeometry}
          material={floor1Material}
          position={[0, -0.1, 0]}
          scale={[scale, 0.2, scale]}
          receiveShadow
        />
        <CuboidCollider
          args={[scale/2, 0.1, scale/2]}
          position={[0, -0.1, 0]}
        />
      </group>
    );
  }

export function Level() {
  return (
    <>
      <Ground />
    </>
  );
}
