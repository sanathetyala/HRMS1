import { useState,useEffect } from 'react';
import { FaPen, FaTrash, FaLessThan, FaRegWindowClose } from 'react-icons/fa';
import axios from 'axios';
import Navbar from './TravelNavbar';
import {Link} from 'react-router-dom';

const TravelDetails = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        passportNumber: '',
        issueDate: '',
        expireDate: '',
        placeOfIssue: '',
        countryOfIssue: '',
        issuingAuthority: ''
    });
    const [formErrors, setFormErrors] = useState({});

    const [tableData, setTableData] = useState([]);



    useEffect(() => {
      const fetchTravel = async () => {
          try {
              const response = await axios.get(`http://192.168.0.119:8080/employeeservice/travel/HRMS2`);
              const data = response.data;
              setFormData({
                passportNumber: data.passportNumber,
                issueDate: data.issueDate,
                expireDate: data.expireDate,
                placeOfIssue: data.placeOfIssue,
                countryOfIssue: data.country,
                issuingAuthority: data.issuingAuthority
              });
                console.log("Fetched data:", data);
            }  catch (error) {
              console.error('Error fetching National ID Details:', error);
            }
        };
      fetchTravel();
    }, []);

    const validateDates = (issueDate, expireDate) => {
      const issue = new Date(issueDate);
      const expire = new Date(expireDate);
      const twentyYearsLater = new Date(issue);
      twentyYearsLater.setFullYear(twentyYearsLater.getFullYear() + 20);

        if (issue >= expire) {
         return "Issue date must be earlier than Expiry date.";
        }
        if (expire > twentyYearsLater) {
         return "Expiry date must not exceed 20 years from Issue date.";
        }
       return "";
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'passportNumber') {
            const uppercaseValue = value.toUpperCase().replace(/[^A-Z0-9]/g,'');
            setFormData({ ...formData, [name]: uppercaseValue });
            setFormErrors({ ...formErrors, [name]: "" });
        }
        else{
            setFormData({ ...formData, [name]: value });
            setFormErrors({ ...formErrors, [name]: "" });
        }
    };

    // const formatDate = (dateString) => {
    //     const date = new Date(dateString);
    //     return date.toLocaleDateString('en-GB'); 
    // };

    const isDuplicatePassport = (passportNumber) => {
        return tableData.some(entry => entry.passportNumber === passportNumber);
    };

    
    const preventManualInput = (e) => {
          e.preventDefault();
    };

        // const handleAlphaInputChange = (e) => {
        //     const { name, value } = e.target;
        //     const regex = /^[a-zA-Z0-9\s]+$/; // Allow spaces between words
          
        //     // Remove leading or trailing spaces while allowing space between words
        //     if (regex.test(value)) {
        //       setFormData({ ...formData, [name]: value.trimStart().trimEnd() });
        //       setFormErrors({ ...formErrors, [name]: "" });
        //     } else {
        //       setFormErrors({ ...formErrors, [name]: "Only letters, numbers, and spaces between words are allowed." });
        //     }
        //   };
          
         
   
     const validateForm = () => {
        const errors = {};
        const passportNumberPattern = /^[A-Z]{1}[0-9]{7}$/;

        if (!formData.passportNumber) {
            errors.passportNumber = "Passport Number is required.";
        } else if (formData.passportNumber.length !== 8) {
            errors.passportNumber = "Passport Number must be 8 characters long.";
        } else if (!passportNumberPattern.test(formData.passportNumber)) {
            errors.passportNumber = "Passport Number should follow the format: A1234567.";
        } else if (isDuplicatePassport(formData.passportNumber) && !isEditMode) {
            errors.passportNumber = "Passport Number already exists.";
        }
        
        if (!formData.issueDate) errors.issueDate = "Issue Date is required.";
        if (!formData.expireDate) errors.expireDate = "Expiry Date is required.";


        if (!formData.placeOfIssue) {
          errors.placeOfIssue = "Place of Issue is required.";
        } else if (formData.placeOfIssue.length < 2 || formData.placeOfIssue.length > 40) {
          errors.placeOfIssue = "Place of Issue should be between 2 and 40 characters.";
        }

        if (!formData.countryOfIssue){
           errors.countryOfIssue = "Country of Issue is required.";
        } else if (formData.countryOfIssue.length < 2 || formData.countryOfIssue.length > 40) {
            errors.countryOfIssue = "Country of Issue should be between 2 and 40 characters.";
        }

        
        if (!formData.issuingAuthority){
          errors.issuingAuthority = "Issuing Authority is required.";
        } else if (formData.issuingAuthority.length < 2 || formData.issuingAuthority.length > 40) {
           errors.issuingAuthority = "Issuing Authority should be between 2 and 40 characters.";
        }
        
        const dateError = validateDates(formData.issueDate, formData.expireDate);

        if (dateError) {
            errors.expireDate = dateError;
        }
        
        return errors;
    };
    const handleEnter = (e)=>{
      if (e.key === "Enter"){
       e.preventDefault()
      }
   }
   
  const formatDate = (date) => {
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length === 0) {
      try {
       
        const payload = {
          passportNumber: formData.passportNumber,
          issueDate: formatDate(formData.issueDate), 
          expireDate: formatDate(formData.expireDate),  
          placeOfIssue: formData.placeOfIssue,
          country: formData.countryOfIssue,  
          issuingAuthority: formData.issuingAuthority
        };
  
        if (isEditMode) {
          await axios.patch(`http://192.168.0.111:8080/employeeservice/travel/${formData.passportNumber}`, payload);
          const updatedTableData = tableData.map((item) =>
            item.passportNumber === formData.passportNumber ? { ...payload } : item
          );
          setTableData(updatedTableData);
        } else {

          await axios.post(`http://192.168.0.119:8080/employeeservice/travel/createTravel?employeeId=HRMS2`, payload);
          setTableData([...tableData, payload]);
        }
  
        setIsPopupOpen(false);
        setIsEditMode(false);
        
        setFormErrors({});
        
      } catch (error) {
        if (error.response && error.response.data) {
         
          const backendErrors = error.response.data || [];
          const formErrors = {};
          
          if (backendErrors.includes("InvalidExpireDate")) {
            formErrors.expireDate = "Invalid Expiry Date";
          }
          if (backendErrors.includes("InvalidIssueDate")) {
            formErrors.issueDate = "Invalid Issue Date";
          }
          setFormErrors(formErrors);
        } else {
          console.error('Error saving travel details:', error);
        }
      }
    } else {
      setFormErrors(errors);
    }
  };
  
  const handleDelete = async (passportNumber) => {
    try {
      await axios.delete(`http://192.168.0.111:8080/employeeservice/travel/${passportNumber}`);
      const updatedTableData = tableData.filter((item) => item.passportNumber !== passportNumber);
      setTableData(updatedTableData);
    } catch (error) {
      console.error('Error deleting travel details:', error);
    }
  };

    const handleEdit = (index) => {
        setFormData({ ...tableData[index], index });
        setIsPopupOpen(true);
        setIsEditMode(true);
    };

    const handleCancel = () => {
        setIsPopupOpen(false);
        setIsEditMode(false);
        setFormData({
            passportNumber: '',
            issueDate: '',
            expireDate: '',
            placeOfIssue: '',
            countryOfIssue: '',
            issuingAuthority: ''
        });
        setFormErrors("");
    };

    return (

      <>
      <div><Navbar/></div>
      <div className="flex items-center justify-start px-2 py-2 overflow-x-auto border-2 border-gray-800 rounded-md w-40 ml-5 mb-5 mt-5">
                <FaLessThan className="text-orange-500 mr-2" />
              <Link to='/'><button><span className="text font-semibold text-orange-500">Previous Page</span></button></Link>  
        </div>
        <div className=" mr-48 ml-48 border border-black rounded-t-md">
            
            <div className="">
                <div className="bg-orange-500 text-white p-2 rounded-t-md flex justify-between items-center">
                    <h2 className="font-semibold">Travel Details</h2>
                    <button className="flex items-center text-black bg-green-500 px-2 py-1 rounded-lg" onClick={() => setIsPopupOpen(true)}>
                      Add
                    </button>
                </div>
                <div className="bg-white p-2 border-t border-gray-400">
                    <span className="font-semibold">Travel Details</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-400">
                        <thead>
                            <tr className="bg-gray-300">
                                <th className="border border-gray-400 px-4 py-2 w-1/6">Passport Number</th>
                                <th className="border border-gray-400 px-4 py-2 w-1/6">Issue Date</th>
                                <th className="border border-gray-400 px-4 py-2 w-1/6">Expire Date</th>
                                <th className="border border-gray-400 px-4 py-2 w-1/6">Place of Issue</th>
                                <th className="border border-gray-400 px-4 py-2 w-1/6">Country of Issue</th>
                                <th className="border border-gray-400 px-4 py-2 w-1/6">Issuing Authority</th>
                                {tableData.length >0 && <th className="border border-gray-400 px-4 py-2 w-1/6">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.length > 0 ? (
                                tableData.map((data, index) => (
                                    <tr key={index}>
                                        <td className="border border-gray-400 px-4 text-center py-2 ">{data.passportNumber}</td>
                                        <td className="border border-gray-400 px-4 text-center py-2">{data.issueDate}</td>
                                        <td className="border border-gray-400 px-4 text-center py-2">{formatDate(data.expireDate)}</td>
                                        <td className="border border-gray-400 px-4 text-center  py-2">{formatDate(data.placeOfIssue)}</td>
                                        <td className="border border-gray-400 px-4 text-center py-2">{data.countryOfIssue}</td>
                                        <td className="border border-gray-400 px-4 text-center py-2">{data.issuingAuthority}</td>
                                        <td className="border border-gray-400 px-4  py-2 ">
                                           <div className=' flex justify-center  items-center space-x-2 '>
                                              <FaPen  size={17}className="  inline cursor-pointer mr-2" onClick={() => handleEdit(index)}/>
                                             {index > 0 && (
                                              <FaTrash size={17} className="inline cursor-pointer" onClick={() => handleDelete(index)} />
                                              )}
                                            </div>
                                         </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">No Travel Details Added</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isPopupOpen && (
                <div className="bg-black fixed inset-0 flex items-center justify-center bg-opacity-50 ">
                    <div className="bg-gray-300 p-4 rounded-lg shadow-lg w-11/12 sm:w-3/4 lg:w-1/2">
                        <div className="flex justify-between items-center mb-8 bg-orange-500 rounded-lg pl-2 pr-2 w-full p-2">
                            <h2 className="text-xl w-full">{isEditMode ? 'Edit' : 'Add Travel Details'}</h2>
                            <FaRegWindowClose  size={24} className="text-black  text-xl cursor-pointer" onClick={handleCancel} />
                        </div>
                        <form onSubmit={handleSubmit} onKeyDown={handleEnter} >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
                                <div className="col-span-1 ">
                                    <label className="block mb-1">Passport Number</label>
                                    <input
                                        type="text"
                                        name="passportNumber"
                                        value={formData.passportNumber}
                                        onChange={handleInputChange}
                                        minLength={8}
                                        maxLength={8}
                                        style={{ textTransform: 'uppercase'}}
                                        
                                        className="w-full p-1 border border-gray-300 rounded-lg"
                                    />
                                    {formErrors.passportNumber && <span className="text-red-600 text-sm mt-1">{formErrors.passportNumber}</span>}
                                </div>
                                <div className="col-span-1 ">
                                    <label className="block mb-1">Issue Date</label>
                                    <input
                                        type="date"
                                        name="issueDate"
                                        value={formData.issueDate}
                                        onChange={handleInputChange}
                                        onKeyDown={preventManualInput}
                                        className="w-full p-1 border border-gray-300 rounded-lg"
                                    />
                                    {formErrors.issueDate && <span className="text-red-600 text-sm mt-1">{formErrors.issueDate}</span>}
                                </div>
                                <div className="col-span-1 ">
                                    <label className="block mb-1">Expire Date</label>
                                    <input
                                        type="date"
                                        name="expireDate"
                                        value={formData.expireDate}
                                        onChange={handleInputChange}
                                        onKeyDown={preventManualInput}
                                        className="w-full p-1 border border-gray-300 rounded-lg"
                                    />
                                    {formErrors.expireDate && <span className="text-red-600 text-sm mt-1">{formErrors.expireDate}</span>}
                                </div>
                                <div className="col-span-1 ">
                                    <label className="block mb-1">Place of Issue</label>
                                    <input
                                        type="text"
                                        name="placeOfIssue"
                                        value={formData.placeOfIssue}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^(?!\s)[A-Za-z\s]*$/.test(value)){
                                                setFormData({ ...formData, placeOfIssue: value });
                                                setFormErrors({ ...formErrors, placeOfIssue: "" });
                                            }
                                        }}
  
                                        className="w-full p-1 border border-gray-300 rounded-lg"
                                    />
                                    {formErrors.placeOfIssue && <span className="text-red-600 text-sm mt-1">{formErrors.placeOfIssue}</span>}
                                </div>
                                <div className="col-span-1 ">
                                    <label className="block mb-1">Country of Issue</label>
                                    <input
                                        type="text"
                                        name="countryOfIssue"
                                        value={formData.countryOfIssue}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^(?!\s)[A-Za-z\s]*$/.test(value)) {
                                                setFormData({ ...formData, countryOfIssue: value });
                                                setFormErrors({ ...formErrors, countryOfIssue: "" });
                                            }
                                        }}
                                        className="w-full p-1 border border-gray-300 rounded-lg"
                                    />
                                    {formErrors.countryOfIssue && <span className="text-red-600 text-sm mt-1">{formErrors.countryOfIssue}</span>}
                                </div>
                                <div className="col-span-1 ">
                                    <label className="block mb-1">Issuing Authority</label>
                                    <input
                                        type="text"
                                        name="issuingAuthority"
                                        value={formData.issuingAuthority}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^(?!\s)[A-Za-z\s]*$/.test(value)) {
                                                setFormData({ ...formData, issuingAuthority: value });
                                                setFormErrors({ ...formErrors, issuingAuthority: "" });
                                            }
                                        }}
                                        className="w-full p-1 border border-gray-300 rounded-lg"
                                    />
                                    {formErrors.issuingAuthority && <span className="text-red-600 text-sm mt-1">{formErrors.issuingAuthority}</span>}
                                </div>
                            </div>
                            <div className=" mt-4 flex justify-end space-x-2">
                              <button  type='submit' className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 mr-3 ">
                                 {isEditMode ? 'Update' : 'Save'}
                              </button>
                              <button  onClick={handleCancel} className='bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 mr-3 '>Cancel
                                </button>   
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default TravelDetails;