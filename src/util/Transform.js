import { mat4, quat, vec3 } from 'gl-matrix';

export class Transform {
  world = mat4.create();
  local = mat4.create();

  position = vec3.create();
  rotation = quat.create();
  scale = vec3.fromValues(1, 1, 1);
}
