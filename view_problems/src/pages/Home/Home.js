import React, { Component } from 'react';
import { Menu, Table, Tag, Space, Button, Input } from 'antd'
import { SearchOutlined, PieChartOutlined, CaretRightOutlined, EyeOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import RandomSettings from '../../components/RandomSettings/RandomSettings'
import './Home.css';

const { SubMenu } = Menu;

export default class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
           data: props.data.data,
           schema: props.data.schema,
           selectedRowKeys: [], // Check here to configure the default column
           searchText: '',
           searchedColumn: '',
           randomSettingsVisible: false
        };
    }; 

    setColumns = () => {
        const columns = []
        const [ sortedTags, sortedDifficulty, sortedTimeLimit, sortedMemLimit ]  = this.sortTagsDiffTimeMem()
        const renders = {
            'Page URL': link => <a href={link.replace('//problemset', '/problemset')} target='_blank' rel="noopener noreferrer">{link.replace('//problemset', '/problemset')}</a>,
            'Tags': cats => cats.split(',').map(tag => {
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
                    backgroundColor: 'rgba(' + red + ', ' + green + ', ' + blue + ', 0.1)', 
                    color: 'rgb(' + red + ', ' + green + ', ' + blue + ')', 
                    borderColor: 'rgba(' + red + ', ' + green + ', ' + blue + ', 0.5)'
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
            }
        }
        const hasSearch = [
            this.state.schema['fields'][2]['name'], // ID
            this.state.schema['fields'][3]['name'], // Name
        ]
        let hasFilters = {}
        hasFilters[this.state.schema['fields'][4]['name']] = sortedTags.map(values => {return values[0].toUpperCase()}) // Tags
        hasFilters[this.state.schema['fields'][5]['name']] = sortedDifficulty // Difficulty

        const hasSort = [
            this.state.schema['fields'][6]['name'], // Numbers Solved
            this.state.schema['fields'][8]['name'], // Time Limit
            this.state.schema['fields'][9]['name'], // Memory Limit
        ]
        
        this.state.schema['fields'].slice(2,).forEach(col => {
            let columnRules = {};
            if(hasSearch.includes(col['name'])) {
                columnRules = {
                    title: col['name'],
                    dataIndex: col['name'],
                    key: col['name'].toLowerCase().replace(' ', '_'),
                    render: Object.keys(renders).includes(col['name']) ? renders[col['name']] : text => <div>{text}</div>,
                    ...this.getColumnSearchProps(col['name']),
                }
            } else if(Object.keys(hasFilters).includes(col['name'])) {
                columnRules = {
                    title: col['name'],
                    dataIndex: col['name'],
                    key: col['name'].toLowerCase().replace(' ', '_'),
                    render: Object.keys(renders).includes(col['name']) ? renders[col['name']] : text => <div>{text}</div>,
                    filters: hasFilters[col['name']].map(text => {return {text: text, value: typeof(text) == 'string' ? text.toLowerCase() : String(text)}}),
                    onFilter: (value, record) => record[col['name']].indexOf(value) === 0,
                }
            } else if(hasSort.includes(col['name'])) {
                columnRules = {
                    title: col['name'],
                    dataIndex: col['name'],
                    key: col['name'].toLowerCase().replace(' ', '_'),
                    render: Object.keys(renders).includes(col['name']) ? renders[col['name']] : text => <div>{text}</div>,
                    defaultSortOrder: 'ascend',
                    sorter: (a, b) => typeof(a[col['name']]) == 'string' ? b[col['name']].split(' ')[0] - a[col['name']].split(' ')[0] : Number(b[col['name']]) - Number(a[col['name']]),
                }
            } else {
                columnRules = {
                    'title': col['name'],
                    'dataIndex': col['name'],
                    'key': col['name'].toLowerCase().replace(' ', '_'),
                    'render': Object.keys(renders).includes(col['name']) ? renders[col['name']] : text => <div>{text}</div>,
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
        onFilter: (value, record) =>
        record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
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
            if(d['Tags'] !== null && d['Tags'] !== '') {
                d['Tags'].split(',').forEach(tag => {
                    if(tag !== '') {
                        if(Object.keys(nTags).includes(tag)) nTags[tag] += 1
                        else nTags[tag] = 0
                    }
                })
            } else if(d['Difficulty'] !== null && d['Difficulty'] !== '' && !difficulties.includes(Number(d['Difficulty']))) difficulties.push(Number(d['Difficulty']))
            else if(d['Time Limit'] !== null && d['Time Limit'] !== '' && !timeLimit.includes(Number(d['Time Limit']))) timeLimit.push(Number(d['Time Limit']))
            else if(d['Memory Limit'] !== null && d['Memory Limit'] !== '' && !memoryLimit.includes(d['Memory Limit'])) memoryLimit.push(d['Memory Limit'])
        })
        return [
            Object.entries(nTags).sort((first, second) => {return second[1] - first[1]}), 
            difficulties.sort((a, b) => a - b), 
            timeLimit.sort((a, b) => a - b), 
            memoryLimit.sort((a, b) => a - b)
        ]
    }

    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
    };

    showRandomSettings = () => {
        this.setState({
            randomSettingsVisible: true,
        });
    };

    closeRandomSettings = () => {
        this.setState({
            randomSettingsVisible: false,
        });
    };
    
    componentDidMount = () => {
        let selectedRowKeys = [] // sets all the completed to be checked
        this.state.data.forEach((val, key) => {
            if(val['Completed'] == 1) {
                selectedRowKeys = [...selectedRowKeys, key]
            }
        })
        this.setState({ selectedRowKeys })
    };

    render() {
        const  { selectedRowKeys } = this.state;

        // rowSelection object indicates the need for row selection
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            onSelect: (record, selected, selectedRows) => {
                // change completed value on file and put timestamp
            },
            onSelectAll: () => {
                let selectedRowKeys = []
                if(this.state.selectedRowKeys.length != this.state.data.length) selectedRowKeys = this.state.data.map(data => data.index)
                this.setState({ selectedRowKeys })
            },
        };

        const columns = this.setColumns()
        const [ sortedTags, sortedDifficulty, sortedTimeLimit, sortedMemLimit ]  = this.sortTagsDiffTimeMem()

        return (
            <div className='home'>
                <br/>
                <h1>Codeforces Problems</h1>
                <Menu style={{display: 'flex', justifyContent: 'flex-end'}} mode="horizontal">
                    <Menu.Item onClick={this.showRandomSettings} key="random" icon={<CaretRightOutlined />}>
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
                    size='middle'
                    pagination={{pageSize: 15}}
                    rowSelection={rowSelection} 
                    columns={columns} 
                    dataSource={this.state.data} 
                    rowKey={record => record.index}
                />
                <RandomSettings 
                    visible={this.state.randomSettingsVisible}
                    closeRandomSettings={this.closeRandomSettings}
                    sortedTags={sortedTags} 
                    sortedDifficulty={sortedDifficulty} 
                    sortedTimeLimit={sortedTimeLimit} 
                    sortedMemLimit={sortedMemLimit} 
                />
            </div>
        )
    }
}