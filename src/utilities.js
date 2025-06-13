import * as THREE from 'three'

function createRoundedFlatOval(
	width = 2,
	height = 1,
	cornerRadius = 0.2,
	thickness = 0.1,
	size = 0.1,
	offset = 0.1
) {
	// Crea il profilo dell'ovale con bordi arrotondati
	const shape = new THREE.Shape()

	// Parametri per il controllo della curva
	const segments = 32 // Numero di segmenti per gli archi

	// Punto di partenza
	shape.moveTo(-width / 2 + cornerRadius, -height / 2)

	// Bordo inferiore
	shape.lineTo(width / 2 - cornerRadius, -height / 2)

	// Angolo inferiore destro
	shape.absarc(
		width / 2 - cornerRadius,
		-height / 2 + cornerRadius,
		cornerRadius,
		Math.PI * 1.5,
		0,
		false
	)

	// Bordo destro
	shape.lineTo(width / 2, height / 2 - cornerRadius)

	// Angolo superiore destro
	shape.absarc(
		width / 2 - cornerRadius,
		height / 2 - cornerRadius,
		cornerRadius,
		0,
		Math.PI * 0.5,
		false
	)

	// Bordo superiore
	shape.lineTo(-width / 2 + cornerRadius, height / 2)

	// Angolo superiore sinistro
	shape.absarc(
		-width / 2 + cornerRadius,
		height / 2 - cornerRadius,
		cornerRadius,
		Math.PI * 0.5,
		Math.PI,
		false
	)

	// Bordo sinistro
	shape.lineTo(-width / 2, -height / 2 + cornerRadius)

	// Angolo inferiore sinistro
	shape.absarc(
		-width / 2 + cornerRadius,
		-height / 2 + cornerRadius,
		cornerRadius,
		Math.PI,
		Math.PI * 1.5,
		false
	)

	// Opzioni per l'estrusione
	const extrudeSettings = {
		steps: 3,
		depth: 0.01,
		bevelEnabled: true,
		bevelThickness: thickness,
		bevelSize: size,
		bevelOffset: offset,
		bevelSegments: segments,
		curveSegments: 128,
	}

	// Crea la geometria
	const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)

	return geometry
}

export default createRoundedFlatOval
