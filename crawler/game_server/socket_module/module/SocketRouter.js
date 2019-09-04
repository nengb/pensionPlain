

 class SocketRouter{
    constructor(io){
        this.handlers = {};
        this.io = io;
    }
    //根据事件绑定对应控制器
    set(event,controller){
        this.handlers[event] = controller;
    }
    //注册路由里面所有事件
    registerHandler(socket,event){
        let handler = this.handlers[event];
        socket.on(event,function(data){
            //强制检查socket的合法性
            if(event != 'login'){
                if(!socket.userid){
                    console.log("玩家还没登陆")
                    console.log(event)
                    return socket.emit("user_error",{errmsg:"玩家还没登陆"});
                }
            }
            handler(socket,data);
        });
    }
    //处理新socket连接
    connection(){
        this.io.sockets.on('connection',(socket)=>{
            console.log('一条连接')
            console.log(this.registerHandler)
            let getHandlers = this.handlers;
            for(let event in getHandlers){
                this.registerHandler(socket,event);
            }
            socket.emit("user_error",{errmsg:"玩家还没登陆"});
        });
    }
}


module.exports = SocketRouter