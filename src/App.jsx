import React, { useState, useEffect } from "react";
import CreamDetail from "./components/CreamDet";
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
  0% {
    transform: scale(1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  50% {
    transform: scale(1.01);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
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
          animation: `${hoverAnimation} 0.5s ease-in-out`,
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

const steam_cn = import.meta.env.VITE_KGUYSH_STEAM_CN_API;
function App() {
  const [inidata, setIniData] = useState(null);
  const [selectedDLCs, setSelectedDLCs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [dlcs, setDlcs] = useState({});
  const [dlcs_tk, setDlcsTk] = useState({});
  const [dlcs_val, setDlcsVal] = useState([]);
  const [loadingDLCs, setLoadingDLCs] = useState(true);
  const [errorDLCs, setErrorDLCs] = useState(null);
  const [showDownloadButton, setShowDownloadButton] = useState(false);

  const storedToken = localStorage.getItem("listToken");

  // Decode localStorage token if it exists
  useEffect(() => {
    if (storedToken) {
      const decodedList = JSON.parse(atob(storedToken));
      setDlcsTk(decodedList);
      setDlcsVal(Object.keys(decodedList));
      setLoadingDLCs(false);
    }
  }, [storedToken]);


  const { data: csData, loading: csLoading, error: csError } = !storedToken ? useFetchCS() : { data: null, loading: false, error: null };

  const { dlcs: fetchedDlcs, loading: dlcsLoading, error: dlcsError } = !storedToken ? useFetchDLCs(csData?.["255710"]?.data?.dlc || []) : { dlcs: {}, loading: false, error: null };


  useEffect(() => {
    if (fetchedDlcs && Object.keys(fetchedDlcs).length > 0) {
      setDlcs(fetchedDlcs);
      setDlcsTk(fetchedDlcs);
      setDlcsVal(Object.keys(fetchedDlcs));
      setLoadingDLCs(dlcsLoading);
      setErrorDLCs(dlcsError);

      const listString = JSON.stringify(fetchedDlcs);
      const base64Token = btoa(listString);
      localStorage.setItem("listToken", base64Token);
      window.location.reload();
    }
  }, [fetchedDlcs, dlcsLoading]);

  useEffect(() => {
    if (showDownloadButton) {
      document.getElementById("download-button")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [showDownloadButton]);

  const handleDownload = () => {
    generateCreamApid();
  };


  if (loadingDLCs) {
    return (
      <ChakraProvider theme={theme}>
        <Container maxW="container.md" py={8}>
          <Heading>Loading DLCs...</Heading>
          <Spinner size="lg" />
        </Container>
      </ChakraProvider>
    );
  }

  if (errorDLCs) {
    return (
      <ChakraProvider theme={theme}>
        <Container maxW="container.md" py={8}>
          <Heading>Error</Heading>
          <p>Failed to load DLC data: {errorDLCs.message}</p>
        </Container>
      </ChakraProvider>
    );
  }

  const dlcList = Object.values(dlcs_tk);

  const handleGenerate = () => {
    const selectedIDs = selectedDLCs.reduce((acc, dlcName) => {
      const key = Object.keys(dlcs_tk).find((key) => dlcs_tk[key] === dlcName);
      if (key) {
        acc[key] = dlcName;
      }
      return acc;
    }, {});

    setIniData(selectedIDs);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setShowDownloadButton(true);
    }, 2000);
  };

  const downloadFile = (content) => {
    const blob = new Blob([content], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'cream_api.ini';

    link.click();

    URL.revokeObjectURL(url);
  };

  const generateCreamApid = () => {

    fetch(`${steam_cn}/generate-creamapid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inidata })
    })
      .then(response => response.json())
      .then(data => {
        downloadFile(data.updatedContent);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  return (
    <ChakraProvider theme={theme}>
      <Container maxW="container.md" py={8}>
        <VStack spacing={6}>
          <Heading as="h1" size="xl">
            Cities Skylines - CreamAPI Generator
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
              <Checkbox
                isChecked={selectedDLCs.length === dlcList.length} // Check if all are selected
                isIndeterminate={
                  selectedDLCs.length > 0 && selectedDLCs.length < dlcList.length
                } // Show indeterminate state if not all selected but some are
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedDLCs(dlcList); // Select all
                  } else {
                    setSelectedDLCs([]); // Deselect all
                  }
                }}
              >
                Select All
              </Checkbox>
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
          <CreamDetail />
          {showDownloadButton && (
            <Button
              id="download-button"
              onClick={handleDownload}
              size="lg"
              bg="black"
              color="white"
              _hover={{
                bg: "gray.800",
                transform: "scale(1.05)",
                transition: "transform 0.2s ease-in-out",
              }}
              _active={{
                bg: "gray.900",
              }}
              borderRadius="md"
              fontWeight="semibold"
              boxShadow="lg"
              padding="1.5rem"
            >
              Download File (cream_api.ini)
            </Button>
          )}
        </VStack>
      </Container>
    </ChakraProvider >

  );
}


export default App;
