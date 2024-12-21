import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";  // Correct path to firebase.js

const AddDengueData = () => {
  const [location, setLocation] = useState("");
  const [cases, setCases] = useState("");
  const [deaths, setDeaths] = useState("");
  const [date, setDate] = useState("");
  const [region, setRegion] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "dengueData"), {
        location,
        cases: Number(cases),
        deaths: Number(deaths),
        date,
        region,
      });
      setLocation("");
      setCases("");
      setDeaths("");
      setDate("");
      setRegion("");
      alert("Data added successfully!");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-md shadow-md">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add Dengue Data</h2>
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
        className="block w-full mb-4 px-4 py-2 border rounded-lg text-sm"
      />
      <input
        type="number"
        placeholder="Cases"
        value={cases}
        onChange={(e) => setCases(e.target.value)}
        required
        className="block w-full mb-4 px-4 py-2 border rounded-lg text-sm"
      />
      <input
        type="number"
        placeholder="Deaths"
        value={deaths}
        onChange={(e) => setDeaths(e.target.value)}
        required
        className="block w-full mb-4 px-4 py-2 border rounded-lg text-sm"
      />
      <input
        type="date"
        placeholder="Date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        className="block w-full mb-4 px-4 py-2 border rounded-lg text-sm"
      />
      <input
        type="text"
        placeholder="Region"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        required
        className="block w-full mb-4 px-4 py-2 border rounded-lg text-sm"
      />
      <button
        type="submit"
        className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700"
      >
        Add Data
      </button>
    </form>
  );
};

export default AddDengueData;
