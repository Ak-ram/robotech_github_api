import { useEffect, useState } from "react";
import { fetchJsonData } from "@/helpers/getJSONData";
import { updateJsonFile } from "@/helpers/updateJSONData";
import { Check, X, Trash, Edit, Link, Plus } from "lucide-react";

const AdminFaq = () => {
  const [jsonArray, setJsonArray] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editedItem, setEditedItem] = useState<any>({
    id: "",
    question: "",
    answer: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchJsonData("robotech/pages/faq.json");
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
      id: "",
      question: "",
      answer: "",
    });
    setError(null); // Reset error state
  };

  const handleRemoveItem = async (index: number) => {
    const updatedArray = [...jsonArray];
    updatedArray.splice(index, 1);

    try {
      await updateJsonFile("robotech/pages/faq.json", updatedArray);
      setJsonArray(updatedArray);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleEditClick = (index: number) => {
    setEditIndex(index);
    setEditedItem({ ...jsonArray[index] });
  };

  const handleEditSubmit = async () => {
    // Check for empty fields
    if (
      !editedItem.id ||
      !editedItem.question ||
      !editedItem.answer
    ) {
      setError("All fields are required");
      return;
    }

    if (editIndex !== null) {
      let updatedArray;

      if (editIndex === -1) {
        // Add a new item
        updatedArray = [...jsonArray, editedItem];
      } else {
        // Update an existing item
        updatedArray = jsonArray.map((item, index) =>
          index === editIndex ? editedItem : item
        );
      }

      try {
        await updateJsonFile("robotech/pages/faq.json", updatedArray);
        setJsonArray(updatedArray);
        setEditIndex(null);
        setError(null); // Reset error state
      } catch (error) {
        setError((error as Error).message);
      }
    }
  };

  const handleEditCancel = () => {
    setEditIndex(null);
    setEditedItem({});
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    setEditedItem((prev) => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <div className={`lg:p-3 w-full z-10 bottom-0 left-0 lg:relative overflow-hidden mt-5`}>
      <h2 className="font-bold mb-4">Current FAQ data:</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-zinc-800 text-white ">
              <th className="border px-4 py-2">Id</th>
              <th className="border px-4 py-2">Question</th>
              <th className="border px-4 py-2">Answer</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jsonArray.map((item, index) => (
              <tr key={index} className="hover:bg-slate-100">
                <td className="border px-4 py-2">{item.id}</td>
                <td className="border px-4 py-2">{item.question}</td>
                <td className="border px-4 py-2">{item.answer}</td>
                <td className="border px-2 py-2">
                  <button
                    className="mr-1"
                    onClick={() => handleEditClick(index)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="mr-1"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editIndex !== null && (
        <div className="mt-5">
          <h2 className="font-bold mb-2">
            {editIndex === -1 ? "Add New Item" : "Edit Item"}
          </h2>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <div className="flex flex-col lg:flex-row">
            <div className=" mb-2 lg:pr-4">
              <input
                type="text"
                placeholder="ID"
                className="w-full p-2 border border-gray-300 rounded"
                value={editedItem.id}
                onChange={(e) => handleInputChange(e, "id")}
              />
            </div>
            <div className=" mb-2 lg:pr-4">
              <input
                type="text"
                placeholder="Question"
                className="w-full p-2 border border-gray-300 rounded"
                value={editedItem.question}
                onChange={(e) => handleInputChange(e, "question")}
              />
            </div>
            <div className="lg:w-1/4 mb-2 lg:pr-4">
              <input
                type="text"
                placeholder="Answer"
                className="p-2 w-full border border-gray-300 rounded"
                value={editedItem.answer}
                onChange={(e) => handleInputChange(e, "answer")}
              />
            </div>
            
          </div>
          <div className="flex">
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
      )}

      <div className="mt-5">
        <button
          className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={handleAddItemClick}
        >
          <Plus size={18} className="mr-1" />
          Add Item
        </button>
      </div>
    </div>
  );
};

export default AdminFaq;