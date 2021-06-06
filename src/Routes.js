import React, {Component} from "react";
import { Route, Switch } from "react-router-dom";
import NotFound from "./containers/NotFound";
import EventCalendar from "./components/event-calendar/EventCalendar";
import EventDisplay from "./components/event-display/EventDisplay";
import EventCreator from "./components/event-create/EventCreator";
import EventEditor from "./components/event-edit/EventEditor";

export default class Routes extends Component {
    constructor(props) {
        super(props);
        localStorage.clear();
        this.state = {
            member: {id: 0, isAdmin: false},
            events: []
        }
        console.log("IN ROUTES")
    }

    handleEventsChange = (events) => {
        this.setState({events: events})
    }

    updateMember = (member) => {
        if (member != null) {
            this.setState({member: member});
        }
    }
    //
    // updateToken = (token) => {
    //     // console.log("Updating Token -> ", token)
    //     this.setState( {token: {timestamp: Date.now(), waToken: token}})
    // }

    render() {
        return (
            <Switch>
                <Route exact path="/" render={props => <EventCalendar  {...props}
                                                                       onEventChange={this.handleEventsChange}
                                                                       events={this.state.events}
                                                                       onMemberChange={this.updateMember}
                                                                       member={this.state.member}
                />}/>
                <Route exact path="/showEvent" component={EventDisplay}/>
                <Route exact path="/createEvent" component={EventCreator} />
                <Route exact path="/editEvent" component={EventEditor} />
                <Route>
                    <NotFound />
                </Route>
            </Switch>
        );
    }
}
