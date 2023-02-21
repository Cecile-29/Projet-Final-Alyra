import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Owner } from '@/components/Owner'  
import { Flex } from "@chakra-ui/react";

export const Layout = ({children}) => {
  return (
    <>
        <Flex direction="column" minHeight="100vh">
            <Header />
            <Flex flexGrow="1" p="2rem">
            <Owner />
                {children}
            </Flex>
            <Footer />
        </Flex>
    </>
  )
};