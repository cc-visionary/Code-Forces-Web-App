import React, { Component } from 'react';
import { Modal, PageHeader, Card, Descriptions, Row, Col, Checkbox, Tag, Typography, Button, Popconfirm, Input, DatePicker, TimePicker, message } from 'antd';
import moment from 'moment'
import { UilPlay, UilPause, UilBan } from '@iconscout/react-unicons';
import QueueAnim from 'rc-queue-anim';

const { Title } = Typography

export default class componentName extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            randomProblems: [],
            currentData: {page_url:'', tags:''},
            solveProblemVisible: false,
            timerState: 'Start',
            timerIcon: <UilPlay size="20" />,
            timeValue: 0, 
            timeStart: 0,
            timeHour: '00',
            timeMinute: '00',
            timeSecond: '00',
            timeCentisecond: '00'
        };
    };

    showModal = (currentData) => {
        /**
         * Shows the modal and set the this.state.currentData to the currentData
         */
        this.setState({ currentData, solveProblemVisible: true })
    }        

    hideModal = (code) => {
        /**
         * Hides the modal and clears the this.state.currentData
         * then set the timer to 0
         */
        const today = new Date()
        if(code === 'proceed') {
            if(this.state.timeValue !== 0) {
                message.success(`Completed ${this.state.currentData['problem_id']}!!!`)
                // updates problem id's completed value
                fetch(`api/problems/${this.state.currentData['problem_id']}`,  {
                    method: 'put',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'completed': true,
                        'completion_date': today,
                        'completion_time': `${this.state.timeHour}:${this.state.timeMinute}:${this.state.timeSecond}`
                    })
                }).then(() => { // set the values to the current for the state
                    var randomProblems = this.state.randomProblems
                    var index = 0
                    for(let i = 0; i < randomProblems.length; i++) {
                        if(randomProblems[i]['problem_id'] === this.state.currentData['problem_id']) {
                            index = i;
                            break;
                        }
                    }
                    randomProblems[index]['completed'] = true
                    randomProblems[index]['completion_date'] = today
                    randomProblems[index]['completion_time'] = `${this.state.timeHour}:${this.state.timeMinute}:${this.state.timeSecond}`
                    this.setState({ randomProblems })
                }).then(() => {
                    this.setState({ currentData: {page_url:'', tags:''}, solveProblemVisible: false, timeValue: 0, timeHour: '00', timeMinute: '00', timeSecond: '00', timeCentisecond: '00' })
                })
            } else {
                message.error('TimeValue == 0 is invalid');
            }
        } else this.setState({ currentData: {page_url:'', tags:''}, solveProblemVisible: false, timeValue: 0, timeHour: '00', timeMinute: '00', timeSecond: '00', timeCentisecond: '00' })
    }

    onCheck = (problem_id) => {
        /**
         * Handles the checks, update the this.state.randomProblems then update the table
         */
        var index = 0;
        var problems = this.state.randomProblems
        for(let i = 0; i < problems.length; i++) {
            if(problems[i]['problem_id'] === problem_id) {
                index = i;
                break;
            }
        }
        problems[index]['completed'] = !problems[index]['completed']
        this.setState({ randomProblems: problems })
    }

    changeTime = (type, value) => {
        /**
         * Handles changing the time (4 inputs) then aims to let the timeValue be persistent (not change)
         */
        const { timeHour, timeMinute, timeSecond, timeCentisecond } = this.state
        var hour = timeHour
        var minute = timeMinute
        var second = timeSecond
        var centisecond = timeCentisecond
        switch(type) {
            case 'hour':
                hour = value
                this.setState({ timeHour: value })
                break;
            case 'minute':
                minute = value
                this.setState({ timeMinute: value })
                break;
            case 'second':
                second = value
                this.setState({ timeSecond: value })
                break;
            case 'centisecond':
                centisecond = value
                this.setState({ timeCentisecond: value })
                break;
            default:
                break;
        }
        
        this.setState({ 
            timeValue: parseInt(hour) * 3600000 + parseInt(minute) * 60000 + parseInt(second) * 1000 + parseInt(centisecond) * 10
        })
    }

    toggleTimer = () => {
        /**
         * Toggles the timer to start and stop
         */
        if(this.state.timerState === 'Start') {
            this.setState({ timerState: 'Stop', timeStart: Date.now() - this.state.timeValue, timerIcon: <UilPause size="20" /> })
            this.timer = setInterval(() => {
                const timeValue = Date.now() - this.state.timeStart
                this.setState({ 
                    timeValue, 
                    timeHour: ("0" + Math.floor(timeValue / 3600000)).slice(-2), 
                    timeMinute:("0" + (Math.floor(timeValue / 60000) % 60)).slice(-2) , 
                    timeSecond: ("0" + (Math.floor(timeValue / 1000) % 60)).slice(-2), 
                    timeCentisecond:("0" + (Math.floor(timeValue / 10) % 100)).slice(-2) 
                });
            }, Math.floor((Math.random() * 100))); // random interval from 0-100
        } else {
            this.setState({ timerState: 'Start', timerIcon: <UilPlay size="20" /> })
            clearInterval(this.timer); // pause the time by removing the interval
        }
    }

    componentDidMount = () => {
        this.setState({ randomProblems: this.props.location.state.randomProblems })
    }

    render() {
        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
        
        return (
            <div> 
                <PageHeader
                    style={{border: '1px solid rgb(235, 237, 240)'}}
                    onBack={() => window.history.back()}
                    title='Random Problems'
                    subTitle={`(${this.state.randomProblems.length})`}
                />
                <QueueAnim style={{margin: 16}} component={Row} gutter={[16, 16]} delay={300} interval={150}>
                    { this.state.randomProblems.map(d => {
                        const letter = letters.filter(letter => d['problem_id'].includes(letter))[0]
                        return (
                            <Col key={d['problem_id']} span={12}>
                                <Card title={`${letter} - ${d['name']}`}>
                                    <Descriptions>
                                        <Descriptions.Item label="Problem ID">{d['problem_id']}</Descriptions.Item>
                                        <Descriptions.Item label="Number of Times Solved">{d['number_solved']}</Descriptions.Item>
                                        <Descriptions.Item label="Difficulty">{d['difficulty']}</Descriptions.Item>
                                        <Descriptions.Item label="Time Limit">{d['time_limit']}</Descriptions.Item>
                                        <Descriptions.Item span={2} label="Memory Limit">{d['memory_limit']}</Descriptions.Item>
                                        <Descriptions.Item label="Completion Date"><DatePicker value={moment(`${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`, 'YYYY-MM-DD')} disabled/></Descriptions.Item>
                                        <Descriptions.Item label="Completion Time"><TimePicker value={moment(d['completion_time'], 'HH-mm-ss')} disabled /></Descriptions.Item>
                                        <Descriptions.Item label="Completed"><Checkbox checked={d['completed']} disabled /></Descriptions.Item>
                                        <Descriptions.Item span={3} label="Tags">{d['tags'].split('|').map(tag => <Tag>{tag.toUpperCase()}</Tag>)}</Descriptions.Item>
                                    </Descriptions>
                                    <Row gutter={16}>
                                        <Col span={18}>
                                        </Col>
                                        <Col span={3}>
                                            <Button onClick={() => this.showModal(d)} disabled={d['completed']} block>Solve</Button>
                                        </Col>
                                        <Col span={3}>
                                            <Button href={d['page_url'].replace('//problemset', '/problemset')} target='_blank' rel="noopener noreferrer" block>View Page</Button>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        )
                    })}
                </QueueAnim>
                <Modal
                    width={1080}
                    title={`Solved ${this.state.currentData['name']} (${this.state.currentData['problem_id']})`}
                    visible={this.state.solveProblemVisible}
                    onCancel={() => this.hideModal('cancel')}
                    okText="Done"
                    footer={[
                        <Button key="back" onClick={() => this.hideModal('cancel')}>Cancel</Button>,
                        <Popconfirm
                            title='Are you sure you wish to proceed?'
                            onConfirm={() => this.hideModal('proceed')}
                            okText="Yes"
                            cancelText="No"
                            placement='bottom'
                        >
                            <Button>Done</Button>
                        </Popconfirm>
                    ]}
                    cancelText="Close"
                >
                    <Descriptions>
                        <Descriptions.Item label="Number of Times Solved">{this.state.currentData['number_solved']}</Descriptions.Item>
                        <Descriptions.Item label="Difficulty">{this.state.currentData['difficulty']}</Descriptions.Item>
                        <Descriptions.Item label="Time Limit">{this.state.currentData['time_limit']}</Descriptions.Item>
                        <Descriptions.Item label="Memory Limit">{this.state.currentData['memory_limit']}</Descriptions.Item>
                        <Descriptions.Item label='Completion Date'><DatePicker value={moment(`${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`, 'YYYY-MM-DD')} disabled/></Descriptions.Item>
                        <Descriptions.Item label="Completed">
                            <Popconfirm
                                title={`Are you sure ${this.state.currentData['completed'] ? 'uncheck' : 'check'} ${this.state.currentData['problem_id']}?`}
                                onConfirm={() => this.onCheck(this.state.currentData['problem_id'])}
                                okText="Yes"
                                cancelText="No"
                                placement='bottom'
                            >
                                <Checkbox checked={this.state.currentData['completed']} />
                            </Popconfirm>
                        </Descriptions.Item>
                        <Descriptions.Item span={3} label='Link' ><a href={this.state.currentData['page_url'].replace('//problemset', '/problemset')} target='_blank' rel="noopener noreferrer" >{this.state.currentData['page_url'].replace('//problemset', '/problemset')}</a></Descriptions.Item>
                        <Descriptions.Item span={3} label="Tags">{this.state.currentData['tags'].split('|').map(tag => <Tag>{tag.toUpperCase()}</Tag>)}</Descriptions.Item>
                    </Descriptions>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}} >
                        <Title> 
                            { /* set time to its equivalent, then add it to the current time */ }
                            <Input onChange={(e) => this.changeTime('hour', e.target.value)} style={{border: 'none', width: '50px', fontSize: '24px'}} maxLength={2} value={this.state.timeHour} />:
                            <Input onChange={(e) => this.changeTime('minute', e.target.value)} style={{border: 'none', width: '50px', fontSize: '24px'}} maxLength={2} value={this.state.timeMinute} />:
                            <Input onChange={(e) => this.changeTime('second', e.target.value)} style={{border: 'none', width: '50px', fontSize: '24px'}} maxLength={2} value={this.state.timeSecond} />.
                            <Input onChange={(e) => this.changeTime('centisecond', e.target.value)} style={{border: 'none', width: '50px', fontSize: '24px'}} maxLength={2} value={this.state.timeCentisecond} />
                        </Title>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Button onClick={() => this.toggleTimer()} danger={this.state.timerState === 'Stop'}>{this.state.timerIcon}</Button>
                            </Col>
                            <Col span={12}>
                                <Button onClick={() => this.setState({ timeValue: 0, timeHour: '00', timeMinute: '00', timeSecond: '00', timeCentisecond: '00' })}><UilBan size="20" /></Button>
                            </Col>
                        </Row>
                    </div>
                </Modal>
            </div>
        );
    }
}
