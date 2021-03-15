import React from 'react'
import { PageHeader } from 'antd'

export default function Calendar() {
    return (
        <div>
            <PageHeader
                style={{border: '1px solid rgb(235, 237, 240)'}}
                onBack={() => window.history.back()}
                title='Calendar'
            />
        </div>
    )
}
