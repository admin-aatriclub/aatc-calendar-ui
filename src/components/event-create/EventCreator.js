import React, {Component} from 'react';
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import EventDataLoader from "../event-data-loader/EventDataLoader";
import {emptyEvent} from '../Utils';
import "./EventCreator.css";
import DateTimeRange from "../date-time-range/DateTimeRange";
import {Button} from "react-bootstrap-buttons";
import {callApi} from "../ApiProvider";
import apiConfig from "../apiConfig";
import {createInitialRegistrationForEvent} from "../RegistrationsProvider";

export default class EventCreator extends Component {
    constructor(props) {
        super(props);

        this.state = {
            event: emptyEvent(),
            isEditing: true,
            eventInfo: props.location.state.eventInfo,
            fetch: true
        }
        this.onSubmit = this.onSubmit.bind(this);
        this.onChangeEventLocation = this.onChangeEventLocation.bind(this);
        this.onChangeEventName = this.onChangeEventName.bind(this);
        this.startDateHandler = this.startDateHandler.bind(this);
        this.endDateHandler = this.endDateHandler.bind(this);
    }

    async onSubmit(e) {
        e.preventDefault();

        let theEvent = Object.assign({}, this.state.event);
        theEvent.StartDate = theEvent.StartDate.toISOString();
        theEvent.EndDate = theEvent.EndDate.toISOString();
        let response = await callApi(apiConfig.eventsUrl,'post','/',undefined, theEvent);

        await createInitialRegistrationForEvent(response.data, this.props.location.state.member.id);

        this.setState({event: emptyEvent()});

        this.props.history.push(`/?mid=${this.props.location.state.member.id}`);
    }

    onChangeEventName(e) {
        this.setState({event: {...this.state.event, Name: e.target.value }})
    }

    onChangeEventLocation(e) {
        this.setState({event:{...this.state.event, Location: e.target.value}})
    }

    async componentDidMount() {
        let startDate = null;
        let endDate = null;

        await this.setState({
            eventInfo: this.props.location.state.eventInfo
        })
        if (this.state.eventInfo.date) {  // user clicked on a date to create event.
            startDate = new  Date(new Date(this.state.eventInfo.date).setHours(8,0,0));
            endDate = new  Date(new Date(this.state.eventInfo.date).setHours(20,0,0));
        }

        await this.setState({event: {...this.state.event, StartDate: startDate}});
        await this.setState({event: {...this.state.event, EndDate: endDate}});
        await this.setState({fetch:false});

        let details = Object.assign({}, this.state.event.Details)
         details.Organizer = {
            Id: this.props.location.state.member.id
        }
        this.setState({event: {...this.state.event, Details:details}});
    }

    startDateHandler(date) {
        this.setState({event: {...this.state.event, StartDate: date}});
    }

    endDateHandler(date) {
        this.setState({event: {...this.state.event, EndDate: date}});
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.event.StartDate !== prevState.event.StartDate || this.state.event.EndDate !== prevState.event.EndDate) {
            this.render()
        }
    }

    calendarViewClick() {
        this.props.history.push(`/?mid=${this.props.location.state.member.id}`);
    }

    render() {
        if (this.state.fetch) {
            return <EventDataLoader name={this.props.location.state.name}/>;
        } else {
            return (
                <div className="App">
                     <div className="editor">
                         <form onSubmit={this.onSubmit}>
                             <div className="form-group" style={{'text-align':'center'}}>
                                 <Button xs onClick={() => this.calendarViewClick()}>Calendar View</Button>
                             </div>
                            <div className="form-group">
                                <label>Event Name: </label>
                                <input type="text"
                                        className="form-control"
                                        value={this.state.event.Name}
                                        onChange={this.onChangeEventName}/>
                            </div>
                            <div className="form-group">
                                <DateTimeRange dateLabel="Event Date: "
                                               startLabel="Start Time: "
                                               endLabel="End Time: "
                                               startDate={this.state.event.StartDate}
                                               endDate={this.state.event.EndDate}
                                               onChangeStartDate={this.startDateHandler}
                                               onChangeEndDate={this.endDateHandler}/>
                            </div>
                            <div className="form-group">
                                <label>Event Location: </label>
                                <input type="text"
                                        className="form-control"
                                        value={this.state.event.Location}
                                        onChange={this.onChangeEventLocation}/>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <CKEditor
                                    editor={ ClassicEditor }
                                    data={this.state.event.Details.DescriptionHtml}
                                    onChange={ ( event, editor ) => {
                                        let details = this.state.event.Details;
                                        details.DescriptionHtml = editor.getData();
                                        this.setState({event: {...this.state.event, Details: details}});
                                    } }
                                />
                            </div>

                            <div className="form-group" style={{'text-align':'center'}}>
                                <Button xs btnStyle="primary" type="submit">Create Event</Button>
                            </div>

                        </form>
                    </div>
                    <div className="userName">
                        {this.props.location.state.member.displayName != null ? this.props.location.state.member.displayName : 'Anonymous'}
                    </div>
                </div>
            )
        }
    }
}

