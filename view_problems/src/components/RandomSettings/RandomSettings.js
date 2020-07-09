import React, { Component } from 'react';
import { Drawer, Form, Select, Col, Row, DatePicker, Button, InputNumber } from 'antd'

const { Option } = Select;

export default class RandomSettings extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            
        };
    };

    render() {
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
                            rules={[{ required: true, message: 'Please enter a number' }]}
                        >
                            <InputNumber min={1} max={10} defaultValue={5} />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name="number_solved"
                            label="Number Solved"
                            rules={[{ required: true, message: 'Please enter a number' }]}
                        >
                            <InputNumber min={0} max={10000} defaultValue={0} />
                        </Form.Item>
                    </Col>
                    <Col span={16}>
                        <Form.Item 
                            name="difficulty"
                            label="Difficulty"
                        rules={[{ required: true, message: 'Please choose a difficulty' }]}
                        >
                            <Select mode="multiple" defaultValue='all' >
                                <Option value='all'>All</Option>
                                { this.props.sortedDifficulty.map(diff => <Option value={diff}>{diff}</Option>) }
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={4}>
                        <Form.Item
                            name="id"
                            label="ID"
                            rules={[{ required: true, message: 'Please choose an ID' }]}
                        >
                            <Select showSearch defaultValue='all' >
                                <Option value='all'>All</Option>
                                <Option value='a'>A</Option>
                                <Option value='b'>B</Option>
                                <Option value='c'>C</Option>
                                <Option value='d'>D</Option>
                                <Option value='e'>E</Option>
                                <Option value='f'>F</Option>
                                <Option value='g'>G</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={20}>
                        <Form.Item
                            name="tags"
                            label="Tags"
                        rules={[{ required: true, message: 'Please choose a difficulty' }]}
                        >
                            <Select mode="multiple" defaultValue='all' >
                                <Option value='all'>All</Option>
                                { this.props.sortedTags.map(diff => <Option value={diff[0]}>{diff[0].toUpperCase()} ({diff[1]})</Option>) }
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="time_limit"
                            label="Time Limit"
                        rules={[{ required: true, message: 'Please choose a difficulty' }]}
                        >
                            <Select mode="multiple" defaultValue='all' >
                                <Option value='all'>All</Option>
                                { this.props.sortedTimeLimit.map(time => <Option value={time}>{time}</Option>) }
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="memory_limit"
                            label="Memory Limit"
                        rules={[{ required: true, message: 'Please choose a difficulty' }]}
                        >
                            <Select mode="multiple" defaultValue='all' >
                                <Option value='all'>All</Option>
                                { this.props.sortedMemLimit.map(mem => <Option value={mem}>{mem}</Option>) }
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Button>Run</Button>
                </Row>
                </Form>
            </Drawer>
    );
  }
}
