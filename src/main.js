import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
// __controls_import__
// __gui_import__

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Pane } from 'tweakpane'

import portalVertex from './shaders/portal/vertex.glsl'
import portalFragment from './shaders/portal/fragment.glsl'
import { lerp } from 'three/src/math/MathUtils.js'
import createRoundedFlatOval from './utilities'
import gsap from 'gsap'

const loadingManager = new THREE.LoadingManager()
const glftLoader = new GLTFLoader(loadingManager)
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)

const envMap = cubeTextureLoader.load([
	'/universe/px.png',
	'/universe/nx.png',
	'/universe/py.png',
	'/universe/ny.png',
	'/universe/pz.png',
	'/universe/nz.png',
])

const envMapCastle = cubeTextureLoader.load([
	'/castle/px.png',
	'/castle/nx.png',
	'/castle/py.png',
	'/castle/ny.png',
	'/castle/pz.png',
	'/castle/nz.png',
])

let mask

glftLoader.load('/3d-models/magic-mirror.glb', (gltf) => {
	gltf.scene.traverse((el) => {
		// if (el instanceof THREE.Mesh) {
		// 	const perMat = el.material
		// 	el.material = new THREE.MeshStandardMaterial({ map: perMat.map })
		// }
	})

	mask = gltf.scene
	mask.scale.setScalar(0.75)
})

loadingManager.onLoad = () => {
	mirrorScene.background = envMap

	scene.add(mirror)
	mask.position.z = -8

	mirrorScene.add(mask)

	gsap.to(mirror.scale, { x: 1, y: 1, z: 1, duration: 1, ease: 'power4.inOut' })
}

/**
 * Debug
 */
// __gui__
const config = {
	example: 5,
}
const pane = new Pane()

pane
	.addBinding(config, 'example', {
		min: 0,
		max: 10,
		step: 0.1,
	})
	.on('change', (ev) => console.log(ev.value))

/**
 * Scene
 */
const scene = new THREE.Scene()
const mirrorScene = new THREE.Scene()
// scene.background = new THREE.Color(0xdedede)

/**
 * render sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}

/**
 * Camera
 */
const fov = 60
const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1)
camera.position.set(0, 0, 10)
camera.lookAt(new THREE.Vector3(0, 2.5, 0))

/**
 * Show the axes of coordinates system
 */
// __helper_axes__
// const axesHelper = new THREE.AxesHelper(3)
// scene.add(axesHelper)
// scene.background = new THREE.Color('lightgray')
/**
 * renderer
 */
const renderer = new THREE.WebGLRenderer({
	antialias: window.devicePixelRatio < 2,
})
document.body.appendChild(renderer.domElement)

const resolution = new THREE.Vector2()
const rt = new THREE.WebGLRenderTarget(resolution.x, resolution.y, {
	format: THREE.RGBAFormat,
	stencilBuffer: false,
	depthBuffer: true,
	minFilter: THREE.LinearFilter,
	magFilter: THREE.LinearFilter,
})

handleResize()

const mirrorGeom = createRoundedFlatOval(
	5, // width
	5, // height
	2.5, // xRadius
	0.1, // thickness
	0.5, // size
	-1 // offset
)
mirrorGeom.scale(1, 1.5, 1)
mirrorGeom.computeVertexNormals()
const mirrorMat = new THREE.ShaderMaterial({
	vertexShader: portalVertex,
	fragmentShader: portalFragment,
	// wireframe: true,
	uniforms: {
		uScene: new THREE.Uniform(rt.texture),
		uResolution: new THREE.Uniform(resolution),
		uEnvMap: new THREE.Uniform(envMapCastle),
		uTime: new THREE.Uniform(0),
	},
	transparent: true,
})
const mirror = new THREE.Mesh(mirrorGeom, mirrorMat)
mirror.scale.setScalar(0)

// scene.background = envMapCastle

/**
 * OrbitControls
 */
// __controls__
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
const directionalLight = new THREE.DirectionalLight(0xffffff, 4.5)
directionalLight.position.set(3, 10, 7)
mirrorScene.add(ambientLight, directionalLight)

const pointer = new THREE.Vector2()
window.addEventListener('mousemove', (e) => {
	pointer.x = 2 * (e.clientX / window.innerWidth) - 1
	pointer.y = -2 * (e.clientY / window.innerHeight) + 1
})

/**
 * Three js Clock
 */
// __clock__
const clock = new THREE.Clock()
let time = 0

/**
 * frame loop
 */
function tic() {
	/**
	 * tempo trascorso dal frame precedente
	 */
	const dt = Math.min(clock.getDelta(), 0.02)
	time += dt
	/**
	 * tempo totale trascorso dall'inizio
	 */
	// const time = clock.getElapsedTime()

	// __controls_update__
	controls.update(dt)

	mirrorMat.uniforms.uTime.value = time

	if (mask) {
		const position = new THREE.Vector3(
			Math.cos(time) * 0.25 - pointer.x * 1.5,
			Math.sin(time) * 0.2 - pointer.y * 1,
			-5 + Math.max(Math.abs(pointer.x), Math.abs(pointer.y)) * 2
		)

		const rotation = new THREE.Euler(
			-pointer.y * Math.PI * 0.1,
			pointer.x * Math.PI * 0.2,
			Math.cos(time) * 0.05 + Math.sin(time) * 0.05
		)

		mask.position.lerp(position, dt * 5)
		mask.rotation.x = lerp(mask.rotation.x, rotation.x, dt * 5)
		mask.rotation.y = lerp(mask.rotation.y, rotation.y, dt * 5)
		mask.rotation.z = lerp(mask.rotation.z, rotation.z, dt * 5)
	}

	renderer.setRenderTarget(rt)
	renderer.clear()
	renderer.render(mirrorScene, camera)
	renderer.setRenderTarget(null)
	renderer.render(scene, camera)

	requestAnimationFrame(tic)
}

requestAnimationFrame(tic)

window.addEventListener('resize', handleResize)

function handleResize() {
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	camera.aspect = sizes.width / sizes.height

	// camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix()

	renderer.setSize(sizes.width, sizes.height)

	const pixelRatio = Math.min(window.devicePixelRatio, 2)
	renderer.setPixelRatio(pixelRatio)

	renderer.getDrawingBufferSize(resolution)
	rt.setSize(resolution.x, resolution.y)
}
