import { Physics } from '@react-three/rapier';
import Lights from './Lights.jsx';
import { Level } from './Level.jsx';
import Player from './Player.jsx';

export default function Experience() {
  return (
    <>
      <color args={['#bdedfc']} attach="background" />
      <Physics debug={false}>
        <Lights />
        <Level />
        <Player />
      </Physics>
    </>
  );
}
