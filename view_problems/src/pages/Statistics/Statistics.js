import React, { Component } from 'react';
import { PageHeader, Select, Typography } from 'antd'
import { Pie } from '@ant-design/charts';

import './Statistics.css'

const { Option } = Select
const { Text } = Typography

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

export default class componentName extends Component {
    constructor(props) {
        super(props)

        this.state = {
            currentStats: 'solved_per_letter',
            statsTitle: 'Number of Problems per Letter',
            data:[]
        }
    }

    componentDidMount = () => {
        var currentStats = ''
        var data = []
        try {
            data = this.props.data.map(d => { // maps then adds the letter of the problem
                return { ...d,  letter: letters.filter(letter => d['problem_id'].includes(letter))[0] }
            })
            currentStats = this.props.location.params.type
        } 
        catch {
        }

        this.setState({ currentStats, data })
    }
    
    render() {
        const colors = ['#DFE622', '#060442', '#73752F', '#EB1AE7', '#2C28A1', '#3F402C', '#7E820D']
        const per_letter = letters.map((letter, key) => {
            const count = this.state.data.filter(d => {
                if(d !== undefined) return d['problem_id'].includes(letter)
            }).length
            return {
                label: `${letter} (${count})`,
                letter: letter,
                count: count,
                // color: colors[key]
            }
        }).filter(letter => letter['count'] > 0)

        return (
            <div>
                <PageHeader
                    style={{border: '1px solid rgb(235, 237, 240)'}}
                    onBack={() => window.history.back()}
                    title='Statistics'
                    subtitle={`(${this.state.statsTitle})`}
                    extra={[
                        <Select style={{ width: 200 }} onChange={currentStats => this.setState({ currentStats })} defaultValue={'solved_per_letter'} value={this.state.currentStats} >
                            <Option key='solved_per_letter' value='solved_per_letter'>Solved per Letter</Option>
                        </Select>
                    ]}
                />
                {/* <PieChart height={720} width={1080}>
                    <Pie data={per_letter} dataKey={'count'} nameKey={'letter'} cx="50%" cy="50%" innerRadius={20} label={(data) => data['name']}>
                        <Label dataKey={'count'} position='inside' />
                        { per_letter.map(d => (<Cell key={d['letter']} fill={d['color']} />)) }
                    </Pie>
                </PieChart> */}
                <Pie 
                    forceFit
                    data={per_letter} 
                    angleField='count' 
                    colorField='label' 
                    height={720}
                    label={{ 
                        visible : true , 
                        type : 'outer-center' , 
                        formatter : ( text , item ) => item._origin.count
                    }}
                />
            </div>
        );
    }
}
