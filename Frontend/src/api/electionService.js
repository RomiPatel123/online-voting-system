const BASE_URL = "/api/elections";

const getHeaders = (token, isFormData = false) => {
    const headers = { Authorization: `Bearer ${token}` };
    if (!isFormData) headers["Content-Type"] = "application/json";
    return headers;
};

// 🌟 Public / Voter routes
export const getElections = async (token) => {
    const res = await fetch(BASE_URL, { headers: getHeaders(token) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch elections");
    return data;
};

export const getElectionById = async (id, token) => {
    const res = await fetch(`${BASE_URL}/${id}`, { headers: getHeaders(token) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch election details");
    return data;
};

export const getCandidates = async (id, token) => {
    const res = await fetch(`${BASE_URL}/${id}/candidates`, { headers: getHeaders(token) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch candidates");
    return data;
};

// 🛡️ Admin routes
export const createElection = async (electionData, token) => {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify(electionData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create election");
    return data;
};

export const updateElection = async (id, electionData, token) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: getHeaders(token),
        body: JSON.stringify(electionData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update election");
    return data;
};

export const startElection = async (id, token) => {
    const res = await fetch(`${BASE_URL}/${id}/start`, {
        method: "PUT",
        headers: getHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to start election");
    return data;
};

export const stopElection = async (id, token) => {
    const res = await fetch(`${BASE_URL}/${id}/stop`, {
        method: "PUT",
        headers: getHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to stop election");
    return data;
};

export const getElectionResults = async (id, token) => {
    const res = await fetch(`${BASE_URL}/${id}/results`, { headers: getHeaders(token) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch results");
    return data;
};

export const deleteElection = async (id, token) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: getHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete election");
    return data;
};

export const addCandidate = async (id, formData, token) => {
    const res = await fetch(`${BASE_URL}/${id}/candidates`, {
        method: "POST",
        headers: getHeaders(token, true), // isFormData = true
        body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to add candidate");
    return data;
};

export const getCandidateById = async (candidateId, token) => {
    const res = await fetch(`${BASE_URL}/candidates/${candidateId}`, { headers: getHeaders(token) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch candidate details");
    return data;
};

export const deleteCandidate = async (candidateId, token) => {
    const res = await fetch(`${BASE_URL}/candidates/${candidateId}`, {
        method: "DELETE",
        headers: getHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete candidate");
    return data;
};

export const updateCandidate = async (candidateId, formData, token) => {
    const res = await fetch(`${BASE_URL}/candidates/${candidateId}`, {
        method: "PUT",
        headers: getHeaders(token, true),
        body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update candidate");
    return data;
};
