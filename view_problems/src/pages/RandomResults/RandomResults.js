import React, { Component } from 'react';
import { Modal, PageHeader, Card, Descriptions, Row, Col, Checkbox, Tag, Typography, Button, Popconfirm, Input } from 'antd';
import { CaretRightOutlined, PauseOutlined, MinusSquareOutlined } from '@ant-design/icons'
import QueueAnim from 'rc-queue-anim';

const { Text, Title } = Typography

export default class componentName extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            randomProblems: [],
            currentData: {page_url:''},
            solveProblemVisible: false,
            timerState: 'Start',
            timerIcon: <CaretRightOutlined />,
            timeValue: 0, 
            timeStart: 0,
            timeHour: '00',
            timeMinute: '00',
            timeSecond: '00',
            timeCentisecond: '00',
            changeTime: ''
        };
    };

    showModal = (currentData) => {
        /**
         * Shows the modal and set the this.state.currentData to the currentData
         */
        this.setState({ currentData, solveProblemVisible: true })
    }        

    hideModal = () => {
        /**
         * Hides the modal and clears the this.state.currentData
         * then set the timer to 0
         */
        const today = new Date()

        // updates problem id
        fetch(`api/problems/${this.state.currentData['problem_id']}`,  {
            method: 'put',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'completed': true,
                'completion_date': today
            })
        })
        this.setState({ currentData: {page_url:''}, solveProblemVisible: false, timeValue: 0, timeHour: '00', timeMinute: '00', timeSecond: '00', timeCentisecond: '00' })
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
            this.setState({ timerState: 'Stop', timeStart: Date.now() - this.state.timeValue, timerIcon: <PauseOutlined /> })
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
            this.setState({ timerState: 'Start', timerIcon: <CaretRightOutlined /> })
            clearInterval(this.timer); // pause the time by removing the interval
        }
    }

    componentDidMount = () => {
        this.setState({ randomProblems: this.props.location.state.randomProblems })
    }

    render() {
        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']

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
                        const letter_index = letters.map(letter => d['problem_id'].includes(letter)).indexOf(true)
                        return (
                            <Col key={d['problem_id']} span={12}>
                                <Card title={`${letters[letter_index]} - ${d['name']}`}>
                                    <Descriptions>
                                        <Descriptions.Item label="Problem ID">{d['problem_id']}</Descriptions.Item>
                                        <Descriptions.Item label="Number of Times Solved">{d['number_solved']}</Descriptions.Item>
                                        <Descriptions.Item label="Difficulty">{d['difficulty']}</Descriptions.Item>
                                        <Descriptions.Item label="Time Limit">{d['time_limit']}</Descriptions.Item>
                                        <Descriptions.Item label="Memory Limit">{d['memory_limit']}</Descriptions.Item>
                                        <Descriptions.Item label="Completed">
                                            <Popconfirm
                                                title={`Are you sure ${d['completed'] ? 'uncheck' : 'check'} ${d['problem_id']}?`}
                                                onConfirm={() => this.onCheck(d['problem_id'])}
                                                okText="Yes"
                                                cancelText="No"
                                                placement='bottom'
                                            >
                                                <Checkbox checked={d['completed']} />
                                            </Popconfirm>
                                        </Descriptions.Item>
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
                    onOk={this.hideModal}
                    onCancel={this.hideModal}
                    okText="Done"
                    cancelText="Close"
                >
                    <Descriptions>
                        <Descriptions.Item label="Number of Times Solved">{this.state.currentData['number_solved']}</Descriptions.Item>
                        <Descriptions.Item label="Difficulty">{this.state.currentData['difficulty']}</Descriptions.Item>
                        <Descriptions.Item label="Time Limit">{this.state.currentData['time_limit']}</Descriptions.Item>
                        <Descriptions.Item label="Memory Limit">{this.state.currentData['memory_limit']}</Descriptions.Item>
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
                        <Descriptions.Item><Button href={this.state.currentData['page_url'].replace('//problemset', '/problemset')} target='_blank' rel="noopener noreferrer" block>View Page</Button></Descriptions.Item>
                    </Descriptions>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}} >
                        <Title> 
                            { /* set time to its equivalent, then add it to the current time */ }
                            <Input onChange={(e) => this.changeTime('hour', e.target.value)} style={{border: 'none', width: '50px', fontSize: '24px'}} maxLength={2} value={this.state.timeHour} />:
                            <Input onChange={(e) => this.changeTime('minute', e.target.value)} style={{border: 'none', width: '50px', fontSize: '24px'}} maxLength={2} value={this.state.timeMinute} />:
                            <Input onChange={(e) => this.changeTime('second', e.target.value)} style={{border: 'none', width: '50px', fontSize: '24px'}} maxLength={2} value={this.state.timeSecond} />.
                            <Input onChange={(e) => this.changeTime('centisecond', e.target.value)} style={{border: 'none', width: '50px', fontSize: '24px'}} maxLength={2} value={this.state.timeCentisecond} />
                        </Title>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Button onClick={() => this.toggleTimer()} danger={this.state.timerState === 'Stop'}>{this.state.timerIcon}</Button>
                            </Col>
                            <Col span={12}>
                                <Button onClick={() => this.setState({ timeValue: 0, timeHour: '00', timeMinute: '00', timeSecond: '00', timeCentisecond: '00' })}><MinusSquareOutlined /></Button>
                            </Col>
                        </Row>
                    </div>
                </Modal>
            </div>
        );
    }
}
