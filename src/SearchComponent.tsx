import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import { AirplaneData, Airplane } from './flightapi';

function searchAirplaneData(adata: AirplaneData, query: string) {
    query = query.toLowerCase();

    let textMatch = (txt: string) => {
        return txt.toLowerCase().indexOf(query) !== -1;
    };

    let matches = (a: Airplane) => {
        return textMatch(a.icao24) || textMatch(a.callSign) ||
            textMatch(a.originCountry);
    };

    let result = [];
    for (let i = 0; i < adata.length; i++) {
        let entry = adata.airplane(i);
        if (matches(entry)) {
            result.push({
                id: i,
                data: entry,
            });
            //if (result.length > 10) break;
        }
    }
    return result;
}

namespace SearchComponent {
    export interface Props {
        data?: AirplaneData,
        onSelection?: (evt:any)=>void,
    }

    export interface State {
        visible: boolean;
        results: Array<{id:number, data:Airplane}>;
    }
}

class SearchComponent extends React.Component<SearchComponent.Props, SearchComponent.State> {
    private searchBox: HTMLInputElement = null;
    constructor(props: SearchComponent.Props) {
        super(props);
        this.state = { visible: false, results: null };
    }

    show(visible: boolean = true) {
        this.setState({ visible: visible });
    }

    doSearch(query: string) {
        let results;
        if (query.trim() === "")
            results = null;
        else
            results = searchAirplaneData(this.props.data, query);
        this.setState({
            results: results
        });
        console.log(results.length);
    }

    render() {
        const hide = () => this.show(false);
        const onSelect = (id) => { 
            this.props.onSelection && this.props.onSelection(id);
            this.show(false);
        };
        const getResults = (): Array<{id:number, data:Airplane}> => {
            if (this.state.results) return this.state.results;
            if (!this.props.data) return [];
            return _.range(this.props.data.length).map(i=>{return{id:i,data:this.props.data.airplane(i)}});
        };

        return (
            <div className={`panel panel-default panel-primary`} style={{position:"fixed", display:this.state.visible?"flex":"none", flexDirection: "column", top: 5, bottom: 5, margin:0, left: 5, right: 5}}>
                <div className="panel-heading">Flights
                        <button type="button" className="close" onClick={hide}> <span aria-hidden="true">&times;</span><span className="sr-only">Close</span></button>
                    </div>
                <div className="panel-body" style={{display:"inline-flex", flexDirection:"column", padding: 5, flexGrow: 1}}>
                    <p>
                        <form action="#" onSubmit={()=>{this.doSearch(this.searchBox.value); return false; }}>
                    <div className="input-group">
                        <input ref={r=>this.searchBox=r} type="text" className="form-control" placeholder="Search" />
                        <div className="input-group-addon"><span className="glyphicon glyphicon-search"></span></div>
                    </div>
                    </form>
                    </p>
                    <p></p>
                    <p className="well" style={{flexGrow:1, overflow: "auto", padding:2, marginBottom:0}}>
                    { 
                        <div className="list-group" style={{marginBottom:0}}>
                            {getResults().slice(0,100).map(entry =>
                                <a href="#" onClick={()=>onSelect(entry.id)} className="list-group-item">
                                    <div style={{display:"flex", flexDirection:"row"}}>
                                    <div style={{fontSize: '110%', fontWeight: 'bold', flex:"0 0 80px"}}>{`${entry.data.callSign}`}</div>
                                    <div style={{flexGrow:1}}>{`${entry.data.originCountry}`}</div>
                                    <div style={{color:'gray', flex:"0 0 80px"}}>{`${entry.data.icao24}`}</div>
                                    <div className="glyphicon glyphicon-chevron-right pull-right" />
                                    </div>
                                </a>)
                            }
                        </div>
                    }
                    </p>
                    {/*<nav aria-label="Page navigation" className="text-center">
                        <ul className="pagination" style={{marginTop:0, marginBottom:0}}>
                            <li>
                            <a href="#" aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                            </li>
                            <li className="active"><a href="#">1</a></li>
                            <li><a href="#">2</a></li>
                            <li><a href="#">3</a></li>
                            <li><a href="#">4</a></li>
                            <li><a href="#">5</a></li>
                            <li>
                            <a href="#" aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                            </a>
                            </li>
                        </ul>
                    </nav>*/}
                </div>
            </div>
        );
    }
}

export default SearchComponent;

// function main() {
//     let root = document.createElement("div");
//     document.body.appendChild(root);
//     ReactDOM.render(<App/>, root);
// }
// window.onload = main;