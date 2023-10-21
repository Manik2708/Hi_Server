import express from 'express'
import http from 'http'

export function getTestServerInsatnce(): ServerProperties{
    const app=express();
    app.use(express.json())
    const server=http.createServer(app);
    server.listen(3001,()=>{})
    return {
        app: app,
        server: server
    };
}


export function closeTestServer(server: ServerProperties){
    server.server.close((err)=>{
        if(err){
            console.log(err.toString());
        }
    });
}

export interface ServerProperties{
    app:express.Express,
    server: http.Server
}