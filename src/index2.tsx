require('bootstrap/dist/css/bootstrap.css');
require('bootstrap/dist/css/bootstrap-theme.css');
require('jquery');
require('bootstrap');
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { fetchLocalAirplaneData, AirplaneData, Airplane } from './flightapi';
import SearchComponent2 from './SearchComponent';

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

class SearchComponent extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            query: "",
        };
    }

    setQuery(text) {
        this.setState({ query: text });
    }

    static renderResult(props: any) {
        let entry: Airplane = props.entry;
        return <p>{`${entry.icao24} ${entry.originCountry} ${entry.callSign}`}</p>;
    }

    static renderResults(props: any) {
        const Result = SearchComponent.renderResult;
        let results = searchAirplaneData(props.data, props.query);
        return (
            <div>
                <div>
                    {`${results.length} entries`}
                </div>
                <div>
                {
                    results.map(r => <Result key={r.id} entry={r.data} />)
                }    
                </div>            
            </div>
        );
    }

    render() {
        const adata = this.props.data;
        const hasData = Boolean(adata);
        const onTextChanged = (evt) => this.setQuery(evt.target.value);
        const Results = SearchComponent.renderResults;
        return (
            <div>
                <div>
                    <input type="text" 
                    value={this.state.query} 
                    onChange={onTextChanged} 
                    disabled={!hasData} />
                </div>
                {hasData && <Results data={adata} query={this.state.query} />
                }
            </div>
        );
    }
}

class App extends React.Component<any, any> {
    private searchComp: SearchComponent2 = null;

    constructor(props: any) {
        super(props);
        this.state = {
            searchVisible: false
        };
    }

    render() {
        const showSearch = () => { this.searchComp.show(); };
        return (
            <div className="container">
                <h1>Hello World</h1>
                <h2>You too</h2>
                <h3>Wow</h3>
                <button className="btn btn-default" onClick={showSearch}>Search</button>
                <SearchComponent2 ref={r=>this.searchComp=r} />
            </div>
        );
    }
}

async function main() {
    let root = document.getElementById('root');
    // ReactDOM.render( <SearchComponent />, root );
    // let data = await fetchLocalAirplaneData();
    // ReactDOM.render( <SearchComponent data={data} />, root );
    ReactDOM.render( <App />, root );

}
window.onload = main;
