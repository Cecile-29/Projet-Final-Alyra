import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Flex, Text } from '@chakra-ui/react'
import Link from 'next/link'

export const Header = () => {
  return (
    <Flex h="15vh" p="2rem" justifyContent="space-between" alignItems="center">
        <Text>Network for Volunteers</Text>
        <Flex 
            direction={["column", "column", "column", "row"]} 
            justifyContent="space-between" 
            alignItems="center" 
            width="25%"
        >
        </Flex>
        <ConnectButton />
    </Flex>
  )
};