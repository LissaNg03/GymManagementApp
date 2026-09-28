/** @format */

import api from "./api";

const login = async (email, password) => {
	const response = await api.post("/Auth/login", {
		email,
		password,
	});

	return response.data;
};

const authService = {
	login,
};

export default authService;
