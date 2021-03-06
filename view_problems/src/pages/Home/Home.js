import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Modal, Table, Tag, Space, Button, Input, DatePicker, TimePicker, Typography, Row, Col, message } from 'antd'
import moment from 'moment'
import { SearchOutlined, PieChartOutlined, CaretRightOutlined, EyeOutlined, ExclamationCircleOutlined, CalendarOutlined, HighlightOutlined, InboxOutlined } from '@ant-design/icons';
import RandomSettings from '../../components/RandomSettings/RandomSettings'
import ViewItem from '../../components/ViewItem/ViewItem'
import './Home.css';
import 'antd/dist/antd.css';

const { SubMenu } = Menu;

export default class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
           data: [],
           filtered: [],
           currentData: {},
           columns: ['ID', 'Problem ID', 'Name', 'Tags', 'Difficulty', 'Number Solved', 'Time Limit', 'Memory Limit', 'Page URL', 'Completed', 'Completion Date'],
           loadingTable: true,
           selectedRowKeys: [], // Check here to configure the default column
           searchText: '',
           searchedColumn: '',
           selectRowVisible: false,
           newSelect: [],
           chosenDate: null,
           chosenTime: '00:00:00',
           chosenRecord: {},
           randomSettingsVisible: false,
           viewItemVisible: false,
           showCompleted: false
        };
    }; 

    setColumns = () => {
        /**
         * Sets the column rules, components, etc.
         * 
         * Returns
         * -------
         * array of rules based on the rules set
         */
        let columns = []

        // calls this.sortTagsDiffTimeMem to get sortedTags and sortedDifficulty (to be able to get the correct colors for it's tags on the column)
        const [ sortedTags, sortedDifficulty ]  = this.sortTagsDiffTimeMem()

        // sets the columns which has special renders
        const renders = {
            'Tags': cats => cats.split('|').map(tag => {
                let color = 0
                sortedTags.forEach((clr, key) => {
                    if(clr[0] === tag) {
                        color = parseInt((1 - key / sortedTags.length) * 255)
                    }
                })
                const red = 0
                const green = 255 - color
                const blue = color
                return <Tag style={{
                    backgroundColor: `rgba(${red},${green},${blue}, 0.1)`, 
                    color: `rgb(${red},${green},${blue})`, 
                    borderColor: `rgba(${red},${green},${blue}, 0.5)`
                }} key={tag}>{tag.toUpperCase()}</Tag>
            }),
            'Difficulty': tag => {
                let color = 0
                sortedDifficulty.forEach((clr, key) => {
                    if(Number(clr) === Number(tag)) {
                        color = parseInt(key / sortedDifficulty.length * 255)
                    }
                })
                const red = 0
                const green = 255 - color
                const blue = color
                return <Tag style={{
                    backgroundColor: `rgba(${red},${green},${blue}, 0.1)`, 
                    color: `rgb(${red},${green},${blue})`,  
                    borderColor: `rgba(${red},${green},${blue}, 0.5)`
                }} key={tag}>{tag}</Tag>
            },
            'Page URL': link => <a href={link.replace('//problemset', '/problemset')} style={{color: ''}} target='_blank' rel="noopener noreferrer">View Page</a>,
        }

        // sets the columns which will have a filter from the `search`
        const hasSearch = [
            this.state.columns[1], // ID
            this.state.columns[2], // Name
        ]

        // sets the columns which will have a filter from the `drop down`
        let hasFilters = {}
        hasFilters[this.state.columns[3]] = sortedTags.map(values => {return values[0].toUpperCase()}) // Tags
        hasFilters[this.state.columns[4]] = sortedDifficulty // Difficulty

        // sets the columns which will be sorted
        const hasSort = [
            this.state.columns[5], // Numbers Solved
            this.state.columns[6], // Time Limit
            this.state.columns[7], // Memory Limit
        ]
        
        // loops indexes [1 - 7] of the data (does not include: id, completed, and completion_date)
        this.state.columns.slice(1, -3).forEach(col => {
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

        columns.push({ // adds the view button at the end
            'render': (_, data) => <Typography.Link onClick={() => this.setState({ currentData: data, viewItemVisible: true })}>View</Typography.Link>
        })

        return columns
    }

    getColumnSearchProps = dataIndex => ({
        /**
         * Search filter component for the table
         */
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
        /**
         * Handles the search by finding the indexes of items which contains the same
         * values with the input
         */
        confirm();
        this.setState({ searchText: selectedKeys[0], searchedColumn: dataIndex });
    };

    handleReset = clearFilters => {
        /**
         * Resets the search filter
         */
        clearFilters();
        this.setState({ searchText: '' });
    };

    sortTagsDiffTimeMem = () => {
        /**
         * Counts the occurence of each tag
         * Sorts the tag base on occurence (sets it to this.state.sortedTags)
         * 
         * Find the unique Difficuly, Time Limit, and Memory limit then sort based on the value
         * 
         * Returns
         * -------
         * [arr of strings, arr of int, arr of int, arr of strinsg]
         * [sortedTags, sortedDifficulties, sortedTimeLimit, sortedMemoryLimit]
         */
        let nTags = {}
        let difficulties = []
        let timeLimit = []
        let memoryLimit = []    
        if(this.state.data.length > 0) {
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
        }
        
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
        const problem_id = this.state.chosenRecord['problem_id']
        const changeValue = !this.state.chosenRecord['completed']

        var completed_date = null
        var completed_time = changeValue ? this.state.chosenTime : null
        try {
            if(changeValue) completed_date = this.state.chosenDate.format('YYYY-MM-DD') // if complete is turned to false, we should discard it's date
        } catch {
            completed_date = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
        }

        const selectedRowKeys = this.state.newSelect
        // updates problem id
        if(changeValue && this.state.chosenDate === null) {
            message.error('Please choose a date');
        } else {
            fetch(`api/problems/${problem_id}`,  {
                method: 'put',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'completed': changeValue,
                    'completion_date': completed_date,
                    'completion_time': completed_time
                })
            }).then(
                () => {
                    let data = this.state.data
                    for( let i = 0; i < data.length; i++ ) {
                        if(data[i]['problem_id'] === problem_id) {
                            data[i]['completed'] = changeValue
                            data[i]['completion_date'] = completed_date
                            data[i]['completion_time'] = completed_time
                            break
                        }
                    }
                    this.setState({ data, selectedRowKeys, chosenDate: null, chosenTime: '00:00:00', selectRowVisible: false });
                }
            )
        }
    };

    filterComplete = () => {
        var filtered = []
        if(!this.state.showCompleted) {
            this.state.data.forEach((d) => {
                if(d['completed']) filtered.push(d)
            })
        } else {
            filtered = this.state.data
        }
        this.setState({ showCompleted: !this.state.showCompleted, filtered })
    }

    componentDidMount = () => {
        /**
         * When it receives the props from App.js, it updates it
         * then set the selectRowKeys based on the value of whether the problem has been completed/solved or not
         */
        var selectedRowKeys = [] // sets all the completed to be checked
        if(this.props.data.length > 0) {
            this.props.data.forEach(val => {
                if(val['completed'] === true) {
                    selectedRowKeys = [...selectedRowKeys, val['problem_id']]
                }
            })
        }
        if(this.props.data.length !== 0) {
            this.setState({ filtered: this.props.data, data: this.props.data, selectedRowKeys, loadingTable: false });
        }
    }
    
    render() {
        const  { selectedRowKeys } = this.state;
        // rowSelection object indicates the need for row selection
        const rowSelection = {
            selectedRowKeys,
            onChange: (newSelect) => {
                this.setState({ selectRowVisible: true, newSelect })
            },
            onSelect: (record) => this.setState({ chosenRecord: record }),
            hideSelectAll: true
        };

        const columns = this.setColumns()
        const [ sortedTags, sortedDifficulty, sortedTimeLimit, sortedMemLimit ]  = this.sortTagsDiffTimeMem()

        return (
            <div className='home'>
                <br/>
                <h1 style={{textAlign: 'center'}}>Codeforces Problems</h1>
                <Menu style={{display: 'flex', justifyContent: 'flex-end'}} mode="horizontal">
                    <Menu.Item onClick={() => this.filterComplete()} key="complete" icon={this.state.showCompleted ? <InboxOutlined /> : <HighlightOutlined />}>
                        {`Show ${ this.state.showCompleted ? 'All' : 'Completed' }`}
                    </Menu.Item>
                    <Menu.Item onClick={() => this.setState({ randomSettingsVisible: true })} key="random" icon={<CaretRightOutlined />}>
                        Choose Random
                    </Menu.Item>
                    <SubMenu icon={<PieChartOutlined />} title="Statistics">
                        <Menu.ItemGroup title="per Letter">
                            <Menu.Item key="statistics:solved_per_letter">
                                <Link to={{ pathname: '/statistics', params:{ type: 'solved_per_letter' }}} >Solved</Link>
                            </Menu.Item>
                            <Menu.Item key="statistics:2">Statistics 2</Menu.Item>
                        </Menu.ItemGroup>
                        <Menu.ItemGroup title="per Tag">
                            <Menu.Item key="statistics:3">Statistics 3</Menu.Item>
                            <Menu.Item key="statistics:4">Statistics 4</Menu.Item>
                        </Menu.ItemGroup>
                        <Menu.ItemGroup title="per Completed">
                            <Menu.Item key="statistics:5">Statistics 5</Menu.Item>
                            <Menu.Item key="statistics:6">Statistics 6</Menu.Item>
                        </Menu.ItemGroup>
                        <Menu.ItemGroup title="per Difficulty">
                            <Menu.Item key="statistics:7">Statistics 7</Menu.Item>
                            <Menu.Item key="statistics:8">Statistics 8</Menu.Item>
                        </Menu.ItemGroup>
                    </SubMenu>
                    <Menu.Item onClick={() => console.log('View Calendar')} key="calendar" icon={<CalendarOutlined />}>Calendar</Menu.Item>
                    <Menu.Item key="view" icon={<EyeOutlined />}>
                        <a href="https://codeforces.com/problemset?order=BY_SOLVED_DESC" target="_blank" rel="noopener noreferrer">All Problem</a>
                    </Menu.Item>
                </Menu>
                <Table 
                    loading={this.state.loadingTable}
                    size='small'
                    pagination={{pageSize:18}}
                    rowSelection={rowSelection} 
                    columns={columns} 
                    dataSource={this.state.filtered} 
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
                <ViewItem 
                    currentData={this.state.currentData} 
                    visible={this.state.viewItemVisible} 
                    closeViewItems={() => this.setState({currentData: {}, viewItemVisible: false})} 
                    sortedTags={sortedTags} 
                    sortedDifficulty={sortedDifficulty} 
                />
                <Modal
                    visible={this.state.selectRowVisible}
                    title={`Are you sure you want to change the value of ${this.state.chosenRecord['problem_id']} to ${!this.state.chosenRecord['completed']}?`}
                    icon={<ExclamationCircleOutlined />}
                    maskClosable={true}
                    onOk={this.onSelectChange.bind(this)}
                    onCancel={() => this.setState({ selectRowVisible: false, chosenDate: null, chosenTime: '00:00:00' })}
                >
                    <Row column={2} gutter={16} >
                        <Col><DatePicker value={this.state.chosenDate} onChange={(chosenDate) => this.setState({ chosenDate })} /></Col>
                        <Col><TimePicker onChange={(_, timeString) => this.setState({ chosenTime: timeString })} value={moment(this.state.chosenTime, 'HH:mm:ss')} /></Col>
                    </Row>
                    
                </Modal>
            </div>
        )
    }
}