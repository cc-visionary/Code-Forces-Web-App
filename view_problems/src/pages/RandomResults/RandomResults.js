import React, { Component } from 'react';
import { PageHeader, Card, Descriptions, Row, Col, Checkbox, Tag, Button } from 'antd';
import { LeftSquareOutlined } from '@ant-design/icons'


export default class componentName extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            
        };
    };
        
    render() {
        const randomProblems = this.props.location.state.randomProblems
        
        console.log(randomProblems)
        console.log(randomProblems.map(d => Object.entries(d)))

        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']

        return (
            <div> 
                <PageHeader
                    style={{border: '1px solid rgb(235, 237, 240)'}}
                    onBack={() => window.history.back()}
                    title='Random Problems'
                    backIcon={<LeftSquareOutlined />}
                    subTitle={`(${randomProblems.length})`}
                />
                <Row style={{margin: 16}} gutter={[16, 16]}>
                    { randomProblems.map(d => {
                        const letter_index = letters.map(letter => d['problem_id'].includes(letter)).indexOf(true)
                        return (
                            <Col span={12}>
                                <Card title={`${letters[letter_index]} - ${d['name']}`}>
                                    <Descriptions>
                                        <Descriptions.Item span={1} label="Problem ID">{d['problem_id']}</Descriptions.Item>
                                        <Descriptions.Item span={1} label="Number of Times Solved">{d['number_solved']}</Descriptions.Item>
                                        <Descriptions.Item span={1} label="difficulty">{d['difficulty']}</Descriptions.Item>
                                        <Descriptions.Item span={1} label="Time Limit">{d['time_limit']}</Descriptions.Item>
                                        <Descriptions.Item span={1} label="Memory Limit">{d['memory_limit']}</Descriptions.Item>
                                        <Descriptions.Item span={1  } label="Completed"><Checkbox value={d['completed']} /></Descriptions.Item>
                                        <Descriptions.Item span={1} label="Tags">{d['tags'].split('|').map(tag => <Tag>{tag.toUpperCase()}</Tag>)}</Descriptions.Item>
                                    </Descriptions>
                                    <Row>
                                        <Col span={6}>
                                            <Button href={d['page_url'].replace('//problemset', '/problemset')} target='_blank' rel="noopener noreferrer">View Page</Button>
                                        </Col>
                                        <Col span={6}>
                                            <Button href={d['page_url'].replace('//problemset', '/problemset')} target='_blank' rel="noopener noreferrer">View Page</Button>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        )
                    })}
                </Row>
            </div>
        );
    }
}
