import * as React from 'react';
import './EventCalendar.css';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listMonthPlugin from '@fullcalendar/list';
import bootstrapPlugin from "@fullcalendar/bootstrap";
import EventDataLoader from "../event-data-loader/EventDataLoader";
import apiConfig from '../apiConfig';
import queryString from 'query-string';
import { getContact } from "../ContactProvider";
import {Button} from "react-bootstrap-buttons";
import {memberEventTag,buildRedirect} from "../Utils";
import {callApi} from "../ApiProvider";

export default class EventCalendar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fetch: true,
        }
    }

    async componentDidMount() {
        let prev;
        const queryStringValues = queryString.parse(this.props.location.search);
        if ( queryStringValues.mid && queryStringValues.mid !== "0") {
            let contact = await getContact(queryStringValues.mid);
            this.props.onMemberChange(contact);
            this.setState({isLoggedInUser:true})
        }

        prev = queryStringValues.prev;

        if (prev === 'Display') {
            await this.setState({fetch:false});
        } else {
            try {
                this.setState({events: await this.getEvents()})
            } catch (e) {
                console.log("ERROR*****", e);
            }
        }
    }

    handleEventClick = (arg) => {
        // at the point of the click to come here,  it is fullcalendar that owns the event and is using the background color.  :-(
        if (! (this.props.member.id === 0 && arg.event.backgroundColor === 'green')) {
            this.setState({
                showEvent: true,
                eventInfo: {
                    eventId: arg.event.id,
                    parentId: arg.event.extendedProps.parentId,
                } });
        } else {
            alert("You must be a logged in member to view this event.");
        }
    }

    handleDateClick = (e) => {
        // this.setState({editEvent: this.state.isLoggedInUser, eventInfo: e});
        this.setState({
            createEvent: this.state.isLoggedInUser,
            eventInfo: {
                date: e.date
            }});
    }

    createEvent = () => {
        this.setState({
            createEvent: this.state.isLoggedInUser,
            eventInfo: {
                date: Date.now()
            }
        });
    }


    render() {
        if (this.state.showEvent) {
            return buildRedirect('/showEvent', this.props.member, this.state.eventInfo);
        }
        if (this.state.createEvent) {
            return buildRedirect('/createEvent', this.props.member, this.state.eventInfo);
        }

        if (this.state.fetch) {
            // console.log('showing loader');
            return (<EventDataLoader name="Event Calendar"/>);
        } else {
            return (
                <div className='demo-app'>
                    <div className='demo-app-main'>
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin, listMonthPlugin, bootstrapPlugin]}
                            themeSystem='bootstrap'
                            headerToolbar={{
                                left: 'prev today next',
                                center: 'title',
                                right: 'dayGridMonth,listMonth'
                            }}
                            initialView='dayGridMonth'
                            displayEventTime={true}
                            firstDay={1}
                            fixedWeekCount={false}
                            height='auto'
                            editable={true}
                            selectable={true}
                            selectMirror={true}
                            dayMaxEvents={true}
                            weekends={true}
                            events={this.props.events}
                            // initialEvents={INITIAL_EVENTS} // alternatively, use the `events` setting to fetch from a feed
                            select={this.handleDateSelect}
                            // eventContent={renderEventContent} // custom render function
                            eventClick={this.handleEventClick}
                            eventsSet={this.handleEvents} // called after events are initialized/added/changed/removed
                            dateClick={this.handleDateClick}
                            /* you can update a remote database when these fire:
                            eventAdd={function(){}}
                            eventChange={function(){}}
                            eventRemove={function(){}}
                            */
                        />
                        {this.state.isLoggedInUser ? <Button xs onClick={this.createEvent}>Create Event</Button> :
                            <div></div>}

                        <div style={{textAlign: 'left',fontSize: '11px',columnCount: 5, border: '1px solid black'}}>
                            <div>Legend</div>
                            <div><div className="fc-daygrid-event-dot" style={{borderColor: 'orange', float: 'left'}}/> Workout</div>
                            <div><div className="fc-daygrid-event-dot" style={{borderColor: 'blue', float: 'left'}}/> Education</div>
                            <div><div className="fc-daygrid-event-dot" style={{borderColor: 'green', float: 'left'}}/> Member Event</div>
                            <div><div className="fc-daygrid-event-dot" style={{borderColor: 'red', float: 'left'}}/> Race</div>
                        </div>
                        <div className="userName">
                            {this.props.member.displayName != null ? this.props.member.displayName : 'Anonymous'}
                        </div>
                    </div>
                </div>
            )
        }
    }

    firstDateEventsToRetrieve = () => {
        let firstDate = new Date();
        firstDate.setFullYear(firstDate.getFullYear() - 1);
        firstDate.setMonth(firstDate.getMonth() - 6);

        return firstDate.toISOString()
    }

    handleEvents = (events) => {
        this.setState({
            currentEvents: events
        })
    }

    getEvents = async () => {
        const resp = await callApi(apiConfig.eventsUrl, 'get', '/', {StartDate: this.firstDateEventsToRetrieve()}, undefined);
        let myEvents = resp.data
            .filter(evnt => this.shouldShowEvent(evnt))
            .map(this.convertEventType);
        this.props.onEventChange(myEvents);
        this.setState({fetch:false});
    }

    shouldShowEvent = (evnt) => {
        if( !this.props.member.isAdmin && evnt.AccessLevel==='AdminOnly' ) {
            return false;
        }
        return true;
    }

    convertEventType = (orig) => {
        let p = {
            id: orig.Id.toString(),
            title: orig.Name,
            start: orig.StartDate,
            end: orig.EndDate,
            parentId: orig.parentId,
            backgroundColor: this.getEventColor(orig),
        }
        return p;
    }

    getEventColor = (event) => {
        let eventColor;
        if (/Race/.test(event.Name) || (event.Tags && event.Tags.indexOf('race') > -1)) {
            eventColor = 'red'
        } else if (event.Tags && event.Tags.indexOf(memberEventTag()) > -1) {
            eventColor = 'green'
        } else if (event.parentId || (event.Tags && event.Tags.indexOf('workouts') > -1)) {
            eventColor = 'orange'
        } else {
            eventColor = 'blue'
        }
        // console.log('EVENT TAGS', event.Tags, eventColor );
        return eventColor;
    }
}

