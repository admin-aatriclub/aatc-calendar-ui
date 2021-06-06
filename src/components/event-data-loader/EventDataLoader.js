import React,{Component} from 'react';
import Loader from 'react-loader-spinner';

export default class EventDataLoader extends Component {
    render() {
        return (
            <div className='loader'>
                <h1>{this.props.name}</h1>
                <h2>Loading</h2>
                <Loader type="ThreeDots" color="#2BAD60" height="100" width="100"/>
            </div>);
    }
}