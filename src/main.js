import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
// __controls_import__
// __gui_import__

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Pane } from 'tweakpane'

import portalVertex from './shaders/portal/vertex.glsl'
import portalFragment from './shaders/portal/fragment.glsl'

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

let mask

glftLoader.load('/3d-models/magic-mirror.glb', (gltf) => {
	gltf.scene.traverse((el) => {
		// if (el instanceof THREE.Mesh) {
		// 	const perMat = el.material
		// 	el.material = new THREE.MeshStandardMaterial({ map: perMat.map })
		// }
	})

	mask = gltf.scene
	mask.position.z = -4

	mirrorScene.add(mask)
})

loadingManager.onLoad = () => {
	mirrorScene.background = envMap
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
camera.position.set(4, 0, 8)
camera.lookAt(new THREE.Vector3(0, 2.5, 0))

/**
 * Show the axes of coordinates system
 */
// __helper_axes__
// const axesHelper = new THREE.AxesHelper(3)
// scene.add(axesHelper)
scene.background = new THREE.Color('lightgray')
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

const mirrorGeom = new THREE.SphereGeometry(2, 128, 64)
mirrorGeom.scale(1, 1.5, 0.05)
mirrorGeom.computeVertexNormals()
const mirrorMat = new THREE.ShaderMaterial({
	vertexShader: portalVertex,
	fragmentShader: portalFragment,
	uniforms: {
		uScene: new THREE.Uniform(rt.texture),
		uResolution: new THREE.Uniform(resolution),
	},
	transparent: true,
})
const mirror = new THREE.Mesh(mirrorGeom, mirrorMat)
// mirror.scale.set(1, 1.5, 0.05)
scene.add(mirror)

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
	const dt = clock.getDelta()
	time += dt
	/**
	 * tempo totale trascorso dall'inizio
	 */
	// const time = clock.getElapsedTime()

	// __controls_update__
	controls.update(dt)

	if (mask) {
		mask.position.y = Math.sin(time) * 0.2
		mask.position.x = Math.cos(time) * 0.15
		mask.rotation.z = Math.cos(time) * 0.05 + Math.sin(time) * 0.05
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
