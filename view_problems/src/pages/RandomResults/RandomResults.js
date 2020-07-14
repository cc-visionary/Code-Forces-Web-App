import React, { Component } from 'react';
import { PageHeader, Card, Descriptions, Row, Col, Checkbox, Tag, Button } from 'antd';
import QueueAnim from 'rc-queue-anim';

export default class componentName extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            currentData: {},
            solveModalVisible: false
        };
    };

    showModal = (currentData) => {
        console.log(currentData)
        this.setState({ currentData, solveModalVisible: true })
    }        

    hideModal = () => {
        this.setState({ currentData: {}, solveModalVisible: false })
    }

    render() {
        const randomProblems = this.props.location.state.randomProblems

        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']

        return (
            <div> 
                <PageHeader
                    style={{border: '1px solid rgb(235, 237, 240)'}}
                    onBack={() => window.history.back()}
                    title='Random Problems'
                    subTitle={`(${randomProblems.length})`}
                />
                <QueueAnim style={{margin: 16}} component={Row} gutter={[16, 16]} delay={300} interval={150}>
                    { randomProblems.map(d => {
                        const letter_index = letters.map(letter => d['problem_id'].includes(letter)).indexOf(true)
                        return (
                            <Col key={d['problem_id']} span={12}>
                                <Card title={`${letters[letter_index]} - ${d['name']}`}>
                                    <Descriptions>
                                        <Descriptions.Item span={1} label="Problem ID">{d['problem_id']}</Descriptions.Item>
                                        <Descriptions.Item span={1} label="Number of Times Solved">{d['number_solved']}</Descriptions.Item>
                                        <Descriptions.Item span={1} label="difficulty">{d['difficulty']}</Descriptions.Item>
                                        <Descriptions.Item span={1} label="Time Limit">{d['time_limit']}</Descriptions.Item>
                                        <Descriptions.Item span={1} label="Memory Limit">{d['memory_limit']}</Descriptions.Item>
                                        <Descriptions.Item span={1} label="Completed"><Checkbox value={d['completed']} /></Descriptions.Item>
                                        <Descriptions.Item span={3} label="Tags">{d['tags'].split('|').map(tag => <Tag>{tag.toUpperCase()}</Tag>)}</Descriptions.Item>
                                    </Descriptions>
                                    <Row gutter={16}>
                                        <Col span={18}>
                                        </Col>
                                        <Col span={3}>
                                            <Button onClick={() => this.showModal(d)} block>Solve</Button>
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
            </div>
        );
    }
}
