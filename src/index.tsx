import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as THREE from 'three';
import * as Detector from './GLDetector.js';
import loadColladaLoader from './ColladaLoader.js';
import * as loadTrackball from './TrackballControls.js';
import { fetchAirplaneData, AirplaneData } from './flightapi';

let FILE_PATHS = {
    SPACE_PAN: "assets/space-panorama-hi.jpg",
    WORLD_MAP: "assets/world-med-2e11.jpg",
    TEX_DISC: "assets/disc.png",
};

let camera: THREE.PerspectiveCamera = null;
let renderer: THREE.WebGLRenderer = null;

//window['fetchAirplaneData'] = fetchAirplaneData;
window['THREE'] = THREE;
let adata: AirplaneData = null;

function main() {
    document.body.addEventListener('touchstart', function(e){ e.preventDefault(); });

    if (!Detector.webgl) {
        let warning = Detector.getWebGLErrorMessage();
        document.body.appendChild( warning );
        return;
    }
    let scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, 
        window.innerWidth / window.innerHeight, 0.1, 1000 );
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor("white");
    document.body.appendChild( renderer.domElement );

    let maxTexSize = renderer.context.getParameter(renderer.context.MAX_TEXTURE_SIZE);
    console.log(`Max texture size: ${maxTexSize}`);

    loadTrackball( THREE );
    let controls = new THREE.TrackballControls( camera );
    controls.rotateSpeed = 2.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = true;
    controls.noRotate = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [ 65, 83, 68 ];
    //controls.zoomCamera

    let geometry = new THREE.SphereGeometry( 1, 64, 64 );
    let material = new THREE.MeshPhongMaterial( { color: 'white' } );
    material.side = THREE.DoubleSide;
    let cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    //let texture = new THREE.TextureLoader().load( "assets/earthmap.jpg" );
    let texture = new THREE.TextureLoader().load( FILE_PATHS.WORLD_MAP );
    material.map = texture;

    camera.position.z = 5;

    let directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set( 0, 0, 1 );
    scene.add( directionalLight );

    let ambientLight = new THREE.AmbientLight( '#fff', 0.3 );
    scene.add( ambientLight );

    // let phone: THREE.Scene = null;
    // loadColladaLoader(THREE);
    // let loader = new THREE.ColladaLoader();
    // loader.load('assets/iphone.dae', file => {
    //     phone = file.scene;
    //     //scene.add(phone);
    // });

    //let axisHelper = new THREE.AxisHelper( 5 );
    //scene.add( axisHelper );

    loadTrackball(THREE);
    window['THREE'] = THREE;



    fetchAirplaneData().then( data => { 
        adata = data;
        renderAirplaneData( scene, adata );
        console.log(["Data loaded", adata]);

        // let ctr = 0;
        // window.setInterval(() => {
        //     ctr += THREE.Math.degToRad(10);
        //     for (let i = 0; i < adata.length; i++) {
        //         let aplane = adata.airplane(i);
        //         let vertex = geometry.vertices[i];
        //         vertex.set(1.01, 0, 0);
        //         vertex.applyAxisAngle(new THREE.Vector3(0, 0, 1),
        //             THREE.Math.degToRad(aplane.latitude + 1 * Math.cos(ctr + i / 180)));
        //         vertex.applyAxisAngle(new THREE.Vector3(0, 1, 0),
        //             THREE.Math.degToRad(aplane.longitude + 1 * Math.sin(ctr + i / 180)));
        //         geometry.vertices[i] = vertex;
        //         //vertex.y = aplane.latitude * 10 / 90;
        //         //vertex.x = aplane.longitude * 10 / 180;
        //         //vertex.z = 20 * Math.random() - 10;
        //         //geometry.vertices.push( vertex );
        //     }
        //     geometry.verticesNeedUpdate = true;  
        //     console.log("vertices updated");
        // }, 30);
    });

    // var textures = getTexturesFromAtlasFile( "assets/panorama01.jpg", 6 );
    // var materials = [];
    // for ( var i = 0; i < 6; i ++ ) {
    //     materials.push( new THREE.MeshBasicMaterial( { map: textures[ i ] } ) );
    // }
    // var skyBox = new THREE.Mesh( new THREE.BoxGeometry( 20, 20, 20 ), materials as any );
    // skyBox.applyMatrix( new THREE.Matrix4().makeScale( 1, 1, - 1 ) );
    // scene.add( skyBox );    

    loadSkybox( scene );

    function animate() {
        window.requestAnimationFrame( animate );
        //cube.rotation.x += 0.01;
        //cube.rotation.y += 0.01;

        controls.update();
        let {x:cx,y:cy,z:cz} = camera.position;
        directionalLight.position.set( cx, cy, cz );
        renderer.render( scene, camera );
    }
    animate();

    let btn = document.createElement('button');
    btn.innerHTML = 'Fullscreen';
    btn.addEventListener('click', () => {
        //window.alert('Woot')
        renderer.domElement.webkitRequestFullscreen();
        //THREE.T
    });
    document.body.appendChild(btn);

    window.addEventListener( 'resize', onWindowResize, false );
}
window.onload = main;

function onWindowResize( event ) {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function renderAirplaneData( scene: THREE.Scene, adata: AirplaneData ) {
    let geometry = new THREE.Geometry();
    let sprite = new THREE.TextureLoader().load( FILE_PATHS.TEX_DISC );
    // for ( let i = 0; i < 1000; i ++ ) {
    // 	var vertex = new THREE.Vector3();
    // 	vertex.x = 20 * Math.random() - 10;
    // 	vertex.y = 20 * Math.random() - 10;
    // 	vertex.z = 20 * Math.random() - 10;
    // 	geometry.vertices.push( vertex );
    // }
    let material = new THREE.PointsMaterial( { 
        size: 0.01, 
        sizeAttenuation: true,
        map: sprite, 
        alphaTest: 0.5, 
        transparent: true } );
    material.color.setHSL( 0.0, 0.9, 0.5 );

    for (let i = 0; i < adata.length; i++) {
        let aplane = adata.airplane(i);
        var vertex = new THREE.Vector3(1.01, 0, 0);
        vertex.applyAxisAngle(new THREE.Vector3(0, 0, 1),
            THREE.Math.degToRad(aplane.latitude));
        vertex.applyAxisAngle(new THREE.Vector3(0, 1, 0),
            THREE.Math.degToRad(aplane.longitude));
        //vertex.y = aplane.latitude * 10 / 90;
        //vertex.x = aplane.longitude * 10 / 180;
        //vertex.z = 20 * Math.random() - 10;
        geometry.vertices.push( vertex );
    }
    let particles = new THREE.Points( geometry, material );
    scene.add( particles );
}

function loadSkybox( scene: THREE.Scene ) {
    // let geometry = new THREE.SphereBufferGeometry( 500, 60, 40 ).toNonIndexed();
    // geometry.scale( - 1, 1, 1 );
    // // Remap UVs
    // var normals = geometry.attributes['normal'].array;
    // var uvs = geometry.attributes['uv'].array;
    // for ( var i = 0, l = normals.length / 3; i < l; i ++ ) {
    //     var x = normals[ i * 3 + 0 ];
    //     var y = normals[ i * 3 + 1 ];
    //     var z = normals[ i * 3 + 2 ];
    //     if ( i < l / 2 ) {
    //         var correction = ( x == 0 && z == 0 ) ? 1 : ( Math.acos( y ) / Math.sqrt( x * x + z * z ) ) * ( 2 / Math.PI );
    //         uvs[ i * 2 + 0 ] = x * ( 404 / 1920 ) * correction + ( 447 / 1920 );
    //         uvs[ i * 2 + 1 ] = z * ( 404 / 1080 ) * correction + ( 582 / 1080 );
    //     } else {
    //         var correction = ( x == 0 && z == 0 ) ? 1 : ( Math.acos( - y ) / Math.sqrt( x * x + z * z ) ) * ( 2 / Math.PI );
    //         uvs[ i * 2 + 0 ] = - x * ( 404 / 1920 ) * correction + ( 1460 / 1920 );
    //         uvs[ i * 2 + 1 ] = z * ( 404 / 1080 ) * correction + ( 582 / 1080 );
    //     }
    // }
    // geometry.rotateZ( - Math.PI / 2 );
    // //
    // let texture = new THREE.TextureLoader().load( 'assets/space-panorama.png' );
    // texture.format = THREE.RGBFormat;
    // let material   = new THREE.MeshBasicMaterial( { map: texture } );
    // let mesh = new THREE.Mesh( geometry, material );
    // scene.add( mesh );    


    var geometry = new THREE.SphereGeometry( 500, 60, 40 );
    geometry.scale( - 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( {
        map: new THREE.TextureLoader().load( FILE_PATHS.SPACE_PAN )
    } );
    let mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );    
}

// function getTexturesFromAtlasFile( atlasImgUrl, tilesNum ) {
//     var textures = [];
//     for ( var i = 0; i < tilesNum; i ++ ) {
//         textures[ i ] = new THREE.Texture();
//     }
//     var imageObj = new Image();
//     imageObj.onload = function() {
//         var canvas, context;
//         var tileWidth = imageObj.height;
//         for ( var i = 0; i < textures.length; i ++ ) {
//             canvas = document.createElement( 'canvas' );
//             context = canvas.getContext( '2d' );
//             canvas.height = tileWidth;
//             canvas.width = tileWidth;
//             context.drawImage( imageObj, tileWidth * i, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth );
//             textures[ i ].image = canvas
//             textures[ i ].needsUpdate = true;
//         }
//     };
//     imageObj.src = atlasImgUrl;
//     return textures;
// }