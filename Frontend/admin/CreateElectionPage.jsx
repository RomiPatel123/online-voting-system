import React, { useState } from "react";
import {
  Users,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  Shield,
  Info
} from "lucide-react";

export default function CreateElectionPage() {
  const [candidates, setCandidates] = useState([
    {
      name: "Dr. Sarah Jenkins",
      position: "Incumbent Director",
      bio: "Dr. Jenkins has served for 4 years with a focus on sustainable growth."
    },
    {
      name: "Marcus Thorne",
      position: "Strategy Consultant",
      bio: "Bringing over 15 years of corporate strategy and board management experience."
    }
  ]);

  const addCandidate = () => {
    setCandidates([
      ...candidates,
      { name: "", position: "", bio: "" }
    ]);
  };

  const removeCandidate = (index) => {
    const updated = [...candidates];
    updated.splice(index, 1);
    setCandidates(updated);
  };

  const updateCandidate = (index, field, value) => {
    const updated = [...candidates];
    updated[index][field] = value;
    setCandidates(updated);
  };

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm flex flex-col justify-between">
        <div>
          <div className="p-6 text-xl font-bold text-blue-600">
            VoterChain
            <p className="text-xs text-gray-400">ADMIN WORKSPACE</p>
          </div>

          <nav className="space-y-2 mt-6">
            <div className="px-6 py-3 hover:bg-gray-100 cursor-pointer">
              Manage Voters
            </div>

            <div className="px-6 py-3 bg-blue-600 text-white rounded-lg mx-3 cursor-pointer">
              Manage Elections
            </div>

            <div className="px-6 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <BarChart3 size={18} />
              Results & Analytics
            </div>

            <div className="px-6 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <Settings size={18} />
              System Settings
            </div>
          </nav>
        </div>

        <div className="p-6 border-t">
          <p className="font-semibold">Alex Rivera</p>
          <p className="text-sm text-gray-500">Chief Admin</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-gray-500 text-sm">Elections / Setup New Election</p>
            <h1 className="text-3xl font-bold">Create New Election</h1>
          </div>

          <div className="flex gap-4">
            <button className="bg-gray-200 px-4 py-2 rounded-lg">
              Save Draft
            </button>
            <button className="bg-blue-600 text-white px-5 py-2 rounded-lg">
              Preview & Launch
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Info size={18} className="text-blue-600" />
            <h2 className="font-semibold text-lg">Basic Information</h2>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Election Title"
              className="w-full border rounded-lg px-3 py-2"
            />

            <div className="grid grid-cols-2 gap-4">
              <input type="datetime-local" className="border rounded-lg px-3 py-2" />
              <input type="datetime-local" className="border rounded-lg px-3 py-2" />
            </div>

            <textarea
              placeholder="Description / Instructions"
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-blue-600" />
            <h2 className="font-semibold text-lg">Eligibility Criteria</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select className="border rounded-lg px-3 py-2">
              <option>Full Membership List (All)</option>
            </select>

            <select className="border rounded-lg px-3 py-2">
              <option>Two-Factor Email Auth</option>
            </select>
          </div>

          <div className="bg-blue-50 text-blue-600 text-sm p-3 rounded-lg mt-4">
            Once published, eligibility criteria cannot be changed.
          </div>
        </div>

        {/* Candidates Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Candidates</h2>
            <button
              onClick={addCandidate}
              className="flex items-center gap-2 text-blue-600"
            >
              <Plus size={18} /> Add Candidate
            </button>
          </div>

          {candidates.map((candidate, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={candidate.name}
                  onChange={(e) => updateCandidate(index, "name", e.target.value)}
                  placeholder="Full Name"
                  className="border rounded-lg px-3 py-2"
                />
                <input
                  type="text"
                  value={candidate.position}
                  onChange={(e) => updateCandidate(index, "position", e.target.value)}
                  placeholder="Position / Title"
                  className="border rounded-lg px-3 py-2"
                />
              </div>

              <textarea
                value={candidate.bio}
                onChange={(e) => updateCandidate(index, "bio", e.target.value)}
                placeholder="Candidate Bio"
                className="border rounded-lg px-3 py-2 w-full mt-3"
                rows={2}
              />

              <button
                onClick={() => removeCandidate(index)}
                className="text-red-500 mt-2 flex items-center gap-1"
              >
                <Trash2 size={16} /> Remove
              </button>
            </div>
          ))}

          <div
            onClick={addCandidate}
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
          >
            <Plus className="mx-auto mb-2 text-gray-400" />
            Add Another Candidate
          </div>
        </div>

        {/* Publish Section */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
          <p className="text-yellow-600">Unsaved Changes Present</p>

          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
            Publish Election
          </button>
        </div>

      </div>
    </div>
  );
}
