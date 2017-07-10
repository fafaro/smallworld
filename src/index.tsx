//require('bootstrap/solarized/bootstrap.min.css');
require('bootstrap/dist/css/bootstrap.css');
require('bootstrap/dist/css/bootstrap-theme.css');
require('jquery');
require('bootstrap');
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as THREE from 'three';
import * as Detector from './GLDetector.js';
import loadColladaLoader from './ColladaLoader.js';
import * as loadTrackball from './TrackballControls.js';
import { fetchAirplaneData, fetchLocalAirplaneData, AirplaneData } from './flightapi';
import { SHOW_AXIS, FILE_PATHS, EARTH_BRIGHTNESS } from './consts';
import { PlaneManager } from './planebb';
import SearchComponent2 from './SearchComponent';

let camera: THREE.PerspectiveCamera = null;
let renderer: THREE.WebGLRenderer = null;

window['THREE'] = THREE;
let adata: AirplaneData = null;
let planeMgr: PlaneManager = null;

function main() {
    document.body.addEventListener('touchstart', function(e){ e.preventDefault(); });

    if (!Detector.webgl) {
        let warning = Detector.getWebGLErrorMessage();
        document.body.appendChild( warning );
        return;
    }
    let scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, 
        window.innerWidth / window.innerHeight, 0.01, 128 );
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor("white");
    window['renderer'] = renderer;
    document.body.appendChild( renderer.domElement );

    planeMgr = new PlaneManager( scene );

    let maxTexSize = renderer.context.getParameter(renderer.context.MAX_TEXTURE_SIZE);
    console.log(`Max texture size: ${maxTexSize}`);

    loadTrackball( THREE );
    let controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.rotateSpeed = 0.25;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = true;
    controls.noRotate = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [ 65, 83, 68 ];
    controls.maxDistance = 20;
    controls.minDistance = 1.05;
    controls.addEventListener("change", evt => {
        //console.log(camera.position.z)
        controls.rotateSpeed = Math.min(camera.position.length() - 1, 2);
        controls.zoomSpeed = controls.rotateSpeed;
        //console.log(controls.rotateSpeed);
    });

    //controls.zoomCamera

    let geometry = new THREE.SphereGeometry( 1, 64, 64 );
    let material = new THREE.MeshPhongMaterial( { color: 'white' } );
    material.side = THREE.DoubleSide;
    let cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    //let texture = new THREE.TextureLoader().load( "assets/earthmap.jpg" );
    let texture = new THREE.TextureLoader().load( FILE_PATHS.WORLD_MAP );
    material.map = texture;
    material.color.setScalar( EARTH_BRIGHTNESS );

    camera.position.z = 10;
    camera.zoom = 4;
    camera.updateProjectionMatrix();

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

    loadSkybox( scene );

    if ( SHOW_AXIS ) {
        let axisHelper = new THREE.AxisHelper( 5 );
        scene.add( axisHelper );
    }

    loadTrackball(THREE);
    window['THREE'] = THREE;

    function animate() {
        window.requestAnimationFrame( animate );
        //cube.rotation.x += 0.01;
        //cube.rotation.y += 0.01;

        controls.update();
        planeMgr.update( camera );
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

    let root = document.createElement('div');
    document.body.appendChild(root);
    let sc: SearchComponent2 = null;
    let renderUI = () => {
        let buttonStyle: React.CSSProperties = {
            position: "fixed",
            width: "40px",
            height: "40px",
            right: "10px",
            top: "10px",
            color: "white",
            textAlign: "right",
            verticalAlign: "center",
        };
        let creditStyle: React.CSSProperties = {
            fontSize: '8pt',
            position: "fixed",
            width: "200px",
            height: "20px",
            right: "10px",
            bottom: "10px",
            color: "white",
            opacity: 0.5,
            textAlign: "right",
            verticalAlign: "center",
        };

        const onSelect = (id) => {
            let pos = planeMgr.getPosition(id);
            pos.multiplyScalar(1.1);
            console.log(pos);
            camera.position.set(pos.x, pos.y, pos.z);
            camera.updateProjectionMatrix();
        };

        ReactDOM.render(
            <div>
                <div style={buttonStyle} onClick={()=>sc.show()}><span className="glyphicon glyphicon-search"/></div>
                <div style={creditStyle}>Data courtesy OpenSkyNetwork</div>
                <SearchComponent2 ref={r=>sc=r} data={adata} onSelection={onSelect}/>
            </div>, root);
    }

    fetchAirplaneData().then( data => { 
        adata = data;
        renderUI();
        console.log(["Data loaded", adata]);

        for (let i = 0; i < adata.length; i++) { 
            planeMgr.show( adata, i );
        }
        renderAirplaneData( scene, adata );

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

    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'keypress', evt => {
        switch (evt.key) {
        case '+':
            camera.zoom *= 2;
            camera.updateProjectionMatrix();
            //console.log(camera.zoom);
            break;
        case '-':
            camera.zoom /= 2;
            camera.updateProjectionMatrix();
            break;
        }
    } );
}
window.onload = main;

function onWindowResize( event ) {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function renderAirplaneData( scene: THREE.Scene, adata: AirplaneData ) {
    if (false) {
        let geometry = new THREE.PlaneGeometry( 0.001, 0.001 );
        let tex = new THREE.TextureLoader().load( FILE_PATHS.PLANE_TOP );
        let material = new THREE.MeshBasicMaterial({ 
            map: tex, 
            transparent: true, 
            depthWrite: false,
            //side: THREE.DoubleSide 
        });


        for (let i = 0; i < adata.length; i++) {
            let aplane = adata.airplane(i);
            // var vertex = new THREE.Vector3(1.01, 0, 0);
            // vertex.applyAxisAngle(new THREE.Vector3(0, 0, 1),
            //     THREE.Math.degToRad(aplane.latitude));
            // vertex.applyAxisAngle(new THREE.Vector3(0, 1, 0),
            //     THREE.Math.degToRad(aplane.longitude));
            //vertex.y = aplane.latitude * 10 / 90;
            //vertex.x = aplane.longitude * 10 / 180;
            //vertex.z = 20 * Math.random() - 10;

            let heading = THREE.Math.degToRad(90 - aplane.heading);
            let lat = THREE.Math.degToRad(aplane.latitude);
            let long = THREE.Math.degToRad(aplane.longitude);

            let mesh = new THREE.Mesh( geometry, material );
            mesh.matrixAutoUpdate = false;
            let m = mesh.matrix;
            m.identity();
            m.multiplyMatrices(new THREE.Matrix4().makeRotationY(Math.PI / 2), m);
            m.setPosition(new THREE.Vector3(1.005, 0, 0));
            m.multiplyMatrices(new THREE.Matrix4().makeRotationX(heading), m);
            m.multiplyMatrices(new THREE.Matrix4().makeRotationZ(lat), m);
            m.multiplyMatrices(new THREE.Matrix4().makeRotationY(long), m);
            scene.add( mesh );
        }
    }
    
    if (true) {
        let geometry = new THREE.Geometry();
        //let sprite = new THREE.TextureLoader().load( FILE_PATHS.TEX_DISC );
        let sprite = new THREE.TextureLoader().load( FILE_PATHS.SPARKLE );
        let material = new THREE.PointsMaterial( { 
            size: 20, 
            sizeAttenuation: false,
            map: sprite, 
            //alphaTest: 0.5, 
            transparent: true,
    depthWrite: false,
opacity: 0.3,
blending: THREE.AdditiveBlending } );
        material.color.setHSL( .1, 1, 0.7 );

        for (let i = 0; i < adata.length; i++) {
            let aplane = adata.airplane(i);
            var vertex = new THREE.Vector3(1.007, 0, 0);
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

}

function loadSkybox( scene: THREE.Scene ) {
    var geometry = new THREE.SphereGeometry( 64, 60, 40 );
    geometry.scale( - 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( {
        map: new THREE.TextureLoader().load( FILE_PATHS.SPACE_PAN ),
        //depthTest: false,
        depthWrite: false,
    } );
    let mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );    
}

