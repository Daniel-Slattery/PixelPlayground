import { useRapier, RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { throttle } from 'lodash';
import useGame from './stores/useGame.jsx';
import socket from './socket';

export default function Player() {
  const body = useRef();
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { rapier, world } = useRapier();
  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(10, 10, 10),
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3());
  const start = useGame((state) => state.start);
  const restart = useGame((state) => state.restart);

  const emitPosition = throttle((position) => {
    socket.emit('move', { position });
  }, 100); // Throttle to 10 updates per second

  const prevPosition = useRef({ x: 0, y: 0, z: 0 });
  const threshold = 0.01; // Adjust this threshold value as needed

  const [otherAvatars, setOtherAvatars] = useState({});

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
    });

    socket.on('initial-avatars', (avatars) => {
      setOtherAvatars(avatars);
    });

    socket.on('avatar-moved', ({ id, position }) => {
      setOtherAvatars((avatars) => ({ ...avatars, [id]: position }));
    });

    socket.on('avatar-disconnected', (id) => {
      setOtherAvatars((avatars) => {
        const { [id]: _, ...remainingAvatars } = avatars;
        return remainingAvatars;
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.off('connect');
      socket.off('initial-avatars');
      socket.off('avatar-moved');
      socket.off('avatar-disconnected');
      socket.off('disconnect');
    };
  }, []);

  const jump = () => {
    const origin = body.current.translation();
    origin.y -= 0.31;
    const direction = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(origin, direction);
    const hit = world.castRay(ray, 10, true);

    if (hit.timeOfImpact < 0.15) {
      body.current.applyImpulse({ x: 0, y: 0.5, z: 0 });
    }
  };

  const reset = () => {
    body.current.setTranslation({ x: 0, y: 1, z: 0 });
    body.current.setLinvel({ x: 0, y: 0, z: 0 });
    body.current.setAngvel({ x: 0, y: 0, z: 0 });
  };

  useEffect(() => {
    const unsubscribeReset = useGame.subscribe(
      (state) => state.phase,
      (value) => {
        if (value === 'ready') reset();
      },
    );

    const unsubscribeJump = subscribeKeys(
      (state) => state.jump,
      (value) => {
        if (value) jump();
      },
    );

    const unsubscribeAny = subscribeKeys(() => {
      start();
    });

    return () => {
      unsubscribeReset();
      unsubscribeJump();
      unsubscribeAny();
    };
  }, []);

  useFrame((state, delta) => {
    /**
     * Controls
     */
    const { forward, backward, leftward, rightward } = getKeys();

    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };

    const impulseStrength = 0.6 * delta;
    const torqueStrength = 0.2 * delta;

    if (forward) {
      impulse.z -= impulseStrength;
      torque.x -= torqueStrength;
    }

    if (rightward) {
      impulse.x += impulseStrength;
      torque.z -= torqueStrength;
    }

    if (backward) {
      impulse.z += impulseStrength;
      torque.x += torqueStrength;
    }

    if (leftward) {
      impulse.x -= impulseStrength;
      torque.z += torqueStrength;
    }

    body.current.applyImpulse(impulse);
    body.current.applyTorqueImpulse(torque);

    /**
     * Camera
     */
    const bodyPosition = body.current.translation();

    const cameraPosition = new THREE.Vector3();
    cameraPosition.copy(bodyPosition);
    cameraPosition.z += 2.25;
    cameraPosition.y += 0.65;

    const cameraTarget = new THREE.Vector3();
    cameraTarget.copy(bodyPosition);
    cameraTarget.y += 0.25;

    smoothedCameraPosition.lerp(cameraPosition, 5 * delta);
    smoothedCameraTarget.lerp(cameraTarget, 5 * delta);

    state.camera.position.copy(smoothedCameraPosition);
    state.camera.lookAt(smoothedCameraTarget);

    // Emit the position to the server only if it has changed significantly
    if (
      Math.abs(bodyPosition.x - prevPosition.current.x) > threshold ||
      Math.abs(bodyPosition.y - prevPosition.current.y) > threshold ||
      Math.abs(bodyPosition.z - prevPosition.current.z) > threshold
    ) {
      emitPosition(bodyPosition);
      prevPosition.current = { ...bodyPosition };
    }

    if (bodyPosition.y < -4) restart();
  });

  return (
    <>
      <RigidBody
        ref={body}
        canSleep={false}
        colliders="ball"
        restitution={0.2}
        friction={1}
        linearDamping={0.5}
        angularDamping={0.5}
        position={[0, 1, 0]}
      >
        <mesh castShadow>
          <icosahedronGeometry args={[0.3, 1]} />
          <meshStandardMaterial flatShading color="mediumpurple" />
        </mesh>
      </RigidBody>
      {Object.entries(otherAvatars).map(([id, position]) => (
        <RigidBody
          key={id}
          position={[position.x, position.y, position.z]}
          canSleep={false}
          colliders="ball"
          restitution={0.2}
          friction={1}
          linearDamping={0.5}
          angularDamping={0.5}
        >
          <mesh castShadow>
            <icosahedronGeometry args={[0.3, 1]} />
            <meshStandardMaterial flatShading color="orange" />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
}
