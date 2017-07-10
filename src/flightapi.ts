// 0	icao24	string	Unique ICAO 24-bit address of the transponder in hex string representation.
// 1	callsign	string	Callsign of the vehicle (8 chars). Can be null if no callsign has been received.
// 2	origin_country	string	Country name inferred from the ICAO 24-bit address.
// 3	time_position	float	Unix timestamp (seconds) for the last position update. Can be null if no position report was received by OpenSky within the past 15s.
// 4	time_velocity	float	Unix timestamp (seconds) for the last velocity update. Can be null if no velocity report was received by OpenSky within the past 15s.
// 5	longitude	float	WGS-84 longitude in decimal degrees. Can be null.
// 6	latitude	float	WGS-84 latitude in decimal degrees. Can be null.
// 7	altitude	float	Barometric or geometric altitude in meters. Can be null.
// 8	on_ground	boolean	Boolean value which indicates if the position was retrieved from a surface position report.
// 9	velocity	float	Velocity over ground in m/s. Can be null.
// 10	heading	float	Heading in decimal degrees clockwise from north (i.e. north=0°). Can be null.
// 11	vertical_rate	float	Vertical rate in m/s. A positive value indicates that the airplane is climbing, a negative value indicates that it descends. Can be null.
// 12	sensors	int[]	IDs of the receivers which contributed to this state vector. Is null if no filtering for sensor was used in the request.

import * as $ from 'jquery';

export class Airplane {
    private _data: any = null;

    public constructor(jsdata: any) {
        this._data = jsdata;
    }

    public get icao24(): string { return this._data[0]; }
    public get callSign(): string { return this._data[1]; }
    public get originCountry(): string { return this._data[2]; }
    public get longitude(): number { return this._data[5]; }
    public get latitude(): number { return this._data[6]; }
    public get altitude(): number { return this._data[7]; }
    public get onGround(): boolean { return this._data[8]; }
    public get velocity(): number { return this._data[9]; }
    public get heading(): number { return this._data[10]; }
}

export class AirplaneData {
    private _jsdata: any = null;

    public constructor(jsdata: any) {
        this._jsdata = jsdata;
    }

    public get time(): number {
        return this._jsdata.time;
    }

    public get length(): number {
        return this._jsdata.states.length;
    }

    public airplane(index: number): Airplane {
        return new Airplane(this._jsdata.states[index]);
    }

    public get json(): any { return this._jsdata; }
}

export async function fetchAirplaneData() {
    return new Promise<AirplaneData>(function (resolve, reject) {
        $.getJSON("https://opensky-network.org/api/states/all", data => {
            resolve(new AirplaneData(data));
        });
    });
}

export async function fetchLocalAirplaneData() {
    return new Promise<AirplaneData>(function (resolve, reject) {
        $.getJSON("assets/sample-flight-data.json", data => {
            resolve(new AirplaneData(data));
        });
    });
}
