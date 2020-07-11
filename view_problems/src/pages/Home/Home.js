import React, { Component } from 'react';
import { Menu, Modal, Table, Tag, Space, Button, Input, DatePicker } from 'antd'
import moment from 'moment'
import { SearchOutlined, PieChartOutlined, CaretRightOutlined, EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import RandomSettings from '../../components/RandomSettings/RandomSettings'
import './Home.css';
import 'antd/dist/antd.css';

const { SubMenu } = Menu;
const { confirm } = Modal;

export default class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
           data: [],
           columns: ['ID', 'Problem ID', 'Name', 'Tags', 'Difficulty', 'Number Solved', 'Time Limit', 'Memory Limit', 'Page URL', 'Completed', 'Completion Date'],
           loadingTable: true,
           selectedRowKeys: [], // Check here to configure the default column
           searchText: '',
           searchedColumn: '',
           selectRowVisible: false,
           newSelect: [],
           chosenDate: null,
           chosenRecord: {},
           randomSettingsVisible: false,
        };
    }; 

    setColumns = () => {
        let columns = []
        const [ sortedTags, sortedDifficulty ]  = this.sortTagsDiffTimeMem()
        const renders = {
            'Tags': cats => cats.split('|').map(tag => {
                let color = ''
                sortedTags.forEach((clr, key) => {
                    if(clr[0] === tag) {
                        color = parseInt((1 - key / sortedTags.length) * 255)
                    }
                })
                const red = 0
                const green = String(255 - color) 
                const blue = color
                return <Tag style={{
                    backgroundColor: `rgba(${red},${green},${blue}, 0.1)`, 
                    color: `rgb(${red},${green},${blue})`, 
                    borderColor: `rgba(${red},${green},${blue}, 0.5)`
                }} key={tag}>{tag.toUpperCase()}</Tag>
            }),
            'Difficulty': tag => {
                let color = ''
                sortedDifficulty.forEach((clr, key) => {
                    if(Number(clr) === Number(tag)) {
                        color = parseInt(key / sortedDifficulty.length * 255)
                    }
                })
                const red = 0
                const green = String(255 - color) 
                const blue = color
                return <Tag style={{
                    backgroundColor: 'rgba(' + red + ', ' + green + ', ' + blue + ', 0.1)', 
                    color: 'rgb(' + red + ', ' + green + ', ' + blue + ')', 
                    borderColor: 'rgba(' + red + ', ' + green + ', ' + blue + ', 0.5)'
                }} key={tag}>{tag}</Tag>
            },
            'Page URL': link => <a href={link.replace('//problemset', '/problemset')} style={{color: ''}} target='_blank' rel="noopener noreferrer">View Page</a>,
        }
        const hasSearch = [
            this.state.columns[1], // ID
            this.state.columns[2], // Name
        ]
        let hasFilters = {}
        hasFilters[this.state.columns[3]] = sortedTags.map(values => {return values[0].toUpperCase()}) // Tags
        hasFilters[this.state.columns[4]] = sortedDifficulty // Difficulty

        const hasSort = [
            this.state.columns[5], // Numbers Solved
            this.state.columns[6], // Time Limit
            this.state.columns[7], // Memory Limit
        ]
        
        this.state.columns.slice(1,-2).forEach(col => {
            let columnRules = {};
            const col_id = col.toLowerCase().replace(' ', '_')
            if(hasSearch.includes(col)) {
                columnRules = {
                    title: col,
                    dataIndex: col_id,
                    key: col_id,
                    render: Object.keys(renders).includes(col) ? renders[col] : text => <div>{text}</div>,
                    ...this.getColumnSearchProps(col_id),
                }
            } else if(Object.keys(hasFilters).includes(col)) {
                columnRules = {
                    title: col,
                    dataIndex: col_id,
                    key: col_id,
                    render: Object.keys(renders).includes(col) ? renders[col] : text => <div>{text}</div>,
                    filters: hasFilters[col].map(text => {return {text: text, value: typeof(text) == 'string' ? text.toLowerCase() : String(text)}}),
                    onFilter: (value, record) => String(record[col_id]) === String(value),
                }
            } else if(hasSort.includes(col)) {
                columnRules = {
                    title: col,
                    dataIndex: col_id,
                    key: col_id,
                    render: Object.keys(renders).includes(col) ? renders[col] : text => <div>{text}</div>,
                    defaultSortOrder: 'ascend',
                    sorter: (a, b) => typeof(a[col_id]) == 'string' ? Number(b[col_id].split(' ')[0]) - Number(a[col_id].split(' ')[0]) : b[col_id] - a[col_id],
                }
            } else {
                columnRules = {
                    'title': col,
                    'dataIndex': col_id,
                    'key': col_id,
                    'render': Object.keys(renders).includes(col) ? renders[col] : text => <div>{text}</div>,
                };
            }
            
            columns.push(columnRules)
        })
        return columns
    }

    getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
            <Input
                ref={node => {
                    this.searchInput = node;
                }}
                placeholder={`Search ${dataIndex}`}
                value={selectedKeys[0]}
                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Space>
                <Button
                    type="primary"
                    onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                    icon={<SearchOutlined />}
                    size="small"
                    style={{ width: 90 }}
                >
                    Search
                </Button>
                <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                    Reset
                </Button>
            </Space>
        </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select());
            }
        },
    });

    handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        this.setState({
            searchText: selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };

    handleReset = clearFilters => {
        clearFilters();
        this.setState({
            searchText: ''
        });
    };

    sortTagsDiffTimeMem = () => {
        /**
         * Counts the occurence of each tag
         * Sorts the tag base on occurence (sets it to this.state.sortedTags)
         * 
         * Find the unique Difficuly, Time Limit, and Memory limit then sort based on the value
         */
        let nTags = {}
        let difficulties = []
        let timeLimit = []
        let memoryLimit = []    
        this.state.data.forEach(d => {
            if(d['tags'] !== null && d['tags'] !== '') {
                d['tags'].split('|').forEach(tag => {
                    if(tag !== '') {
                        if(Object.keys(nTags).includes(tag)) nTags[tag] += 1
                        else nTags[tag] = 0
                    }
                })
            } else if(d['difficulty'] !== null && !difficulties.includes(d['difficulty'])) difficulties.push(d['difficulty'])
            else if(d['time_limit'] !== null && !timeLimit.includes(d['time_limit'])) timeLimit.push(d['time_limit'])
            else if(d['memory_limit'] !== null && d['memory_limit'] !== '' && !memoryLimit.includes(d['memory_limit'])) memoryLimit.push(d['memory_limit'])
        })
        return [
            Object.entries(nTags).sort((first, second) => {return second[1] - first[1]}), 
            difficulties.sort((a, b) => a - b), 
            timeLimit.sort((a, b) => a - b), 
            memoryLimit.sort((a, b) => a - b)
        ]
    }

    onSelectChange = () => {
        /**
         * Triggers when a row is checked/unchecked
         */
        const today = new Date()
        const chosenDate = moment(`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`, 'YYYY-MM-DD')
        const problem_id = this.state.chosenRecord['problem_id']
        const changeValue = !this.state.chosenRecord['completed']
        try {
            var completed_date = changeValue === false ? null : this.state.chosenDate.format('YYYY-MM-DD') // if complete is turned to false, we should discard it's date
        } catch {
            var completed_date = chosenDate
        }

        const selectedRowKeys = this.state.newSelect
        console.log(selectedRowKeys)

        fetch(`api/problems/${problem_id}`,  {
            method: 'put',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'completed': changeValue,
                'completion_date': completed_date
            })
        }).then(
            () => {
                let data = this.state.data
                for( let i = 0; i < data.length; i++ ) {
                    if(data[i]['problem_id'] === problem_id) {
                        data[i]['completed'] = changeValue
                        data[i]['completion_date'] = completed_date
                        break
                    }
                }
                this.setState({ data, selectedRowKeys, chosenDate, selectRowVisible: false });
            }
        )
    };

    fetchUpdateAll = () => {
        fetch('/api/problems/')
            .then(res => res.json())
            .then(json => {
                this.setState({data: json, loadingTable: false})
                return json // pass the json data unto the next
            })
            .then(json => { 
                let selectedRowKeys = [] // sets all the completed to be checked
                json.forEach(val => {
                    if(val['completed'] === true) {
                        selectedRowKeys = [...selectedRowKeys, val['problem_id']]
                    }
                })
                this.setState({ selectedRowKeys })
             })
    }

    componentDidMount = () => {
        this.fetchUpdateAll()
    };

    render() {
        const  { selectedRowKeys } = this.state;

        // rowSelection object indicates the need for row selection
        const rowSelection = {
            selectedRowKeys,
            onChange: (newSelect) => this.setState({ selectRowVisible: true, newSelect }),
            onSelect: (record) => this.setState({ chosenRecord: record }),
            onSelectAll: () => {
                let selectedRowKeys = []
                if(this.state.selectedRowKeys.length !== this.state.data.length) selectedRowKeys = this.state.data.map(data => data.index)
                this.setState({ selectedRowKeys })
            },
            hideSelectAll: true
        };

        const columns = this.setColumns()
        const [ sortedTags, sortedDifficulty, sortedTimeLimit, sortedMemLimit ]  = this.sortTagsDiffTimeMem()

        return (
            <div className='home'>
                <br/>
                <h1>Codeforces Problems</h1>
                <Menu style={{display: 'flex', justifyContent: 'flex-end'}} mode="horizontal">
                    <Menu.Item onClick={() => this.setState({ randomSettingsVisible: true })} key="random" icon={<CaretRightOutlined />}>
                        Choose Random
                    </Menu.Item>
                    <SubMenu icon={<PieChartOutlined />} title="Statistics">
                        <Menu.ItemGroup title="Item 1">
                            <Menu.Item key="setting:1">Option 1</Menu.Item>
                            <Menu.Item key="setting:2">Option 2</Menu.Item>
                        </Menu.ItemGroup>
                        <Menu.ItemGroup title="Item 2">
                            <Menu.Item key="setting:3">Option 3</Menu.Item>
                            <Menu.Item key="setting:4">Option 4</Menu.Item>
                        </Menu.ItemGroup>
                    </SubMenu>
                    <Menu.Item key="view" icon={<EyeOutlined />}>
                        <a href="https://codeforces.com/problemset?order=BY_SOLVED_DESC" target="_blank" rel="noopener noreferrer">
                            View Problems
                        </a>
                    </Menu.Item>
                </Menu>
                <Table 
                    loading={this.state.loadingTable}
                    size='middle'
                    pagination={{pageSize:15}}
                    rowSelection={rowSelection} 
                    columns={columns} 
                    dataSource={this.state.data} 
                    rowKey={row => row.problem_id}
                />
                <RandomSettings 
                    data={this.state.data}
                    visible={this.state.randomSettingsVisible}
                    closeRandomSettings={() => this.setState({randomSettingsVisible: false})}
                    sortedTags={sortedTags} 
                    sortedDifficulty={sortedDifficulty} 
                    sortedTimeLimit={sortedTimeLimit} 
                    sortedMemLimit={sortedMemLimit} 
                />
                <Modal
                    visible={this.state.selectRowVisible}
                    title={`Are you sure you want to change the value of ${this.state.chosenRecord['problem_id']} to ${!this.state.chosenRecord['completed']}?`}
                    icon={<ExclamationCircleOutlined />}
                    maskClosable={true}
                    onOk={this.onSelectChange.bind(this)}
                    onCancel={() => this.setState({ selectRowVisible: false })}
                >
                    <DatePicker style={{display: 'flex'}} value={this.state.chosenDate} onChange={(chosenDate) => this.setState({ chosenDate })} />
                </Modal>
            </div>
        )
    }
}