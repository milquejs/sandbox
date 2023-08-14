
/**
 * @param {import('../index.js').World} world
 */
export function Intro(world) {
  return {
    state: 'button',
  };
}

/**
 * 
 * @param {import('../index.js').World} world 
 * @param {string} nextState 
 */
export function moveToState(world, nextState) {
  let intro = world.systems.get(Intro);
  intro.state = nextState;
}

/**
 * @param {import('../index.js').World} world
 */
export function getCurrentState(world) {
  let intro = world.systems.get(Intro);
  return intro.state;
}
