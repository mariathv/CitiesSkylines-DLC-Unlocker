import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Box,
  VStack,
  Heading,
  Checkbox,
  Button,
  Container,
  CheckboxGroup,
  Spinner,
  extendTheme,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react"; // Correct import

const hoverAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "white",
        color: "black",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        color: "black !important", // Force text color to black
        bg: "white !important",    // Force background to white
        border: "2px solid black",
        _hover: {
          bg: "white !important",
          color: "black !important",
          animation: `${hoverAnimation} 0.4s ease-in-out`,
        },
        _active: {
          bg: "gray.700",
        },
      },
    },
    Checkbox: {
      baseStyle: {
        control: {
          bg: "white",
          borderColor: "black",
          _checked: {
            bg: "black",
            color: "white",
            borderColor: "black",
          },
        },
        label: {
          color: "black",
        },
      },
    },
  },
});

import { useFetchCS, useFetchDLCs } from './hooks/useFetch';

function App() {
  const [selectedDLCs, setSelectedDLCs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);

  const handleGenerate = () => {
    const selectedIDs = selectedDLCs.map(
      (dlcName) => Object.keys(dlcs_tk).find((key) => dlcs_tk[key] === dlcName)
    );
    console.log("GENERATE CREAM, ", selectedIDs);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setShowDownloadButton(true);
    }, 2000);

  };

  useEffect(() => {
    if (showDownloadButton) {
      document.getElementById("download-button")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [showDownloadButton]);

  const handleDownload = () => {
    alert("File downloaded!");
  };

  let storageflag = false;

  const storedToken = localStorage.getItem("listToken"); // or sessionStorage.getItem()
  let decodedList;
  if (storedToken)
    decodedList = JSON.parse(atob(storedToken));

  let dlcs_tk;
  if (storedToken && storedToken.trim() !== "") {
    storageflag = true;
    console.log("retrieving from local storage");
    dlcs_tk = decodedList;
  } else {
    storageflag = false;
    console.log("retrieving from api");
    const { data, loading, error } = useFetchCS();
    const [dlcs, setDlcs] = useState({});
    const [loadingDLCs, setLoadingDLCs] = useState(true);
    const [errorDLCs, setErrorDLCs] = useState(null);

    const { dlcs: fetchedDlcs, loading: dlcsLoading, error: dlcsError } = useFetchDLCs((data && data["255710"].data.dlc) || []);

    useEffect(() => {
      if (fetchedDlcs) {
        setDlcs(fetchedDlcs);
        setLoadingDLCs(dlcsLoading);
        setErrorDLCs(dlcsError);
      }

    }, [fetchedDlcs, dlcsLoading, dlcsError]);

    dlcs_tk = dlcs;
  }





  if (dlcs_tk) {
    if (storageflag == false) {
      const listString = JSON.stringify(dlcs_tk);
      const base64Token = btoa(listString);
      localStorage.setItem("listToken", base64Token);
    }
    const dlcList = Object.values(dlcs_tk); //list to be displayed

    return (
      <ChakraProvider theme={theme}>
        <Container maxW="container.md" py={8}>
          <VStack spacing={6}>
            <Heading as="h1" size="xl">
              Cities Skylines - Cream Generator
            </Heading>
            <Box
              bg="white"
              shadow="md"
              borderRadius="lg"
              p={6}
              w="full"
              border="1px solid black"
            >
              <VStack align="stretch" spacing={4}>
                <Box maxH="400px" overflowY="auto">
                  <CheckboxGroup
                    colorScheme="blackAlpha"
                    value={selectedDLCs}
                    onChange={setSelectedDLCs}
                  >
                    <VStack align="stretch" spacing={2}>
                      {dlcList.map((dlc) => (
                        <Checkbox key={dlc} value={dlc}>
                          {dlc}
                        </Checkbox>
                      ))}
                    </VStack>
                  </CheckboxGroup>
                </Box>
                <Button
                  onClick={handleGenerate}
                  isDisabled={selectedDLCs.length === 0 || loading}
                >
                  {loading ? <Spinner size="sm" /> : `Generate (${selectedDLCs.length} selected)`}
                </Button>
              </VStack>
            </Box>
            {showDownloadButton && (
              <Button
                id="download-button"
                onClick={handleDownload}
                size="lg"
                variant="solid"
                borderRadius="full"
              >
                Download File
              </Button>
            )}
          </VStack>
        </Container>
      </ChakraProvider>
    );
  }
}

export default App;
