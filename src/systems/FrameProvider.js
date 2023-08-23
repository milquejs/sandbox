import { AnimationFrameLoop, Topic, TopicManager } from '@milquejs/milque'

export const PRE_FRAME = new Topic('PRE_FRAME');
export const FRAME = new Topic('FRAME');

export class FrameProvider {
  topics = new TopicManager();
  loop = new AnimationFrameLoop(e => {
    PRE_FRAME.dispatchImmediately(this.topics, e);
    // If it was cancelled early in M.FRAME, early out.
    if (!e.running) {
      return;
    }
    this.frame = e.detail;
    FRAME.dispatchImmediately(this.topics, e);
    this.topics.flush();
  });
  /** @type {import('@milquejs/milque').AnimationFrameDetail} */
  frame = createAnimationFrameDetail();
}

/** @returns {import('@milquejs/milque').AnimationFrameDetail} */
function createAnimationFrameDetail() {
  return {
    currentTime: -1,
    prevTime: -1,
    deltaTime: 0,
  };
}
