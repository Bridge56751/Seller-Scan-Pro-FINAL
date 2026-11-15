import test from "node:test";
import assert from "node:assert/strict";
import { createCameraActivationGate } from "../shared/camera-activation";

function setup() {
  const callbacks: (()=>void)[] = [];
  const changes: boolean[] = [];
  const gate = createCameraActivationGate(value=>changes.push(value),250,
    callback => { callbacks.push(callback); return callbacks.length as unknown as ReturnType<typeof setTimeout>; },
    () => {});
  return { gate, callbacks, changes };
}
test("rapid barcode/history switches cannot restart an old camera activation",()=>{
  const {gate,callbacks,changes}=setup();
  for(let i=0;i<30;i++){gate.start();gate.stop();}
  callbacks.forEach(callback=>callback());
  assert.equal(gate.isActive(),false);
  assert.deepEqual(changes,[]);
  gate.start();
  callbacks.at(-1)!();
  assert.equal(gate.isActive(),true);
  assert.deepEqual(changes,[true]);
});
test("blur/background disables detection immediately and resume happens once",()=>{
  const {gate,callbacks,changes}=setup();
  gate.start();gate.start();
  assert.equal(callbacks.length,1);
  callbacks[0]();
  assert.equal(gate.isActive(),true);
  gate.stop();
  assert.equal(gate.isActive(),false);
  gate.stop();
  gate.start();
  assert.equal(gate.isActive(),false);
  callbacks[1]();
  assert.deepEqual(changes,[true,false,true]);
});
test("leaving before camera initialization finishes invalidates queued work",()=>{
  const {gate,callbacks,changes}=setup();
  gate.start();
  gate.stop();
  callbacks[0]();
  assert.deepEqual(changes,[]);
  assert.equal(gate.isActive(),false);
});
