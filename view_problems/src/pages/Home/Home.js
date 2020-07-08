import React, { Component } from 'react';
import { Table, Tag, Space, Button, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import './Home.css';

export default class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
           data: props.data.data,
           schema: props.data.schema,
        };
    }; 

    setColumns = () => {
        const columns = []
        const sortedTags = this.countSortTags()
        const sortedDifficulty = this.sortDifficulty()
        const tagColorEquivalent = [ 'magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple' ]
        const renders = {
            'Page URL': link => <a href={link.replace('//problemset', '/problemset')} target='_blank' rel="noopener noreferrer">{link.replace('//problemset', '/problemset')}</a>,
            'Tags': cats => cats.split(',').map(tag => {
                let color = ''
                tagColorEquivalent.forEach((clr, key) => {
                    if(sortedTags[key][0] === tag) color = clr
                })
                return <Tag color={color} key={tag}>{tag.toUpperCase()}</Tag>
            })
        }
        const hasSearch = [
            this.state.schema['fields'][0]['name'], // ID
            this.state.schema['fields'][1]['name'], // Name
        ]
        let hasFilters = {}
        hasFilters[this.state.schema['fields'][2]['name']] = sortedTags.map(values => {return values[0].toUpperCase()}) // Tags
        hasFilters[this.state.schema['fields'][3]['name']] = sortedDifficulty // Difficulty
        console.log(hasFilters)

        const hasSort = [
            this.state.schema['fields'][4]['name'], // Numbers Solved
            this.state.schema['fields'][6]['name'], // Time Limit
            this.state.schema['fields'][7]['name'], // Memory Limit
        ]
        console.log(sortedDifficulty)
        this.state.schema['fields'].forEach(col => {
            let columnRules = {};
            if(hasSearch.includes(col['name'])) {
                columnRules = {
                    title: col['name'],
                    dataIndex: col['name'],
                    key: col['name'].toLowerCase().replace(' ', '_'),
                    render: Object.keys(renders).includes(col['name']) ? renders[col['name']] : text => <div>{text}</div>,
                    ...this.getColumnSearchProps('name'),
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

    countSortTags = () => {
        /**
         * Counts the occurence of each tag
         * 
         * Sorts the tag base on occurense (sets it to this.state.sortedTags)
         */
        let nTags = {}
        this.state.data.forEach(d => {
            if(d['Tags'] !== null && d['Tags'] !== '') {
                d['Tags'].split(',').forEach(tag => {
                    if(tag !== '') {
                        if(Object.keys(nTags).includes(tag)) nTags[tag] += 1
                        else nTags[tag] = 0
                    }
                })
            }
        })
        return Object.entries(nTags).sort((first, second) => {return second[1] - first[1]})
    }

    sortDifficulty = () => {
        let difficulties = []
        this.state.data.forEach(d => {
            if(d['Difficulty'] !== null && d['Difficulty'] !== '' && !difficulties.includes(Number(d['Difficulty']))) difficulties.push(Number(d['Difficulty']))
        })

        return difficulties.sort((a, b) => a - b)
    }

    componentDidMount = () => {
    };
    

    render() {
        // rowSelection object indicates the need for row selection
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            },
            getCheckboxProps: record => ({
                disabled: record['ID'] === 'Disabled User', // Column configuration not to be checked
                name: record['ID'],
            }),
        };

        const columns = this.setColumns()

        return (
            <div className='home'>
                <br/>
                <h1>Codeforces Problems</h1>
                <Table 
                    size='middle'
                    pagination={{pageSize: 16}}
                    rowSelection={{...rowSelection}} 
                    columns={columns} 
                    dataSource={this.state.data} 
                />
            </div>
        )
    }
}