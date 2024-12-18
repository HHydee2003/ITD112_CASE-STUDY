import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const DengueDataList = () => {
  const [dengueData, setDengueData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    location: "",
    cases: "",
    deaths: "",
    date: "",
    region: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [sortBy, setSortBy] = useState("location"); // Sorting criteria
  const [sortOrder, setSortOrder] = useState("asc"); // Sorting order

  useEffect(() => {
    const fetchData = async () => {
      const dengueCollection = collection(db, "dengueData");
      const dengueSnapshot = await getDocs(dengueCollection);
      const dataList = dengueSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Fetched Dengue Data:", dataList); // Log the fetched data to debug
      setDengueData(dataList);
      setFilteredData(dataList); // Initialize filteredData with the fetched data
    };

    fetchData();
  }, []);

  useEffect(() => {
    let updatedData = dengueData;

    // Search functionality
    if (searchTerm) {
      updatedData = updatedData.filter(data =>
        data.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by region
    if (selectedRegion) {
      updatedData = updatedData.filter(data =>
        data.region.toLowerCase() === selectedRegion.toLowerCase()
      );
    }

    // Sort data
    updatedData = updatedData.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortOrder === "asc" ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredData(updatedData);
  }, [searchTerm, selectedRegion, dengueData, sortBy, sortOrder]);

  const handleDelete = async (id) => {
    const dengueDocRef = doc(db, "dengueData", id);
    try {
      await deleteDoc(dengueDocRef);
      setDengueData(dengueData.filter((data) => data.id !== id));
      alert("Data deleted successfully!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleEdit = (data) => {
    setEditingId(data.id);
    setEditForm({
      location: data.location,
      cases: data.cases,
      deaths: data.deaths,
      date: data.date,
      region: data.region,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const dengueDocRef = doc(db, "dengueData", editingId);
    try {
      await updateDoc(dengueDocRef, {
        location: editForm.location,
        cases: Number(editForm.cases),
        deaths: Number(editForm.deaths),
        date: editForm.date,
        region: editForm.region,
      });
      setDengueData(dengueData.map((data) =>
        data.id === editingId ? { id: editingId, ...editForm } : data
      ));
      setEditingId(null);
      alert("Data updated successfully!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Get sorted regions
  const sortedRegions = [...new Set(dengueData.map(data => data.region))].sort();

  return (
    <div className="p-4 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4">Dengue Data List</h2>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Location"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="ml-2 p-2 border border-gray-300 rounded"
        >
          <option value="">Select Region</option>
          {sortedRegions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>

      {editingId ? (
        <form onSubmit={handleUpdate} className="mb-4">
          <input
            type="text"
            placeholder="Location"
            value={editForm.location}
            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
            required
            className="mb-2 p-2 border border-gray-300 rounded"
          />
          <input
            type="number"
            placeholder="Cases"
            value={editForm.cases}
            onChange={(e) => setEditForm({ ...editForm, cases: e.target.value })}
            required
            className="mb-2 p-2 border border-gray-300 rounded"
          />
          <input
            type="number"
            placeholder="Deaths"
            value={editForm.deaths}
            onChange={(e) => setEditForm({ ...editForm, deaths: e.target.value })}
            required
            className="mb-2 p-2 border border-gray-300 rounded"
          />
          <input
            type="date"
            placeholder="Date"
            value={editForm.date}
            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
            required
            className="mb-2 p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Region"
            value={editForm.region}
            onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
            required
            className="mb-2 p-2 border border-gray-300 rounded"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">Update Data</button>
          <button onClick={() => setEditingId(null)} className="ml-2 bg-gray-500 text-white p-2 rounded">Cancel</button>
        </form>
      ) : (
        <div className="overflow-y-auto max-h-[60vh]">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border-b">
                  <button onClick={() => handleSort("location")} className="flex items-center">
                    Location
                    {sortBy === "location" && (sortOrder === "asc" ? " ↑" : " ↓")}
                  </button>
                </th>
                <th className="p-2 border-b">
                  <button onClick={() => handleSort("cases")} className="flex items-center">
                    Cases
                    {sortBy === "cases" && (sortOrder === "asc" ? " ↑" : " ↓")}
                  </button>
                </th>
                <th className="p-2 border-b">
                  <button onClick={() => handleSort("deaths")} className="flex items-center">
                    Deaths
                    {sortBy === "deaths" && (sortOrder === "asc" ? " ↑" : " ↓")}
                  </button>
                </th>
                <th className="p-2 border-b">
                  <button onClick={() => handleSort("date")} className="flex items-center">
                    Date
                    {sortBy === "date" && (sortOrder === "asc" ? " ↑" : " ↓")}
                  </button>
                </th>
                <th className="p-2 border-b">
                  <button onClick={() => handleSort("region")} className="flex items-center">
                    Region
                    {sortBy === "region" && (sortOrder === "asc" ? " ↑" : " ↓")}
                  </button>
                </th>
                <th className="p-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((data) => (
                <tr key={data.id}>
                  <td className="p-2 border-b">{data.location}</td>
                  <td className="p-2 border-b">{data.cases}</td>
                  <td className="p-2 border-b">{data.deaths}</td>
                  <td className="p-2 border-b">{data.date}</td>
                  <td className="p-2 border-b">{data.region}</td>
                  <td className="p-2 border-b">
                    <button
                      onClick={() => handleEdit(data)}
                      className="bg-yellow-500 text-white p-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(data.id)}
                      className="bg-red-500 text-white p-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DengueDataList;
