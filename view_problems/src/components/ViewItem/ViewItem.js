import React from 'react';
import moment from 'moment'
import { Drawer, Descriptions, Tag, DatePicker, TimePicker, Checkbox } from 'antd';

const tagList = (currentData, sortedTags) => currentData['tags'].split('|').map((tag) => {
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
        borderColor: `rgba(${red},${green},${blue}, 0.5)`, 
    }} key={tag}>{tag.toUpperCase()}</Tag>
})

const difficulty = (currentData, sortedDifficulty) => {
    let color = 0
    sortedDifficulty.forEach((clr, key) => {
        if(Number(clr) === Number(currentData['difficulty'])) {
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
    }} key={currentData['difficulty']}>{currentData['difficulty']}</Tag>
}

export default function ViewItem(props) {
    const { currentData, visible, closeViewItems, sortedTags, sortedDifficulty } = props

    return (
        <Drawer
            onClose={closeViewItems}
            visible={visible}
            height={300}
            placement='bottom'
        >
            <Descriptions column={9} layout='vertical' bordered>
                <Descriptions.Item label='Problem ID'>{currentData['problem_id']}</Descriptions.Item>
                <Descriptions.Item label='Name'>{currentData['name']}</Descriptions.Item>
                <Descriptions.Item label='Difficulty'>
                    { currentData['difficulty'] !== undefined ? difficulty(currentData, sortedDifficulty) : <></> }
                </Descriptions.Item>
                <Descriptions.Item label='Number Solved'>{currentData['number_solved']}</Descriptions.Item>
                <Descriptions.Item label='Time Limit'>{currentData['time_limit']}</Descriptions.Item>
                <Descriptions.Item label='Memory Limit'>{currentData['memory_limit']}</Descriptions.Item>
                <Descriptions.Item label='Completion Date'><DatePicker value={moment(currentData['completion_date'], 'YYYY-MM-DD')} disabled /></Descriptions.Item>
                <Descriptions.Item label='Completion Time'><TimePicker value={moment(currentData['completion_time'], 'HH:mm:ss')} disabled /></Descriptions.Item>
                <Descriptions.Item label='Completed?'><Checkbox checked={currentData['completed']} disabled/></Descriptions.Item>
                <Descriptions.Item label='Page URL'><a href={currentData['page_url'] === undefined ? '#' : currentData['page_url'].replace('//problemset', '/problemset')} style={{color: ''}} target='_blank' rel="noopener noreferrer">{currentData['page_url']}</a></Descriptions.Item>
                <Descriptions.Item label='Tags'>
                    { currentData['tags'] !== undefined ? tagList(currentData, sortedTags) : <></> }
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    )
}

