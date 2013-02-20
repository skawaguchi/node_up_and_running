var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

var rssWarn = 12 * 1024 * 1024;
var heapWarn = 10 * 1024 * 1024;

var workers = {};

if (cluster.isMaster) {
  
  console.log('Number of CPUs detected: ' + numCPUs);
  
  for (var i = 0; i < numCPUs; i += 1) {
    createWorker();
  }
  
  setInterval(function () {
    var time = new Date().getTime();
    for (pid in workers) {
      
      if (workers.hasOwnProperty(pid) && workers[pid].lastCb + 5000 < time) {
        console.log('Long running worker ' + pid + ' killed');
        
        workers[pid].worker.destroy(); // method name changed
        delete workers[pid];
        createWorker();
      }
    }
  }, 1000);
  
} else {
  http.Server(function (req, res) {
    if (Math.floor(Math.random() * 200) === 4) {
      console.log('Stopped ' + process.pid + ' from ever finishing');
      while (true) {
        continue;
      }
    }
    
    // Worker processes have a http server
    res.writeHead(200);
    res.end('Hello world\n');
  }).listen(8000);
  
  //Report stats once / second
  setInterval(function report() {
    process.send({
      memory: process.memoryUsage(), 
      process: process.pid
    });
  }, 1000);
}

function createWorker() {
  var worker = cluster.fork();
  console.log('Create worker: ' + worker.process.pid);
  // allow boot time
  workers[worker.process.pid] = {
    worker: worker,
    lastCb: new Date().getTime() - 1000
  }
  
  worker.on('message', function (m) {
    if (m.cmd === 'reportMem') {
      workers[m.process].lastCb = new Date().getTime();
      if (m.memory.rss > rssWarn) {
        console.log('Worker ' + m.process + ' using too much memory.');
      }
    }
  });
}