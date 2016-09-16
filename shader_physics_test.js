

var renderer, scene, camera;

var particleSystem, uniforms, geometry;

var fboParticles, simulationShader, material;

var particles;

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

init();
animate();

function init() {

    renderer = new THREE.WebGLRenderer( { antialias: false, premultipliedAlpha : false } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( WIDTH, HEIGHT );

	var container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    // scene.position = THREE.Vector3(WIDTH/2, HEIGHT/2, 0);
    
    camera = new THREE.OrthographicCamera( WIDTH / - 2, WIDTH / 2, HEIGHT / 2, HEIGHT / - 2, 1, 1000 );
    camera.position.set( 0,0,500 );
    camera.lookAt( scene.position );
    
    // Interesting - so this accounts for needing to make textures a factor of two
    // var width = 512, height = 512;
	// var width = 64, height = 64;
	// var width = 128, height = 128;
    // var width = 32, height = 32;
    // var width = 16, height = 16;
    // var width = 8, height = 8;
    var width = 4, height = 4;
    
    particles = width * height;
    
    if ( ! renderer.context.getExtension( 'OES_texture_float' ) ) {
            alert( 'OES_texture_float is not :(' );
	}
    
    // Start Creation of DataTexture

	var cloudWidth = 50;
    var cloudHeight = 50;

	var positions = new Float32Array( particles * 4 );
    var gridPositions = new Float32Array( particles * 4 );
    var offsets = new Float32Array( particles * 4 );

    // var somePositions = [
    // 10.885510444641113, -6.274578094482422, 0, 0,
    // -10.12020206451416, 0.8196354508399963, 0, 0,
    // 35.518341064453125, -5.810637474060059, 0, 0,
    // 3.7696402072906494, -3.118760347366333, 0, 0,
    // 9.090447425842285, -7.851400375366211, 0, 0,
    // -32.53229522705078, -26.4628849029541, 0, 0,
    // 32.3623046875, 22.746187210083008, 0, 0,
    // 7.844726085662842, -15.305091857910156, 0, 0,
    // -32.65345001220703, 22.251712799072266, 0, 0,
    // -25.811357498168945, 32.4153938293457, 0, 0,
    // -28.263731002807617, -31.015430450439453, 0, 0,
    // 2.0903847217559814, 1.7632032632827759, 0, 0,
    // -4.471604347229004, 8.995194435119629, 0, 0,
    // -12.317420959472656, 12.19576358795166, 0, 0,
    // 36.77312469482422, -14.580523490905762, 0, 0,
    // 36.447078704833984, -16.085195541381836, 0, 0];

    // var somePositions = [
    // -30.0, 600.0, 0.0, 0.0,
    // -15.0, 600.0, 0.0, 0.0,
    // 15.0, 600.0, 0.0, 0.0,
    // 30.0, 600.0, 0.0, 0.0,
    // -30.0, 300.0, 0.0, 0.0,
    // -15.0, 300.0, 0.0, 0.0,
    // 15.0, 300.0, 0.0, 0.0,
    // 30.0, 300.0, 0.0, 0.0,
    // -30.0, -300.0, 0.0, 0.0,
    // -15.0, -300.0, 0.0, 0.0,
    // 15.0, -300.0, 0.0, 0.0,
    // 30.0, -300.0, 0.0, 0.0,
    // -30.0, -600.0, 0.0, 0.0,
    // -15.0, -600.0, 0.0, 0.0,
    // 15.0, -600.0, 0.0, 0.0,
    // 30.0, -600.0, 0.0, 0.0];
    
	for ( var i = 0, i4 = 0; i < particles; i ++, i4 +=4 ) {

        positions[ i4 + 0 ] = ( Math.random() * 2 - 1 ) * cloudWidth; // x
        positions[ i4 + 1 ] = ( Math.random() * 2 - 1 ) * cloudHeight; // y
        positions[ i4 + 2 ] = 0.0; // velocity
        positions[ i4 + 3 ] = 0.0; // velocity

        // sanity check
        // positions[ i4 + 0 ] = somePositions[ i4 + 0 ]; // x
        // positions[ i4 + 1 ] = somePositions[ i4 + 1 ] * 20; // y
        // positions[ i4 + 2 ] = 0.0; // velocity
        // positions[ i4 + 3 ] = 0.0; // velocity
        
        // gridPositions[ i4 + 0 ] = 0.0; // x 
        // gridPositions[ i4 + 1 ] = 0.0; // y
        // gridPositions[ i4 + 2 ] = 0.0;  // z
        // gridPositions[ i4 + 3 ] = 0.0;  // w - not used
        
        offsets[ i4 + 0 ] = positions[ i4 + 0 ] - gridPositions[ i4 + 0 ]; // width offset
        offsets[ i4 + 1 ] = positions[ i4 + 1 ] - gridPositions[ i4 + 1 ]; // height offset
        offsets[ i4 + 2 ] = 0.0; // not used
        offsets[ i4 + 3 ] = 0.0; // not used

	}

	console.log( offsets );
	// console.log( gridPositions );
     
    positionsTexture = new THREE.DataTexture( positions, width, height, THREE.RGBAFormat, THREE.FloatType );
	positionsTexture.minFilter = THREE.NearestFilter;
	positionsTexture.magFilter = THREE.NearestFilter;
	positionsTexture.needsUpdate = true;

	// gridPositionsTexture = new THREE.DataTexture( gridPositions, width, height, THREE.RGBAFormat, THREE.FloatType );
	// gridPositionsTexture.minFilter = THREE.NearestFilter;
	// gridPositionsTexture.magFilter = THREE.NearestFilter;
	// gridPositionsTexture.needsUpdate = true;

	offsetsTexture = new THREE.DataTexture( offsets, width, height, THREE.RGBAFormat, THREE.FloatType );
	offsetsTexture.minFilter = THREE.NearestFilter;
	offsetsTexture.magFilter = THREE.NearestFilter;
	offsetsTexture.needsUpdate = true;

	rtTexturePos = new THREE.WebGLRenderTarget(width, height, {
		wrapS:THREE.RepeatWrapping,
		wrapT:THREE.RepeatWrapping,
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat,
		type:THREE.FloatType,
		stencilBuffer: false
	});

	rtTexturePos2 = rtTexturePos.clone();

    simulationShader = new THREE.ShaderMaterial({
		uniforms: {
			tPositions: { type: "t", value: positionsTexture },
			// tGridPositions: { type: "t", value: gridPositionsTexture },
			tOffsets: { type: "t", value: offsetsTexture },
			uResolution: { type: "v2", value: new THREE.Vector2(WIDTH, HEIGHT) },
            uTime: { type: "f", value: 1.0 },
            uXOffW: { type: "f", value: 0.5 }
		},
            vertexShader: document.getElementById('texture_vertex_simulation_shader').textContent,
            fragmentShader:  document.getElementById('texture_fragment_simulation_shader').textContent
	});

	fboParticles = new THREE.FBOUtils( width, renderer, simulationShader );
	fboParticles.renderToTexture(rtTexturePos, rtTexturePos2);

	fboParticles.in = rtTexturePos;
	fboParticles.out = rtTexturePos2;


	geometry = new THREE.BufferGeometry();

    var positions2 = new Float32Array( particles * 3 );

	for ( var j = 0, j3 = 0, l = width * height; j < l; j ++, j3 += 3 ) {

		positions2[ j3 + 0 ] = ( j % width ) / width ;
		positions2[ j3 + 1 ]  = Math.floor( j / width ) / height;
		positions2[ j3 + 2 ]  = l * 0.01; // this is the real z value for the particle display

	}

	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions2, 3 ) );

	// geometry = new THREE.Geometry();

	// 			for ( var i = 0, l = width * height; i < l; i ++ ) {

	// 				var vertex = new THREE.Vector3();
	// 				vertex.x = ( i % width ) / width ;
	// 				vertex.y = Math.floor( i / width ) / height;
	// 				geometry.vertices.push( vertex );

	// 			}

	material = new THREE.ShaderMaterial( {
		uniforms: {
			"map": { type: "t", value: rtTexturePos.texture },
            // "texture": { type: "t", value: new THREE.TextureLoader().load( "//i.imgur.com/Kzk9I8o.png" ) },
			"width": { type: "f", value: width },
			"height": { type: "f", value: height },
			"pointSize": { type: "f", value: 10 }
		},
		vertexShader: document.getElementById( 'vs-particles' ).textContent,
		fragmentShader: document.getElementById( 'fs-particles' ).textContent,
		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true
    } );

	mesh = new THREE.Points( geometry, material );
	scene.add( mesh );

	var axis1 = new THREE.AxisHelper(250);
	scene.add(axis1);

    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );
    update();
	render();
    
}

function render() {
    // renderer.clear();
    renderer.render( scene, camera );
}
    
function update() {
    simulationShader.uniforms.uTime.value += 0.01;
    simulationShader.uniforms.uXOffW.value += 0.001;
    // swap
	var tmp = fboParticles.in;
	fboParticles.in = fboParticles.out;
	fboParticles.out = tmp;

	simulationShader.uniforms.tPositions.value = fboParticles.in.texture;
	fboParticles.simulate(fboParticles.out);
	material.uniforms.map.value = fboParticles.out.texture;
    // renderer.clear();
}

