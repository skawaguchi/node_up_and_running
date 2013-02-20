node_up_and_running
===================

Some of the code samples from the book Node.js: Up and Running that changed due to Node API changes. This is just my record of a few little annoying details that distracted me.

cluster.js
----------

I thought that this was a cool sample. However, a couple of API changes in 0.8 broke the book sample:
1. It seems that ``pid`` moved to ``worker.process.pid``
1. ``worker.kill()`` changed to ``worker.destroy()``

