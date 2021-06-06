import React, {Component} from 'react';
import DatePicker from 'react-datepicker';
import {registerLocale, setDefaultLocale} from "react-datepicker";
import "./DateTimeRange.css";
import enGB from "date-fns/locale/en-GB";

registerLocale("en-GB", enGB);

setDefaultLocale("en-GB")

export default class DateTimeRange extends Component {
    constructor(props) {
        super(props);

        this.state = {
            startDate: this.props.startDate != null ? new Date(this.props.startDate) : null,
            endDate: this.props.endDate != null ? new Date(this.props.endDate) : null,
            maxDate: this.props.endDate ? new Date(new Date(this.props.endDate).setHours(23, 59, 59)) : null,
            minDate: this.props.startDate ? new Date(new Date(this.props.startDate).setHours(0, 0, 0)) : null,
        }
        this.onChangeStartDate = this.onChangeStartDate.bind(this);
        this.onChangeStartTime = this.onChangeStartTime.bind(this);
        this.onChangeEndTime = this.onChangeEndTime.bind(this);
    }

    async onChangeStartDate(date) {
        let newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
        if (this.props.endDate === null) {
            let myEndDate = new Date(newDate.getTime());
            await this.setState({endDate: new Date(myEndDate.setHours(23, 59, 59, 0))});
        }
        await this.setState({
            startDate: newDate,
            endDate: new Date(this.state.endDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())),
            minDate: new Date(date.setHours(0, 0, 0, 0)),
            maxDate: new Date(date.setHours(23, 59, 59, 0)),
        });
        this.props.onChangeStartDate(this.state.startDate);
        this.props.onChangeEndDate(this.state.endDate);
    }

    async onChangeStartTime(date) {
        if (this.state.endDate < this.state.startDate) {
            await this.setState({
                startDate: date,
                endDate: date
            })
        } else {
            await this.setState({startDate: date});
        }
        this.props.onChangeStartDate(this.state.startDate);
        this.props.onChangeEndDate(this.state.endDate);
    }

    onChangeEndTime(date) {
        this.setState({endDate: date})
        this.props.onChangeEndDate(date);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.startDate !== prevState.startDate || this.state.endDate !== prevState.endDate) {
            this.render();
        }
    }

    render() {
        return (
            <div className="dateTimeRangeSelector">
                <div className="dateTimeRangeSelector-date">
                    <label>{this.props.dateLabel}</label>
                    <DatePicker
                        selected={this.props.startDate}
                        placeholderText="Click to select a date"
                        onChange={date => this.onChangeStartDate(date)}
                    />
                </div>
                {this.props.startDate != null ?
                        <div className="dateTimeRangeSelector-start">
                            <label>{this.props.startLabel}</label>
                            <DatePicker
                                selected={this.props.startDate}
                                onChange={date => this.onChangeStartTime(date)}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={15}
                                minTime={this.state.minDate}
                                maxTime={this.state.endDate}
                                timeCaption="Start Time"
                                dateFormat="h:mm aa"
                            />
                        </div> : <div /> }
                {this.props.startDate != null ?
                        <div className="dateTimeRangeSelector-end">
                            <label>{this.props.endLabel}</label>
                            <DatePicker
                                selected={this.props.endDate}
                                onChange={date => this.onChangeEndTime(date)}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={15}
                                minTime={this.state.startDate}
                                maxTime={this.state.maxDate}
                                timeCaption="End Time"
                                dateFormat="h:mm aa"
                            />

                        </div>
                    : <div/>}
            </div>
        )
    }
}
