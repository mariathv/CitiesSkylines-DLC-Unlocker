import React from 'react';
import {
    ChakraProvider,
    Box,
    Container,
    VStack,
    Heading,
    Text,
} from '@chakra-ui/react';

const CreamDetail = () => {
    return (
        <ChakraProvider>
            <Container maxW="container.xl" py={16}>
                <Box
                    mt={16}
                    color="black"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    flexDirection="column"
                >
                    <VStack spacing={6} textAlign="center">
                        <Heading as="h2" size="xl" color="black">
                            Instructions
                        </Heading>
                        <VStack spacing={4} maxWidth="700px">
                            <Text fontSize="lg" color="black">
                                Replace the downloaded `cream_api.ini` file with the one in your game directory.
                            </Text>
                            <Text fontSize="lg" color="black">
                                The configuration file is located at:
                                <Box as="span" fontWeight="bold">
                                    {' '}
                                    SteamLibrary\steamapps\common\Cities_Skylines
                                </Box>
                            </Text>
                            <Text fontSize="lg" color="black">
                                Note: You must own the base game on Steam for this to work!
                            </Text>
                        </VStack>
                    </VStack>
                </Box>
            </Container>
        </ChakraProvider>
    );
};

export default CreamDetail;
