import { useEffect, useState } from "react";
import { fetchJsonData } from "@/helpers/getJSONData";
import { updateJsonFile } from "@/helpers/updateJSONData";
import { Check, X, Plus, TrashIcon, Edit, PhoneCall, User } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { v4 as uuidv4 } from 'uuid';
import { CourseType, ProductType } from "../../type";
import Link from 'next/link'
import NoContent from "./NoContent";
import supabase from "@/supabase/config";
const AdminCustomers = () => {
    const [jsonArray, setJsonArray] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');



    const dataArrayWithoutId = jsonArray.map(obj => {
        const { id, ...rest } = obj;
        return rest;
    });

    // Function to insert data into Supabase table
    async function insertDataIntoSupabase() {
        try {
            console.log(dataArrayWithoutId)
            const { data: insertedData, error } = await supabase
                .from('customers')
                .insert(dataArrayWithoutId);
            if (error) {
                console.error('Error inserting data:', error.message);
            } else {
                console.log('Data inserted successfully:', insertedData);
            }
        } catch (error) {
            console.error('Error inserting data:', (error as Error).message);
        }
    }

    // Call the function to insert data into Supabase
    insertDataIntoSupabase();

    // Call the function to insert data into Supabase
    insertDataIntoSupabase();




    interface CustomerType {
        id: string;
        fullName: string;
        phone: string;
        address: string;
        faculty: string;
        age: number;
        total_purchase_transactions: number;
        transactions: {};
    }

    const [editedItem, setEditedItem] = useState<CustomerType>({
        id: "",
        fullName: "",
        phone: "",
        address: "",
        faculty: "",
        age: 0,
        total_purchase_transactions: 0,
        transactions: {
            products: [],
            courses: [],
            printServices: [],
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchJsonData("robotech/pages/customers.json");
                setJsonArray(data);
            } catch (error) {
                setError((error as Error).message);
            }
        };

        fetchData();
    }, []);

    const handleAddItemClick = () => {
        setEditIndex(-1); // Use -1 to indicate a new item
        setEditedItem({
            id: uuidv4(),
            fullName: "",
            phone: "",
            age: 0,
            address: "",
            faculty: "",
            total_purchase_transactions: 0,
            transactions: {
                products: [],
                courses: [],
                printServices: [],
            }
        });
        setError(null); // Reset error state
        setSearchTerm('');
    };

    const handleEditClick = (customerId: string) => {
        const index = jsonArray.findIndex(item => item.id === customerId);
        setEditIndex(index);
        setEditedItem({ ...jsonArray[index] });
        // setSearchTerm('');
    };

    const handleRemoveItem = async (customerId: string) => {

        let confirmDel = window.confirm('Deleting this customer will also remove associated data such as transactions, products, courses, and print services purchased, impacting the stats page.')
        if (confirmDel) {
            const index = jsonArray.findIndex(item => item.id === customerId);
            if (index === -1) return; // Customer not found
            const updatedArray = [...jsonArray];
            updatedArray.splice(index, 1);

            try {
                await updateJsonFile("robotech/pages/customers.json", updatedArray);
                setJsonArray(updatedArray);
                toast.success('Customer removed successfully');
                toast.loading(`Be patient, changes take a few moments to be reflected`);
                setTimeout(() => {
                    toast.dismiss();
                }, 5000);
            } catch (error) {
                setError((error as Error).message);
            }
        }
    };


    const handleEditSubmit = async () => {
        // Check for empty fields
        if (
            !editedItem.id ||
            !editedItem.fullName ||
            !editedItem.phone ||
            !editedItem.age
        ) {
            toast.error("All fields are required");
            return;
        }

        // Validate full name (each word should have at least 3 characters)
        const fullNameWords = editedItem.fullName.trim().split(' ');
        if (fullNameWords.length < 2 || fullNameWords.some(word => word.trim().length < 3)) {
            toast.error("Each word in the full name should have at least 3 characters");
            return;
        }

        // Validate Age format
        if (editedItem.age > 60) {
            toast.error("Max Age is 60");
            return;
        }


        // Validate Age format
        if (editedItem.age < 10) {
            toast.error("Min Age is 10");
            return;
        }

        // Validate phone number format
        const phoneRegex = /^(01[0-9]{9})$/;
        if (!phoneRegex.test(editedItem.phone)) {
            toast.error("Invalid phone number format. It should start with '01' and have 11 digits.");
            return;
        }

        if (editIndex !== null) {
            try {
                let updatedArray;

                if (editIndex === -1) {
                    // Add a new item without overwriting existing ones
                    updatedArray = [...jsonArray, editedItem];
                } else {
                    // Update an existing item without overwriting existing ones
                    updatedArray = jsonArray.map((item, index) =>
                        index === editIndex ? editedItem : item
                    );
                }

                await updateJsonFile("robotech/pages/customers.json", updatedArray);
                setJsonArray(updatedArray);
                setEditIndex(null);
                toast.success(editIndex === -1 ? 'Customer added successfully' : 'Customer updated successfully');
                toast.loading(`Be patient, changes take a few moments to be reflected`);
                setTimeout(() => {
                    toast.dismiss();
                }, 5000);
            } catch (error) {
                toast.error((error as Error).message);
            }
        }


    };

    const handleEditCancel = () => {
        setEditIndex(null);
        setEditedItem({} as CustomerType); // Cast to CustomerType
    };



    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        key: string
    ) => {
        setEditedItem((prev) => ({ ...prev, [key]: e.target.value }));
    };

    return (
        <div className={`min-h-[400px] lg:p-3 w-full bottom-0 left-0 lg:relative overflow-hidden mt-5`}>

            {!jsonArray && <h2 className="font-bold mb-4">Current Customer data:</h2>}

            <div className="mb-5 flex flex-col lg:flex-row items-center justify-between">
                <input
                    type="text"
                    placeholder="Search By Name, Phone"
                    className="text-black mb-2 p-2 border border-gray-300 rounded w-full lg:w-[60%] focus:outline-none focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="flex items-end space-x-4 mb-2 lg:mb-0">
                    <button
                        className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-all duration-300"
                        onClick={handleAddItemClick}
                    >
                        <Plus size={18} className="mr-1" />
                        Add Customer
                    </button>

                </div>


            </div>
            {searchTerm.length >= 3 && jsonArray.length !== 0 ? (
                <div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
                    {jsonArray
                        .filter((item) => {
                            const fullName = item.fullName.toLowerCase();
                            const phone = item.phone.toLowerCase();
                            const search = searchTerm.toLowerCase();
                            return fullName.includes(search) || phone.includes(search);
                        })
                        .map((item, index) => (
                            <div
                                key={index}
                                className={`border border-zinc-300 p-4 rounded-lg bg-white shadow-md transition-all duration-300 transform 
                            `}
                            >
                                <Link key={index} href={{
                                    pathname: `admin/id_${item?.id}`,
                                    query: {
                                        id: item?.id,
                                        data: JSON.stringify(item)
                                    },
                                }} className={`block`}>

                                    <span className="block font-bold mb-2 text-xl rtl" dir="rtl">{item.fullName}</span>
                                    <span className="block text-gray-600 mb-2 flex items-end gap-1" dir="rtl"><PhoneCall className="mb-[1px]" size={14} /> رقم التليفون: {item.phone}</span>
                                    <span className="block text-gray-600 mb-2 flex items-center gap-1" dir="rtl"><User size={15} /> العمر: {item.age}</span>
                                </Link>
                                <div className="flex justify-end">
                                    <button
                                        className="flex gap-1 items-center  bg-blue-100 py-1 px-2 rounded text-blue-500 hover:text-blue-600 mr-2 transition-colors duration-300"
                                        onClick={() => handleEditClick(item.id)}
                                    >
                                        <Edit size={17} />    Edit
                                    </button>
                                    <button
                                        className="flex gap-1 items-center bg-red-100 py-1 px-2 rounded text-red-500 hover:text-red-600 transition-colors duration-300"
                                        onClick={() => handleRemoveItem(item.id)}
                                    >
                                        <TrashIcon size={17} />  Remove
                                    </button>
                                </div>
                            </div>
                        ))
                    }
                </div >
            ) : <div className="bg-white h-[300px] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-4">Your Search Result Goes here...</h2>
                </div>
            </div>}

            {
                editIndex !== null && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white w-[500px] p-8 rounded-lg shadow-md">

                                <h2 className="font-bold mb-2 text-center text-lg">
                                    {editIndex === -1 ? "Add New Customer" : "Edit Customer"}
                                </h2>
                                {error && <p className="text-red-500 mb-2">{error}</p>}
                                <div className="">
                                    <div className=" mb-2 lg:pr-4">
                                        <span className="font-bold mb-1">Full Name</span>

                                        <input
                                            type="text"
                                            placeholder="Akram Ashraf"
                                            className="w-full p-2 border border-gray-300 rounded"
                                            value={editedItem.fullName}
                                            onChange={(e) => handleInputChange(e, "fullName")}
                                        />
                                    </div>
                                    <div className=" mb-2 lg:pr-4">
                                        <span className="font-bold mb-1">Phone No.</span>

                                        <input
                                            type="text"
                                            placeholder="01XXXXXXXXX"
                                            className="p-2 w-full border border-gray-300 rounded"
                                            value={editedItem.phone}
                                            onChange={(e) => handleInputChange(e, "phone")}
                                        />
                                    </div>
                                    <div className=" mb-2 lg:pr-4">
                                        <span className="font-bold mb-1">Age</span>

                                        <input
                                            type="number"
                                            placeholder="20"

                                            className="p-2 w-full border border-gray-300 rounded"
                                            value={editedItem.age}
                                            onChange={(e) => handleInputChange(e, "age")}
                                        />
                                    </div>
                                    <div className=" mb-2 lg:pr-4">
                                        <span className="font-bold mb-1">Address</span>

                                        <input
                                            type="text"
                                            placeholder="شرق النيل, بني سويف, مصر"
                                            className="p-2 w-full border border-gray-300 rounded"
                                            value={editedItem.address}
                                            onChange={(e) => handleInputChange(e, "address")}
                                        />
                                    </div>
                                    <div className=" mb-2 lg:pr-4">
                                        <span className="font-bold mb-1">Faculty</span>
                                        <input
                                            type="text"
                                            placeholder="BS, Beni-Suef University"
                                            className="p-2 w-full border border-gray-300 rounded"
                                            value={editedItem.faculty}
                                            onChange={(e) => handleInputChange(e, "faculty")}
                                        />
                                    </div>
                                </div>
                                <div className="flex mt-5">
                                    <button
                                        className="flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2"
                                        onClick={handleEditSubmit}
                                    >
                                        <Check size={18} className="mr-1" />
                                        Save
                                    </button>
                                    <button
                                        className="flex items-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                                        onClick={handleEditCancel}
                                    >
                                        <X size={18} className="mr-1" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: "#000",
                        color: "#fff",
                    },
                }}
            />
        </div >
    );

};

export default AdminCustomers;