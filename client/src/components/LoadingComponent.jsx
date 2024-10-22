import React from 'react'
import { Flex,Spin } from 'antd'

const LoadingComponent = () => {
  return (
    <Flex align='center' gap="middle">
        <Spin size='large'/>
    </Flex>
  )
}

export default LoadingComponent
