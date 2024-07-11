
import { useState, createContext, useContext, useEffect } from 'react';
import { getInternationalFacultyDetails, getNationalFacultyDetails, getChairperosnDetails } from '../utils/getData';

// Create a context for your data
const AllFacultyDataContext = createContext();

// Custom hook to use the data context
export const useAllFacultyData = () => useContext(AllFacultyDataContext);

export const FacultyDetailsProvider = ({ children }) => {
  const [loadingFaculty, setLoading] = useState(true);
  const [internationalFaculty, setInternationalFaculty] = useState([]);
  const [nationalFaculty, setNationalFaculty] = useState([]);
  const [chairperson, setChairperson] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const internationalFacultyDetails = await getInternationalFacultyDetails();
        const nationalFacultyDetails = await getNationalFacultyDetails();
        const chairpersonDetails = await getChairperosnDetails();
        setInternationalFaculty(internationalFacultyDetails);
        setNationalFaculty(nationalFacultyDetails);
        setChairperson(chairpersonDetails);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setInternationalFaculty([]);
        setNationalFaculty([]);
        setChairperson([]); // Set allEvents to an empty array on error
        setLoading(false); // Also, stop loading
      }
    })();
  }, []);

  return (
    <AllFacultyDataContext.Provider value={{ internationalFaculty, nationalFaculty, chairperson, loadingFaculty }}>
      {children}
    </AllFacultyDataContext.Provider>
  );
};
