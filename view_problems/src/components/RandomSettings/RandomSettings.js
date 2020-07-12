import React, { Component } from 'react';
import moment from 'moment';
import { Drawer, Form, Select, Col, Row, DatePicker, Button, InputNumber, Typography } from 'antd'
import { ResponsiveRadar } from '@nivo/radar'

const { Option } = Select;
const { Text } = Typography

export default class RandomSettings extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            data: [],
            filtered: [],
            number_solved: 0,
            completed: 'no',
            difficulty: ['all'],
            problem_id: ['all'],
            tags: ['all'],
            time_limit: ['all'],
            memory_limit: ['all']
        };
    };
    
    componentWillReceiveProps = (nextProps) => {
        this.filterData('difficulty', ['all'], nextProps.data)
        this.setState({ data: nextProps.data });  
    }

    filterData = (col_id, values, data=this.state.data) => {
        const { number_solved, completed, difficulty, problem_id, tags, time_limit, memory_limit  } = this.state
        let filtered = data

        const number_solved_filters = col_id === 'number_solved' ? values : number_solved
        filtered = filtered.filter(d => d['number_solved'] >= number_solved_filters)

        const completed_filters = col_id === 'completed' ? values : completed
        if(completed_filters === 'yes')
            filtered = filtered.filter(d => d['completed'] === true)
        else if(completed_filters === 'no')
            filtered = filtered.filter(d => d['completed'] === false)

        const diff_filters = col_id === 'difficulty' ? values : difficulty
        filtered = filtered.filter(d => diff_filters.includes(d['difficulty']) || diff_filters.includes('all'))

        const problem_id_filters = col_id === 'problem_id' ? values : problem_id
        // loop through each char, find if there's 'a', 'b', etc.
        filtered = filtered.filter(d => (d['problem_id'].toLowerCase().split('').map(char => problem_id_filters.includes(char))).includes(true) || problem_id_filters.includes('all') )

        const tags_filters = col_id === 'tags' ? values : tags
        filtered = filtered.filter(d => (d['tags'].split('|').map(char => tags_filters.includes(char)).includes(true) || tags_filters.includes('all')))

        const time_limit_filters = col_id === 'time_limit' ? values : time_limit
        filtered = filtered.filter(d => time_limit_filters.includes(d['time_limit']) || time_limit_filters.includes('all'))

        const memory_limit_filters = col_id === 'memory_limit' ? values : memory_limit
        filtered = filtered.filter(d => memory_limit_filters.includes(d['memory_limit']) || memory_limit_filters.includes('all'))

        this.setState({ filtered })
    }

    checkAll = (values) => {
        if(values.slice(-1)[0] === 'all') values.splice(0, values.length - 1) // chose all (result in deleting everything except result)
        else if(values.length > 1 && values[0] === 'all') values.splice(0, 1) // choose something other than all (remove 'all' from the list)
        else if(values.length === 0) values.push('all') // empty array (add 'all' to the array)
        return values
    }

    changeNumberSolved = (number_solved) => {
        this.filterData('number_solved', number_solved)
        this.setState({ number_solved }, () => this.state.number_solved)
    } 

    changeDifficulty = (difficulty) => {
        difficulty = this.checkAll(difficulty)
        this.filterData('difficulty', difficulty)
        this.setState({ difficulty })
    } 

    changeID = (problem_id) => {
        problem_id = this.checkAll(problem_id)
        this.filterData('problem_id', problem_id)
        this.setState({ problem_id })
    } 

    changeCompleted = (completed) => {
        this.filterData('completed', completed)
        this.setState({ completed })
    } 

    changeTags = (tags) => {
        tags = this.checkAll(tags)
        this.filterData('tags', tags)
        this.setState({ tags })
    } 

    changeTimeLimit = (time_limit) => {
        time_limit = this.checkAll(time_limit)
        this.filterData('time_limit', time_limit)
        this.setState({ time_limit })
    } 

    changeMemoryLimit = (memory_limit) => {
        memory_limit = this.checkAll(memory_limit)
        this.filterData('memory_limit', memory_limit)
        this.setState({ memory_limit })
    } 

    render() {
        const today = new Date()

        const tagsProportion = this.props.sortedTags.map(tag => {
            return {
                'count': this.state.filtered.filter(d => d['tags'].includes(tag[0])).length, 
                'solved': this.state.filtered.filter(d => {
                    if(d['tags'].includes(tag[0])) return d['number_solved']
                    else return 0
                }).reduce((a, b) => a + b), 
                'id': tag[0]
            }
        })

        console.log(tagsProportion)

        return (
            <Drawer 
                title="Random Settings"
                width={720}
                onClose={this.props.closeRandomSettings}
                visible={this.props.visible}
                bodyStyle={{ paddingBottom: 80 }}
            >
                <Form layout="vertical" hideRequiredMark>
                <Row gutter={16}>
                    <Col span={4}>
                        <Form.Item
                            name="amount"
                            label="Amount"
                        >
                            <InputNumber min={1} max={10} defaultValue={5} />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name="number_solved"
                            label="Number Solved"
                        >
                            <InputNumber min={0} max={10000} defaultValue={this.state.number_solved} value={this.state.number_solved} onChange={(val) => this.changeNumberSolved(val)} />
                        </Form.Item>
                    </Col>
                    <Col span={16}>
                        <Form.Item 
                            name="difficulty"
                            label="Difficulty"
                        >
                            <Select mode="multiple" defaultValue={this.state.difficulty} value={this.state.difficulty} onChange={(val) => this.changeDifficulty(val)} >
                                <Option key='all' value='all'>All</Option>
                                { this.props.sortedDifficulty.map(diff => <Option key={diff} value={diff}>{diff}</Option>) }
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={4}>
                        <Form.Item
                            name="id"
                            label="ID"
                        >
                            <Select mode="multiple" defaultValue={this.state.problem_id} value={this.state.problem_id} onChange={(val) => this.changeID(val)} >
                                <Option key='all' value='all'>All</Option>
                                <Option key='a' value='a'>A</Option>
                                <Option key='b' value='b'>B</Option>
                                <Option key='c' value='c'>C</Option>
                                <Option key='d' value='d'>D</Option>
                                <Option key='e' value='e'>E</Option>
                                <Option key='f' value='f'>F</Option>
                                <Option key='g' value='g'>G</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name="completed"
                            label="Completed?"
                        >
                            <Select defaultValue={this.state.completed} value={this.state.completed} onChange={(val) => this.changeCompleted(val)} >
                                <Option key='all' value='all'>All</Option>
                                <Option key='yes' value='yes'>Yes</Option>
                                <Option key='no' value='no'>No</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={16}>
                        <Form.Item
                            name="tags"
                            label="Tags"
                        >
                            <Select mode="multiple" defaultValue={this.state.tags} value={this.state.tags} onChange={(val) => this.changeTags(val)} >
                                <Option value='all'>All</Option>
                                { this.props.sortedTags.map(diff => <Option key={diff[0]} value={diff[0]}>{diff[0].toUpperCase()} ({diff[1]})</Option>) }
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item
                            name="mode"
                            label="Mode"
                        >
                            <Select defaultValue='top' >
                                <Option key='top' value='top'>Top Solved</Option>
                                <Option key='random' value='random'>Random</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="date"
                            label="Date"
                        >
                            <DatePicker defaultValue={moment(`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`, 'YYYY-MM-DD')} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="time_limit"
                            label="Time Limit"
                        >
                            <Select mode="multiple" defaultValue={this.state.time_limit} value={this.state.time_limit} onChange={(val) => this.changeTimeLimit(val)} >
                                <Option key='all' value='all'>All</Option>
                                { this.props.sortedTimeLimit.map(time => <Option key={time} value={time}>{time}</Option>) }
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="memory_limit"
                            label="Memory Limit"
                        >
                            <Select mode="multiple" defaultValue={this.state.memory_limit} value={this.state.memory_limit} onChange={(val) => this.changeMemoryLimit(val)} >
                                <Option key='all' value='all'>All</Option>
                                { this.props.sortedMemLimit.map(mem => <Option key={mem} value={mem}>{mem}</Option>) }
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col style={{position: 'absolute', width: '100%', height: '100%'}} span={12}>
                        <ResponsiveRadar 
                            data={tagsProportion}
                            keys={[ 'count', 'solved' ]}
                            indexBy="id"
                        />
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Text>Number of Items to Choose from: {this.state.filtered.length}</Text>
                    </Col>
                    <Col span={12}>
                        <Button>Run</Button>
                    </Col>
                </Row>
                </Form>
            </Drawer>
    );
  }
}
