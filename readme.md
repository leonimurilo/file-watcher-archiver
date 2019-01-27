# file-watcher-archiver

This project consists in a set composed by:
  - A watcher that checks whether the files of a specific directory changed
  - A mongo db connection that saves on a collection some meta data of a file every single time the file suffers changes on the specified directory (insert, update and delete)
  - A cron based scheduler that checks every N seconds (default is 30sec) if a file is too old (older than 5 days) and update the 'archived' field to true if the file is old
  - Two simple express routes that returns the active files and the archived ones, respectively
  
  Tested on a directory with 45k files

# How to run
1 - Update config/default.json file with:
* watchDirectory: The directory you want the program to watch
* mongoURI: Your mongo db connection URI
(Note: in this case I am using a simple connection string with no authentication. If your string has sensitive data, take the necessary measures to protect it and do not commit it)

2 - Install the dependencies (node.js 8.9 required)
```shell
$ npm install
```

3 - Run the project
```shell
$ npm start
```
(Note: If you don't want nodemon running, please run node server/app.js)

4 - Play with the files
You can add files (even nested) to the choosen directory.
You can delete and update them.
If you restart the app, it should detect the changes even if they didn't happen while the app is running.

You can also see the json files in the mongoDB collection while the changes happens.

5 - Test the APIs
There should be two apis available:
- GET localhost:9999/files/archived
- GET localhost:9999/files/active

You can use something like Postman or even a web browser to perform the requests

