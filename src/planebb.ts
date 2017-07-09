import * as THREE from 'three';
import { FILE_PATHS, PLANE_SCALE, REAL_WINGSPAN, METER_TO_UNIT } from './consts';
import { AirplaneData, Airplane } from './flightapi';

const PLANE_SIZE = REAL_WINGSPAN * METER_TO_UNIT * PLANE_SCALE;

class Plane {
    mesh: THREE.Mesh = null;
    data: Airplane = null;
}

export class PlaneManager {
    private _scene: THREE.Scene = null;
    private _geometry: THREE.Geometry = null;
    private _material: THREE.Material = null;
    private _startTime: number = 0;
    private _lastTime: number = 0;
    private _planes = new Map<number, Plane>();

    constructor(scene: THREE.Scene) {
        this._scene = scene;
        this._geometry = new THREE.PlaneGeometry( PLANE_SIZE, PLANE_SIZE );
        let tex = new THREE.TextureLoader().load( FILE_PATHS.PLANE_TOP );
        this._material = new THREE.MeshBasicMaterial({ 
            map: tex, 
            transparent: true, 
            depthWrite: false,
        });
    }

    show(adata: AirplaneData, index: number) {
        let aplane = adata.airplane( index );
        // var vertex = new THREE.Vector3(1.01, 0, 0);
        // vertex.applyAxisAngle(new THREE.Vector3(0, 0, 1),
        //     THREE.Math.degToRad(aplane.latitude));
        // vertex.applyAxisAngle(new THREE.Vector3(0, 1, 0),
        //     THREE.Math.degToRad(aplane.longitude));
        //vertex.y = aplane.latitude * 10 / 90;
        //vertex.x = aplane.longitude * 10 / 180;
        //vertex.z = 20 * Math.random() - 10;

        let localPlane = new Plane();
        let heading = THREE.Math.degToRad(90 - aplane.heading);
        let lat = THREE.Math.degToRad(aplane.latitude);
        let long = THREE.Math.degToRad(aplane.longitude);

        let mesh = new THREE.Mesh( this._geometry, this._material );
        mesh.matrixAutoUpdate = false;
        let m = mesh.matrix;
        m.identity();
        m.multiplyMatrices(new THREE.Matrix4().makeRotationY(Math.PI / 2), m);
        m.setPosition(new THREE.Vector3(1.005, 0, 0));
        m.multiplyMatrices(new THREE.Matrix4().makeRotationX(heading), m);
        m.multiplyMatrices(new THREE.Matrix4().makeRotationZ(lat), m);
        m.multiplyMatrices(new THREE.Matrix4().makeRotationY(long), m);
        this._scene.add( mesh );

        localPlane.mesh = mesh;
        localPlane.data = aplane;
        this._planes.set(index, localPlane);
    }

    hide(index: number) {

    }

    private _oldMatrix: THREE.Matrix4 = null;
    update(camera: THREE.PerspectiveCamera) {
        // console.log({
        //     "position": camera.position,
        //     "zoom": camera.zoom,
        //    "projection": camera.modelViewMatrix
        // });

        let mcam = camera.matrixWorldInverse.clone();
        mcam.premultiply(camera.projectionMatrix);

        let v = new THREE.Vector3(1, 0, 0);
        v.applyMatrix4(mcam);
        //console.log(`x: ${v.x}, y: ${v.y}, z: ${v.z}`);

        let clock = window.performance.now();

        if (this._startTime == 0) {
            this._startTime = clock;
            this._lastTime = 0;
        }

        let t = clock - this._startTime;
        let dt = t - this._lastTime;
        this._lastTime = t;

        //console.log(t);

        const CIRCUMFERENCE_OF_EARTH = 40.075 * 1000000; // meters

        let updateVisibility = () => {
            if (this._oldMatrix == null || !this._oldMatrix.equals(mcam)) {
                let countVisible = 0;
                for (let [id, {mesh:mesh, data:plane}] of Array.from(this._planes.entries())) {
                    let m = mesh.matrix;
                    let pos = new THREE.Vector3(m.elements[12], m.elements[13], m.elements[14]);
                    pos.applyMatrix4(mcam);
                    if (pos.x < -1 || pos.x > 1 || pos.y < -1 || pos.y > 1 || !(pos.z > 0.5 && pos.z < 0.9))
                        mesh.visible = false;
                    else {
                        mesh.visible = true;
                        countVisible++;
                    }
                }
                console.log(`Planes visible ${countVisible}`);
                this._oldMatrix = mcam;
            }
        }

        let updatePositions = () => {
            for (let [id, {mesh:mesh, data:plane}] of Array.from(this._planes.entries())) {
                if (!mesh.visible) continue;
                let vel = 2 * Math.PI * plane.velocity / CIRCUMFERENCE_OF_EARTH; // radians per second
                vel /= 1000;

                let m = mesh.matrix;
                let xaxis = new THREE.Vector3();
                let yaxis = new THREE.Vector3();
                let zaxis = new THREE.Vector3();
                m.extractBasis( xaxis, yaxis, zaxis );
                m.multiplyMatrices( 
                    new THREE.Matrix4().makeRotationAxis(yaxis, vel * dt), m );
            }
        };

        updateVisibility();
        updatePositions();
    }
}
