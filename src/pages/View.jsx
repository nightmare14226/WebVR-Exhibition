import React, { Suspense, useState, useRef, useEffect } from 'react'
import { Canvas, useFrame, useLoader, extend, createRoot, events } from '@react-three/fiber'
import { useGLTF, PointerLockControls, OrbitControls } from '@react-three/drei'
import { VRButton, XR, Controllers, Hands, Interactive, RayGrab, useXR } from '@react-three/xr'
import * as THREE from 'three'

import { CrossHair } from '../components/CrossHair/CrossHair'

export const View = () => {

    const gallery = useGLTF('../assets/modeles/vr_gallery/scene.gltf')

    const tableau = useGLTF('../assets/textures/LaNuitEtoilee.glb')

    function Shader() {
        const ref = useRef()
        useFrame(({ clock }) => {
            ref.current.uniforms.uTime.value = clock.getElapsedTime()
        })
        return (
            <shaderMaterial
                ref={ref}
                args={[{
                    uniforms: {
                        uTime: { value: 0 },
                        uResolution: { value: new THREE.Vector2() },
                        uMouse: { value: new THREE.Vector2() },
                    },
                    vertexShader: `
                    mat2 m(float a){float c=cos(a), s=sin(a);return mat2(c,-s,s,c);}
                    float map(vec3 p){
                        p.xz*= m(t*0.4);p.xy*= m(t*0.3);
                        vec3 q = p*2.+t;
                        return length(p+vec3(sin(t*0.7)))*log(length(p)+1.) + sin(q.x+sin(q.z+sin(q.y)))*0.5 - 1.;
                    }
                    
                    void mainImage( out vec4 fragColor, in vec2 fragCoord ){	
                        vec2 p = fragCoord.xy/iResolution.y - vec2(1.05,.5);
                        vec3 cl = vec3(0.);
                        float d = 2.5;
                        for(int i=0; i<=5; i++)	{
                            vec3 p = vec3(0,0,5.) + normalize(vec3(p, -1.))*d;
                            float rz = map(p);
                            float f =  clamp((rz - map(p+.1))*0.5, -.1, 1. );
                            vec3 l = vec3(0.1,0.3,.4) + vec3(5., 2.5, 3.)*f;
                            cl = cl*l + smoothstep(2.5, .0, rz)*.7*l;
                            d += min(rz, 1.);
                        }
                        fragColor = vec4(cl, 1.);
                    }
                    `
                }]}
            />
        )
    }


    //utiliser pointerlockcontrols
    extend({ PointerLockControls })



    return (
        <>
            <CrossHair />
            <VRButton />
            <Canvas
                gl={{ antialias: true }}
                //zoomer la camera
                camera={{ position: [0, 1.5, 0], fov: 70, rotation: [0, 0, 0] }}
                onCreated={({ gl }) => {
                    gl.shadowMap.enabled = true
                    gl.shadowMap.type = THREE.PCFSoftShadowMap
                }}
            >
                <XR
                >
                    {
                        //pointerlockcontrols
                        <PointerLockControls
                            position={[0, 1.5, 0]}
                            rotation={[0, 0, 0]}
                            speed={0.05}
                            onLock={() => console.log('locked')}
                            onUnlock={() => console.log('unlocked')}
                        />
                    }
                    <Hands />
                    <boxGeometry />
                    <directionalLight castShadow position={[1, 2, 3]} intensity={2} />
                    <ambientLight intensity={0.5} />
                    <primitive
                        object={gallery.scene}
                        scale={1}
                        position={[0, 0, 0]}
                        rotation={[0, 0, 0]}
                        onClick={(event) => {
                            // console.log(event.object.name)
                            // console.log(event.eventObject)
                            // console.log(event.object)
                            // event.stopPropagation()
                        }}
                    />
                    <Interactive
                        onHover={() => {
                            //scale le tableau
                            tableau.scene.scale.set(0.42, 0.42, 0.42)
                            tableau.scene.position.set(0, 1.5, -4)
                        }}

                        onBlur={() => {
                            //scale le tableau
                            tableau.scene.scale.set(0.4, 0.4, 0.4)
                            tableau.scene.position.set(0, 1.5, -4.6)
                        }}
                    >
                        <RayGrab>
                            <primitive
                                object={tableau.scene}
                                scale={0.4}
                                position={[0, 1.5, -4.6]}
                                rotation={[0, 0, 0]}
                                //quand on hover le tableau sa avance
                                onPointerOver={(event) => {
                                    tableau.scene.position.set(0, 1.5, -4)
                                }}
                                onPointerOut={(event) => {
                                    tableau.scene.position.set(0, 1.5, -4.6)
                                }}
                            />
                        </RayGrab>
                    </Interactive>
                    <Controllers
                        rayMaterial={{ color: 'blue' }}
                    />
                </XR>
            </Canvas>
        </>
    )
}