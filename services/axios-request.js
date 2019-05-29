import axios from 'axios';
import 'isomorphic-fetch';
import { polyfill } from 'es6-promise';

polyfill();

//axios.defaults.withCredentials = true;

// Set config defaults when creating the instance
const axiosInstance = axios.create({});
// {Authentication: 'Bearer <JWT token>'}
const headers = {};

const handleResponseHeaders = (headers) => {

};

/**
 * Send request to he server
 * @param method {String} - Request method
 * @param config {Object} - data object
 */
const send = (method, config) => (
  axiosInstance({ ...config, method, headers })
    .then(response => {
      handleResponseHeaders(response.headers);
      return response.data;
    })
);

/**
 * Send get request to he server
 * @param url {String} - API address for the request
 * @param params {Object} - params object
 */
export const getRequest = (url, params = {}) => send('get', { url, params });

/**
 * Send post request to he server
 * @param url {String} - API address for the request
 * @param params {Object} - params object
 * @param data {Object} - data object
 */
export const postRequest = (url, params = {}, data = {}) => send('post', { url, params, data });

/**
 * Send put request to he server
 * @param url {String} - API address for the request
 * @param params {Object} - params object
 * @param data {Object} - data object
 */
export const putRequest = (url, params = {}, data = {}) => send('put', { url, params, data });

/**
 * Send delete request to he server
 * @param url {String} - API address for the request
 * @param params {Object} - params object
 */
export const deleteRequest = (url, params = {}) => send('delete', { url, params });
