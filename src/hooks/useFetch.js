import { useState, useEffect } from 'react';

// useFetchCS fetches DLC IDs
const useFetchCS = () => {
  const [data, setData] = useState(null);    // Store the data from the API
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null);   // Track error state

  const url = "http://localhost:5000/api/getDetailCS";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

const useFetchDLCs = (ids) => {
  const [dlcs, setDlcs] = useState({});
  const [loadingDLCs, setLoadingDLCs] = useState(true);
  const [errorDLCs, setErrorDLCs] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      console.log("gonna fetch data");
      try {
        setLoadingDLCs(true);
        const promises = ids.map(async (id) => {
          const url = `http://localhost:5000/api/getDetailDLC/${id}`;
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch data for ID: ${id}`);
          }
          const result = await response.json();
          return { id, name: result[id]?.data?.name };
        });

        const results = await Promise.all(promises);

        const dlcsObject = results.reduce((acc, { id, name }) => {
          acc[id] = name;
          return acc;
        }, {});
        setDlcs(dlcsObject);
      } catch (err) {
        setErrorDLCs(err.message);
      } finally {
        setLoadingDLCs(false);
      }
    };

    if (ids.length > 0) {
      fetchData();
    }
  }, [ids]);
  return { dlcs, loadingDLCs, errorDLCs };
};

export { useFetchCS, useFetchDLCs };
