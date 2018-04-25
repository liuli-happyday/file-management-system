
const os = require('os');

let IPv4, hostName;
hostName=os.hostname();

const netList = os.networkInterfaces().WLAN || os.networkInterfaces().eth0

netList.forEach((item) => {
  if(item.family === 'IPv4'){
    IPv4=item.address;
  }
});

// console.log(os.networkInterfaces());
// console.log(netList);
// console.log('----------local IP: ' + IPv4);
// console.log('----------local host: ' + hostName);


const arr = [1,2,3,4,5,6,7,8,9,0];

let i, length = arr.length;
for (i = 0; i < length; i++) {
  const item = arr[i];
  console.log(item);
  if (item === 3) {
    arr.splice(i, 1);
    i--;
    length = arr.length;
    continue;
  }
  if(item===6) {
    arr[i] = 60;
  }
}

console.log(arr);

