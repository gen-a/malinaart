import axios from 'axios';
import 'isomorphic-fetch';
import {polyfill} from 'es6-promise';
polyfill();

axios.defaults.withCredentials = true;

/**
 * Send request to he server
 * @param url {String} - API address for the request
 * @param data {Object} - data object
 */
export const get = (url, data) => (
  axios.get(url, { params: data })
    .then(response => response.data)
);
/**
 * Send request to he server
 * @param url {String} - API address for the request
 * @param data {Object} - data object
 */
export const post = (url, data) => (
  axios.post(url, data)
    .then(response => response.data)
);
/**
 * Send request to he server
 * @param url {String} - API address for the request
 * @param data {Object} - data object
 */
export const put = (url, data) => (
  axios.put(url, data)
    .then(response => response.data)
);




