import fs from 'fs';
import path from 'path';
import { exec } from "child_process";

const addLintIgnoreToSchema = (loc: string) => {
    const data = fs.readFileSync(loc)
    const fd = fs.openSync(loc, 'w+')
    const insert = Buffer.from("/* eslint-disable */\n")
    fs.writeSync(fd, insert, 0, insert.length, 0)
    fs.writeSync(fd, data, 0, data.length, insert.length)
    fs.close(fd, (err) => {
    if (err) throw err;
    });
}

const buildSchema = (schema_loc: string) => {
    const out =`${schema_loc}`.replace('.json','.js');
    exec(`node node_modules/ajv-cli/dist/index.js compile -c ajv-formats --strict=true --coerce-types=array --all-errors=true --use-defaults=empty --messages=true --data -s ${schema_loc} -o ${out}`, (error, stdout, stderr) => {
        if (error) {
            throw error;
        }
        if (stderr) {
            throw stderr;
        }
        addLintIgnoreToSchema(out)
        console.log(stdout);
    });
}

const getAllSchemas = function(dirPath: string, arrayOfFiles=[]) {
    const files = fs.readdirSync(dirPath)  
    files.forEach(function(file) {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles = getAllSchemas(dirPath + "/" + file, arrayOfFiles)
      } else {
        
        if (file === 'validation.json')
            // arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
            buildSchema(path.join(__dirname, dirPath, "/", file))
      }
    })
  
    return arrayOfFiles
}

getAllSchemas('src')