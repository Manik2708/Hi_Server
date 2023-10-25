import express from 'express'
import http from 'http'

export function getTestServerInsatnce(): ServerProperties|null{
   try{
    const app=express();
    app.use(express.json())
    const server=http.createServer(app);
    server.listen(3001,()=>{
        console.log('main test server is running')
    })
    return {
        app: app,
        server: server
    };
   }catch(e:any){
    console.log('Error in main test server'+e.toString())
    return null
   }
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