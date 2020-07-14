import React, { Component } from 'react';
import { useHistory } from "react-router-dom";
import moment from 'moment';
import { Drawer, Form, Select, Col, Row, DatePicker, Button, InputNumber, Typography } from 'antd'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const { Option } = Select;
const { Title } = Typography

function RunButton(props) {
    let history = useHistory();
  
    const handleClick = () => {
        history.push(`/random_results`, { randomProblems: props.randomProblems });
    }

    return (
        <Button onClick={handleClick} block>Run</Button>
    );
}
// onFinish={(values) => this.getRandom(values)}

export default class RandomSettings extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            data: [],
            filtered: [],
            amount: 5,
            number_solved: 0,
            completed: 'no',
            difficulty: ['all'],
            problem_id: ['all'],
            tags: ['all'],
            mode: 'top',
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

    getRandomProblems = () => {
        let randomProblems = []
        let uniqueIDs = []

        // if mode "top" is chosen, then we will only get the top half of the filtered data
        const indexChoices = this.state.mode === 'top' ? this.state.filtered.length / 2 : this.state.filtered.length

        // push random problem to randomProblems array while its length is less than the desired length
        while(randomProblems.length < this.state.amount) {
            let randomIndex = Math.floor(Math.random() * indexChoices)
            let randomID = this.state.filtered[randomIndex]['problem_id']
            if(!uniqueIDs.includes(randomID)) {
                uniqueIDs.push(randomID)
                randomProblems.push(this.state.filtered[randomIndex])
            }
        }
        
        return randomProblems
    }

    render() {
        const today = moment(`${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`, 'YYYY-MM-DD')
        
        const tagCounts = this.props.sortedTags.map(tag => this.state.filtered.filter(d => d['tags'].includes(tag[0])).length)
        var tagSolved = []
        try {
            tagSolved = this.props.sortedTags.map(tag => this.state.filtered.map(d => d['tags'].includes(tag[0]) ? d['number_solved'] : 0).reduce((a, b) => a + b))
        } catch {
            tagSolved = []
        }

        const sumCount = tagCounts.length !== 0 ? tagCounts.reduce((a, b) => a + b) : 0
        const sumSolved = tagSolved.length !== 0 ? tagSolved.reduce((a, b) => a + b) : 0

        // proportion statistics for barchart
        const proportionPerTag = this.props.sortedTags.map((tag, index) => {
            return {
                'count': (tagCounts[index] / sumCount * 100).toFixed(2),
                'solved': (tagSolved[index] / sumSolved * 100).toFixed(2),
                'id': tag[0].toUpperCase()
            }
        })

        // every render, get the random problems
        const randomProblems = this.state.amount <= this.state.filtered.length ? this.getRandomProblems() : []

        return (
            <Drawer 
                title="Random Settings"
                width={1280}
                onClose={this.props.closeRandomSettings}
                visible={this.props.visible}
            >
                <Form layout="vertical" hideRequiredMark>
                    <Row gutter={16}>
                        <Col span={4}>
                            <Form.Item
                                name="amount"
                                label="Amount"
                                initialValue={5}
                                rules={[{ validator:(_, value) => value <= this.state.filtered.length ? Promise.resolve() : Promise.reject('Amount must be greater than or equal to the current number of filters.') }]}
                            >
                                <InputNumber style={{width: '100%'}} min={1} max={10} value={this.state.amount} onChange={(amount) => this.setState({ amount })} />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item
                                name="number_solved"
                                label="Number Solved"
                                initialValue={0}
                            >
                                <InputNumber style={{width: '100%'}} min={0} max={10000} value={this.state.number_solved} onChange={(val) => this.changeNumberSolved(val)} />
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item 
                                name="difficulty"
                                label="Difficulty"
                                initialValue={this.state.difficulty}
                            >
                                <Select mode="multiple" value={this.state.difficulty} onChange={(val) => this.changeDifficulty(val)} >
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
                                initialValue={this.state.problem_id}
                            >
                                <Select mode="multiple" value={this.state.problem_id} onChange={(val) => this.changeID(val)} >
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
                                initialValue={'all'}
                            >
                                <Select alue={this.state.completed} onChange={(val) => this.changeCompleted(val)} >
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
                                initialValue={this.state.tags}
                            >
                                <Select mode="multiple" value={this.state.tags} onChange={(val) => this.changeTags(val)} >
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
                                initialValue={'top'}
                            >
                                <Select value={this.state.mode} onChange={(mode) => this.setState({ mode })} >
                                    <Option key='top' value='top'>Top Solved</Option>
                                    <Option key='random' value='random'>Random</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name="date"
                                label="Date"
                                initialValue={today}
                            >
                                <DatePicker style={{width: '100%'}} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name="time_limit"
                                label="Time Limit"
                                initialValue={this.state.time_limit}
                            >
                                <Select mode="multiple" value={this.state.time_limit} onChange={(val) => this.changeTimeLimit(val)} >
                                    <Option key='all' value='all'>All</Option>
                                    { this.props.sortedTimeLimit.map(time => <Option key={time} value={time}>{time}</Option>) }
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name="memory_limit"
                                label="Memory Limit"
                                initialValue={this.state.memory_limit}
                            >
                                <Select mode="multiple" value={this.state.memory_limit} onChange={(val) => this.changeMemoryLimit(val)} >
                                    <Option key='all' value='all'>All</Option>
                                    { this.props.sortedMemLimit.map(mem => <Option key={mem} value={mem}>{mem}</Option>) }
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col style={{maxHeight: '400px', maxWidth: '1280px'}} span={24}>
                            {/* <ResponsiveBar
                                data={proportionPerTag}
                                indexBy='id'
                                keys={['count', 'solved']}
                                margin={{ top: 50, right: 130, bottom: 160, left: 60 }}
                                labelSkipHeight={12}
                                padding={0.3}
                                axisLeft={{
                                    format: value => value + '%'
                                }}
                                axisBottom={{
                                    tickRotation: -90
                                }}
                                legends={[
                                    {
                                        dataFrom: 'id',
                                        anchor: 'bottom-right',
                                        direction: 'column',
                                        justify: false,
                                        translateX: 120,
                                        translateY: 0,
                                        itemsSpacing: 2,
                                        itemWidth: 100,
                                        itemHeight: 20,
                                        itemDirection: 'left-to-right',
                                        itemOpacity: 0.85,
                                        symbolSize: 20,
                                        effects: [
                                            {
                                                on: 'hover',
                                                style: {
                                                    itemOpacity: 1
                                                }
                                            }
                                        ]
                                    }
                                ]}
                            /> */}
                            <BarChart 
                                height={480} 
                                width={1200} 
                                margin={{
                                    top: 20, right: 50, left: 50, bottom: 90,
                                }} 
                                data={proportionPerTag}
                            >
                                <XAxis style={{fontSize: '12px'}} textAnchor='end' minTickGap={-150} angle={-40} height={50} dataKey="id" />
                                <YAxis />
                                <Tooltip />
                                <Legend verticalAlign="top" />
                                <Bar dataKey="count" stackId="a" fill="#8884d8" />
                                <Bar dataKey="solved" stackId="a" fill="#82ca9d" />
                            </BarChart>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: 70, marginBottom: 0 }} gutter={[16, 16]}>
                        <Col span={24}>
                            <Title level={3}>Number of Items to Choose from: {this.state.filtered.length}</Title>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item>
                                <RunButton htmlType="submit" randomProblems={randomProblems} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Drawer>
    );
  }
}
