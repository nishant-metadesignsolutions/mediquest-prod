
import { useState, createContext, useContext, useEffect } from 'react';
import { getCountry, getState, getCity } from '../utils/getData';

// Create a context for your data
const AllLocationDataContext = createContext();

// Custom hook to use the data context
export const useAllLoactionData = () => useContext(AllLocationDataContext);

export const LocationDetailsProvider = ({ children }) => {
  const [loadingLocation, setLoading] = useState(true);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const country = await getCountry();
        const state = await getState();
        const city = await getCity();
        setCountryList(country);
        setStateList(state);
        setCityList(city);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setCountryList([]);
        setStateList([]);
        setCityList([]); // Set allEvents to an empty array on error
        setLoading(false); // Also, stop loading
      }
    })();
  }, []);

  return (
    <AllLocationDataContext.Provider value={{ countryList, stateList, cityList, loadingLocation }}>
      {children}
    </AllLocationDataContext.Provider>
  );
};
