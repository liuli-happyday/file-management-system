
const loc = window.location;
const prefix = loc.protocol + '//' + loc.host;

export default {
  // baseUrl: 'http://192.168.100.11:3000'
  // baseUrl: 'http://localhost:3000'
  // baseUrl: 'http://sat01-file-management-system.myuangxpress.com:4000',
  baseUrl: prefix,
};
